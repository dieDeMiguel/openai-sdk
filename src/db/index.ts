"use server";

import { PressReleaseAsset } from "@/types/db-types";
import { sql } from "@vercel/postgres";

interface Block {
  type: string;
  data: {
    text: string;
  };
  id: string;
}

interface PressReleaseBody {
  blocks: Block[];
}

export async function setPressRelease(
  id: number,
  pressRelease: PressReleaseBody
): Promise<void> {
  const pressReleaseString = JSON.stringify(pressRelease);
  await sql`UPDATE pressreleases_assets_jsonb SET pressrelease_body=${pressReleaseString} WHERE id=${id}`;
}

export async function getGeneratedPressRelease(
  id: number
): Promise<PressReleaseAsset> {
  try {
    const result =
      await sql`SELECT * FROM pressreleases_assets_jsonb WHERE id=${id}`;
    if (result.rows.length === 0) {
      throw new Error(`No press release found with id ${id}`);
    }
    const pressReleaseAsset = result.rows[0] as PressReleaseAsset;
    pressReleaseAsset.pressrelease_body = JSON.parse(
      result.rows[0].pressrelease_body
    );
    return pressReleaseAsset;
  } catch (error) {
    console.error("Error fetching press release:", error);
    throw error;
  }
}

export async function createPressRelease(
  pressRelease: string
): Promise<PressReleaseAsset> {
  const result =
    await sql`INSERT INTO pressreleases_assets_jsonb (pressrelease_body) VALUES (${pressRelease}) RETURNING *`;
  const pressReleaseAsset = result.rows[0] as PressReleaseAsset;
  pressReleaseAsset.pressrelease_body = JSON.parse(
    result.rows[0].pressrelease_body
  );
  return pressReleaseAsset;
}

export async function setKeywords(id: number, keywords: string): Promise<void> {
  await sql`UPDATE pressreleases_assets_jsonb SET keywords=${keywords} WHERE id=${id}`;
}

export async function setImageUrl(image: string, id: string): Promise<void> {
  await sql`UPDATE pressreleases_assets_jsonb SET image_url=${image} WHERE id=${id}`;
}

export async function setImageCaption(
  id: number,
  caption: string
): Promise<void> {
  await sql`UPDATE pressreleases_assets_jsonb SET image_caption=${caption} WHERE id=${id}`;
}

export async function updatePressReleaseField(
  id: number,
  field: "pressrelease_body",
  value: PressReleaseBody
): Promise<void> {
  if (field === "pressrelease_body") {
    const valueString = JSON.stringify(value);
    await sql`UPDATE pressreleases_assets_jsonb SET pressrelease_body=${valueString} WHERE id=${id}`;
  } else {
    throw new Error("Invalid field specified");
  }
}

export async function setLanguage(id: number, language: string): Promise<void> {
  await sql`UPDATE pressreleases_assets_jsonb SET language=${language} WHERE id=${id}`;
}
