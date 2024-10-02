import { pressRelease } from "@/ai/generate-press-release";
import { inngest } from "@/inngest/client";

export const throttleGeneratePressRelease = inngest.createFunction(
  {
    id: "generate-press-release",
    throttle: { limit: 1, period: "5s", burst: 2 },
  },
  { event: "generate/press-release" },
  async ({ event, step }) => {
    const { id, prompt } = event.data;
    const pressReleasePromise = await step.run(
      "add-press-release",
      async () => {
        return await pressRelease(id, prompt);
      }
    );
    return pressReleasePromise;
  }
);
