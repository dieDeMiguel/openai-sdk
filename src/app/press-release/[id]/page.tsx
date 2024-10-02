"use client";
import Editor from "@/components/editor/editor";
import { FileUploadButton } from "@/components/image-uploader/image-uploader";
import { Badge } from "@/components/ui/badge";
import { PressReleaseAsset } from "@/db";
import useEditorBlocks from "@/utils/editor/memoise-editor-block";
import Image from "next/image";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";

export default function Page({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const [enablePressReleaseQuery, setEnablePressReleaseQuery] = useState(true);
  const [enableCaptionQuery, setEnableCaptionQuery] = useState(true);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [image, setImage] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageWasUploaded, setImageWasUploaded] = useState(false);
  const [title, setTitle] = useState([
    {
      type: "paragraph",
      data: {
        text: "",
      },
      id: uuidv4(),
    },
  ]);
  const [data, setData] = useState<PressReleaseAsset | null>(null);
  const [imageData, setImageData] = useState<PressReleaseAsset | null>(null);

  const { id } = params;
  const refetchInterval = 400;

  useEffect(() => {
    if (!enablePressReleaseQuery) return;

    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/press-release/get-press-release?id=${id}`
        );
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        const result = await response.json();
        setData(result.pressRelease ?? null);
      } catch (error) {
        console.error("Error fetching press release:", error);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, refetchInterval);
    return () => clearInterval(intervalId);
  }, [id, refetchInterval, enablePressReleaseQuery]);

  useEffect(() => {
    if (data?.image) {
      setImage(data.image);
    }
    if (data?.image_caption) {
      setImageCaption(data.image_caption);
    }
    setEnablePressReleaseQuery(!data?.pressrelease_completed);
  }, [data]);

  const editorBlocks = useEditorBlocks(data);

  useEffect(() => {
    if (enablePressReleaseQuery) return;
    const generateKeywords = async () => {
      try {
        const { title, keywords } = await generateKeywords(
          data?.pressrelease || "",
          id
        );
        setTitle((prevTitle) => [
          {
            ...prevTitle[0],
            data: {
              ...prevTitle[0].data,
              text: title,
            },
          },
        ]);
        setKeywords(keywords);
      } catch (error) {
        console.error("Error generating keywords:", error);
      }
    };
    generateKeywords();
  }, [data?.pressrelease, enablePressReleaseQuery]);

  useEffect(() => {
    if (!imageWasUploaded || !enableCaptionQuery) return;
    const fetchData = async () => {
      try {
        const response = await fetch(
          `/api/press-release/get-press-release?id=${id}`
        );
        if (!response.ok) {
          throw new Error(`Network response was not ok: ${response.status}`);
        }
        const result = await response.json();
        setImageData(result?.pressRelease ?? null);
      } catch (error) {
        console.error("Error fetching press release:", error);
      }
    };
    fetchData();
    const intervalId = setInterval(fetchData, refetchInterval);
    return () => clearInterval(intervalId);
  }, [id, refetchInterval, imageWasUploaded, enableCaptionQuery]);

  useEffect(() => {
    setEnableCaptionQuery(!imageData?.image_caption_completed);
    if (!imageData?.image && !imageData?.image_caption) return;
    setImage(imageData?.image || "");
    setImageCaption(imageData?.image_caption || "");
  }, [imageData]);

  return (
    <div className="w-[900px] px-14 shadow-md h-full overflow-auto">
      <div className="bg-white py-8 px-6 h-full rounded-lg">
        <Editor
          sectionID="title"
          data={title}
          wrapperClassName=""
          className="text-2xl font-bold"
          isReadOnly={enablePressReleaseQuery}
        />
        <Editor
          sectionID="editor"
          data={editorBlocks}
          wrapperClassName=""
          className="editor-content"
          isReadOnly={enablePressReleaseQuery}
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
        <div className="px-6 w-full text-center">
          {image ? (
            <div>
              <Image
                src={image}
                width={300}
                height={200}
                alt="Generated press release image"
                className="w-full"
              />
              <p className="text-center text-sm text-gray-500">
                {imageCaption}
              </p>
            </div>
          ) : (
            !enablePressReleaseQuery && (
              <FileUploadButton
                className={"mt-20"}
                id={id}
                setImageWasUploaded={setImageWasUploaded}
                pressRelease={data?.pressrelease || ""}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
