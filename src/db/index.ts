"use server";

import { PressReleaseAsset, PressReleaseBody } from "@/types/db-types";
import { sql } from "@vercel/postgres";

export async function setPressRelease(
  id: number,
  pressRelease: PressReleaseBody
): Promise<void> {
  const pressReleaseString = JSON.stringify(pressRelease);
  await sql`UPDATE pressreleases_assets SET pressrelease_body=${pressReleaseString} WHERE id=${id}`;
}

export async function getGeneratedPressRelease(
  id: number
): Promise<PressReleaseAsset> {
  try {
    const result = await sql`SELECT * FROM pressreleases_assets WHERE id=${id}`;
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
  pressRelease: PressReleaseBody
): Promise<PressReleaseAsset> {
  const pressReleaseString = JSON.stringify(pressRelease);
  const result =
    await sql`INSERT INTO pressreleases_assets (pressrelease_body) VALUES (${pressReleaseString}) RETURNING *`;
  const pressReleaseAsset = result.rows[0] as PressReleaseAsset;
  pressReleaseAsset.pressrelease_body = JSON.parse(
    result.rows[0].pressrelease_body
  );
  return pressReleaseAsset;
}

export async function setKeywords(id: number, keywords: string): Promise<void> {
  await sql`UPDATE pressreleases_assets SET keywords=${keywords} WHERE id=${id}`;
}

export async function setImageUrl(image: string, id: string): Promise<void> {
  await sql`UPDATE pressreleases_assets SET image_url=${image} WHERE id=${id}`;
}
