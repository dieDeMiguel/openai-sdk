import { openai } from "@/ai";
import { createPressRelease, setLanguage } from "@/db";
import EditorBlocksSchema from "@/schemas/press-release-schema";
import { PressReleaseAsset } from "@/types/db-types";
import { zodResponseFormat } from "openai/helpers/zod";

const SYSTEM_CONTEXT = (language: string) => `
  You are a press release generator.
  Your job is to create a press release based on the given prompt, and the content should be in ${language}.
  Both content and language will be determined by the prompt.
  You should ensure the press release is well-structured, informative, and engaging.
  You have a strong command of language and can write in a professional tone.
  You are very knowledgeable about current events and trends. Avoid adding: "For immediate release",
  [Company Information], Contact: [Name] [Title] [Email] [Phone]. Only send the body of the press release.
  Do not include date, location, or other metadata. Do not add hashtags or social media handles. Title should be the first line.
`;

export async function generatePressRelease(
  prompt: string
): Promise<PressReleaseAsset> {
  let detectedLanguage: string;
  let pressReleaseContent: string;
  try {
    // Detect language
    const languageDetectionResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Detect the language of the following text: "${prompt}"`,
        },
      ],
    });

    detectedLanguage =
      languageDetectionResponse.choices[0]?.message?.content?.trim() ??
      "unknown";
  } catch (error) {
    console.error("Error detecting language:", error);
    throw new Error("Failed to detect language");
  }

  try {
    // Generate the press release
    const pressReleaseResponse = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: SYSTEM_CONTEXT(detectedLanguage),
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: zodResponseFormat(EditorBlocksSchema, "press_release"),
      max_tokens: 800,
    });

    pressReleaseContent = JSON.stringify(
      pressReleaseResponse.choices[0].message.parsed
    );
    if (!pressReleaseContent) {
      throw new Error("Failed to generate press release content");
    }
  } catch (error) {
    console.error("Error generating press release:", error);
    throw new Error("Failed to generate press release");
  }

  try {
    const pressReleaseEntry = await createPressRelease(
      JSON.stringify(pressReleaseContent)
    );
    if (!pressReleaseEntry) {
      throw new Error("Failed to create press release entry");
    }
    await setLanguage(pressReleaseEntry?.id, detectedLanguage);
    return pressReleaseEntry;
  } catch (error) {
    console.error("Error creating press release entry:", error);
    throw new Error("Failed to create press release entry");
  }
}
