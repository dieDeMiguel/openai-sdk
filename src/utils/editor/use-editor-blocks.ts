import { PressReleaseAsset } from "@/types/db-types";
import { OutputBlockData } from "@editorjs/editorjs";
import { useMemo } from "react";
import { v4 as uuidv4 } from "uuid";

const useEditorBlocks = (data: PressReleaseAsset | null | undefined) =>
  useMemo(() => {
    if (data?.pressrelease_body) {
      const parsedBody =
        typeof data?.pressrelease_body === "string"
          ? JSON.parse(data?.pressrelease_body)
          : null;
      return parsedBody?.blocks?.map((block: OutputBlockData) => ({
        ...block,
        id: block.id || uuidv4(),
      }));
    }
  }, [data]);

export default useEditorBlocks;
