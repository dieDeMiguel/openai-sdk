import { inngest } from "@/inngest/client";
import { throttleGenerateKeywords } from "@/inngest/generate-keywords";
import { throttleGeneratePressRelease } from "@/inngest/generate-press-release";
import { serve } from "inngest/next";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [throttleGeneratePressRelease, throttleGenerateKeywords],
});
