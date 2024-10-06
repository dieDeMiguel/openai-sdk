import { OutputBlockData } from "@editorjs/editorjs";

export interface PressReleaseBody {
  blocks: OutputBlockData[];
}

export type PressReleaseAsset = {
  id: number;
  pressrelease_body: PressReleaseBody;
  language: string;
  keywords: string;
  image_url: string;
  image_caption: string;
};
