import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";

const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    await step.sleep("wait-a-moment", "1s");
    return { message: `Hello ${event.data.email}!` };
  },
);

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    helloWorld, // <-- This is where you'll always add all your functions
  ],
});


