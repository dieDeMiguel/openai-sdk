"use client";
import Editor from "@/components/editor/editor";
import { FileUploadButton } from "@/components/image-uploader/image-uploader";
import { Badge } from "@/components/ui/badge";
import { PressReleaseAsset } from "@/db";

import { inngest } from "@/inngest/client";
import useEditorBlocks from "@/utils/editor/memoise-editor-block";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function Page({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const [enablePressReleaseQuery, setEnablePressReleaseQuery] = useState(true);
  const [enableKeywordsQuery, setEnableKeywordsQuery] = useState(false);
  const [enableCaptionQuery, setEnableCaptionQuery] = useState(true);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [image, setImage] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageWasUploaded, setImageWasUploaded] = useState(false);

  const { id } = params;
  const refetchInterval = 400;

  const { data } = useQuery<PressReleaseAsset | null>({
    queryKey: ["pressRelease", id],
    queryFn: async () => {
      const text = await fetch(`/api/press-release/get-press-release?id=${id}`);
      const result = await text.json();
      return result.pressRelease;
    },
    refetchInterval: refetchInterval,
    enabled: enablePressReleaseQuery,
  });

  useEffect(() => {
    if (data?.image) {
      setImage(data.image);
    }
    if (data?.image_caption) {
      setImageCaption(data.image_caption);
    }
    setEnablePressReleaseQuery(!data?.pressrelease_completed);
  }, [data]);

  useEffect(() => {
    if (enablePressReleaseQuery) return;
    const sendKeywords = async () => {
      try {
        await inngest.send({
          name: "generate/keywords",
          data: {
            prompt: data?.pressrelease,
            id,
          },
        });
        setEnableKeywordsQuery(true);
      } catch (error) {
        console.error("Error generating keywords:", error);
      }
    };
    sendKeywords();
  }, [enablePressReleaseQuery, data?.pressrelease, id]);

  const editorBlocks = useEditorBlocks(data);

  const { data: keywordsData } = useQuery<PressReleaseAsset | null>({
    queryKey: ["keywords", id],
    queryFn: async () => {
      const response = await fetch(`/api/keywords/get-keywords?id=${id}`);
      const result = await response.json();
      return result.text;
    },
    refetchInterval: refetchInterval,
    enabled: enableKeywordsQuery,
  });

  useEffect(() => {
    setEnableKeywordsQuery(!keywordsData?.keywords_completed);
  }, [keywordsData?.keywords_completed]);

  useEffect(() => {
    if (!keywordsData?.keywords) return;
    const keywordsList = keywordsData.keywords.split(",");
    setKeywords(keywordsList);
  }, [keywordsData?.keywords]);

  const { data: imageData } = useQuery<PressReleaseAsset | null>({
    queryKey: ["caption", id],
    queryFn: async () => {
      const text = await fetch(`/api/press-release/get-press-release?id=${id}`);
      const result = await text.json();
      return result.pressRelease;
    },
    refetchInterval: refetchInterval,
    enabled: imageWasUploaded && enableCaptionQuery,
  });

  useEffect(() => {
    if (!imageData?.image && !imageData?.image_caption) return;
    setEnableCaptionQuery(!imageData.image_caption_completed);
    setImage(imageData?.image || "");
    setImageCaption(imageData?.image_caption || "");
  }, [imageData]);

  return (
    <div className="w-3/4 lg:w-1/2 p-4 shadow-md h-full overflow-auto">
      <FileUploadButton
        className={"mb-xxl"}
        id={id}
        setImageWasUploaded={setImageWasUploaded}
      />
      <div className="py-[50px] bg-white p-4 h-full rounded-lg">
        <Editor
          sectionID="editor"
          data={editorBlocks}
          wrapperClassName="editor-wrapper"
          className="editor-content"
          isReadOnly={!data?.pressrelease_completed}
        />
        <div className="py-4">
          <div className="py-4">
            {keywords?.length > 0 && (
              <ul className="text-black list-disc pl-5">
                {keywords.map((keyword, index) => (
                  <Badge className="inline-block mx-1" key={index}>
                    {keyword}
                  </Badge>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="image-container">
          {image && (
            <Image
              src={image}
              width={300}
              height={200}
              alt="Generated press release image"
              className="w-full"
            />
          )}
          {imageCaption && (
            <p className="text-center text-sm text-gray-500">{imageCaption}</p>
          )}
        </div>
      </div>
    </div>
  );
}
