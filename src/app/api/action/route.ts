import { NextRequest, NextResponse } from "next/server";
import { streamText } from "ai";
import { z } from "zod";
import { db } from "@/lib/db/client";
import { tasksTable, messagesTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function performSmartHomeAction(params: {
  command: string;
  device: string;
  room: string;
  action: string;
}) {
  try {
    console.log("performSmartHomeAction called with params:", params);

    const [task] = await db
      .insert(tasksTable)
      .values({
        name: `Smart Home: ${params.action} ${params.device} in ${params.room}`,
        status: "pending",
      })
      .returning();

    console.log("Task created successfully:", task);

    await db.insert(messagesTable).values({
      content: `User command: ${params.command}`,
    });

    console.log("Message inserted successfully");

    await new Promise((resolve) => setTimeout(resolve, 4000));

    const shouldError = Math.random() < 0.1;

    if (shouldError) {
      const errorMessages = [
        "Device not responding",
        "Network connection failed",
        "Device is offline",
        "Invalid command for this device",
        "Permission denied",
      ];
      const errorMessage =
        errorMessages[Math.floor(Math.random() * errorMessages.length)];

      await db
        .update(tasksTable)
        .set({
          status: "failed",
          result: JSON.stringify({ error: errorMessage }),
          updated_at: new Date(),
        })
        .where(eq(tasksTable.id, task.id));

      return { success: false, error: errorMessage, taskId: task.id };
    } else {
      await db
        .update(tasksTable)
        .set({
          status: "succeeded",
          result: JSON.stringify({
            success: true,
            device: params.device,
            room: params.room,
            action: params.action,
          }),
          updated_at: new Date(),
        })
        .where(eq(tasksTable.id, task.id));

      return {
        success: true,
        message: `Successfully ${params.action} ${params.device} in ${params.room}`,
        taskId: task.id,
      };
    }
  } catch (error) {
    console.error("Error in performSmartHomeAction:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      params,
    });
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("=== /api/action POST request started ===");
    console.log(
      "Request headers:",
      Object.fromEntries(request.headers.entries()),
    );

    const authHeader = request.headers.get("X-AUTH");
    const expectedAuth = process.env.VAPI_AUTH_SECRET;

    console.log("Auth validation:", {
      authHeaderPresent: !!authHeader,
      authHeaderLength: authHeader?.length || 0,
      expectedAuthPresent: !!expectedAuth,
      expectedAuthLength: expectedAuth?.length || 0,
      authMatch: authHeader === expectedAuth,
    });

    if (!authHeader) {
      console.log("❌ Auth validation failed: No X-AUTH header provided");
      return NextResponse.json(
        { error: "Unauthorized - No auth header" },
        { status: 401 },
      );
    }

    if (!expectedAuth) {
      console.log("❌ Auth validation failed: VAPI_AUTH_SECRET not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (authHeader !== expectedAuth) {
      console.log("❌ Auth validation failed: Invalid auth token");
      return NextResponse.json(
        { error: "Unauthorized - Invalid token" },
        { status: 401 },
      );
    }

    console.log("✅ Auth validation passed");

    let body;
    try {
      body = await request.json();
      console.log("Request body parsed successfully:", body);
    } catch (parseError) {
      console.log("❌ JSON parsing failed:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const { command } = body;

    console.log("Command validation:", {
      commandPresent: command !== undefined,
      commandType: typeof command,
      commandValue: command,
      commandLength: typeof command === "string" ? command.length : "N/A",
    });

    if (command === undefined) {
      console.log("❌ Validation failed: Command parameter missing");
      return NextResponse.json(
        { error: "Command parameter is required" },
        { status: 400 },
      );
    }

    if (typeof command !== "string") {
      console.log(
        "❌ Validation failed: Command is not a string, got:",
        typeof command,
      );
      return NextResponse.json(
        { error: "Command must be a string" },
        { status: 400 },
      );
    }

    if (command.trim().length === 0) {
      console.log("❌ Validation failed: Command is empty string");
      return NextResponse.json(
        { error: "Command cannot be empty" },
        { status: 400 },
      );
    }

    console.log("✅ Command validation passed, proceeding with AI processing");

    let result;
    try {
      console.log("🤖 Starting AI text generation...");
      result = streamText({
        model: "openai/gpt-4.1",
        prompt: `Parse this smart home command and extract the device, room, and action: "${command}"

IMPORTANT: You MUST call the perform_smart_home_action tool with the parsed command parameters. Always provide a value for each parameter even if vague or unclear from the command. Never skip calling the tool.

- If device is unclear, use your best guess or "device"
- If room is unclear, use "room" or "everywhere" 
- If action is unclear, use your best guess or "control"

Always call the tool regardless of how ambiguous the command is.`,
        tools: {
          perform_smart_home_action: {
            description: "Perform a smart home action",
            inputSchema: z.object({
              command: z.string().describe("Full command"),
              device: z
                .string()
                .describe("Device type (e.g., light, lock, thermostat)"),
              room: z
                .string()
                .describe(
                  "Room name (e.g., office, bedroom, kitchen, or everywhere if none specified)",
                ),
              action: z
                .string()
                .describe(
                  "One word action (e.g., turnon, turnoff, lock, unlock, heat, cool)",
                ),
            }),
            execute: performSmartHomeAction,
          },
        },
      });
      console.log("✅ AI text generation initiated successfully");
    } catch (aiError) {
      console.error("❌ AI text generation failed:", aiError);
      console.error("AI error details:", {
        message: aiError instanceof Error ? aiError.message : String(aiError),
        stack: aiError instanceof Error ? aiError.stack : undefined,
        command,
      });
      return NextResponse.json(
        { error: "AI processing failed" },
        { status: 500 },
      );
    }

    try {
      console.log("⏳ Waiting for AI processing to complete...");
      await result.finishReason;
      console.log("✅ AI processing completed successfully");
    } catch (finishError) {
      console.error("❌ AI processing completion failed:", finishError);
      console.error("Finish error details:", {
        message:
          finishError instanceof Error
            ? finishError.message
            : String(finishError),
        stack: finishError instanceof Error ? finishError.stack : undefined,
        command,
      });
      return NextResponse.json(
        { error: "AI processing completion failed" },
        { status: 500 },
      );
    }

    console.log("🎉 Request completed successfully");
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("❌ Unexpected error in action endpoint:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      url: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
    });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
