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
    const authHeader = request.headers.get("X-AUTH");
    const expectedAuth = process.env.VAPI_AUTH_SECRET;

    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { command } = body;

    if (!command || typeof command !== "string") {
      return NextResponse.json(
        { error: "Command is required and must be a string" },
        { status: 400 },
      );
    }

    const result = streamText({
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

    await result.finishReason;

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Action endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
