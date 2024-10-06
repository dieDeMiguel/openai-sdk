"use client";

import { useToast } from "@/hooks/use-toast";
import useInitializeEditor from "@/hooks/useInitializeEditor";
import { cn } from "@/lib/utils";
import { PressReleaseAsset } from "@/types/db-types";
import useEditorBlocks from "@/utils/editor/use-editor-blocks";
import EditorJS from "@editorjs/editorjs";
import { useRef } from "react";
import "./editor.css";
interface EditorProps {
  sectionID: keyof PressReleaseAsset;
  className?: string;
  wrapperClassName?: string;
  pressRelease: PressReleaseAsset;
  isReadOnly: boolean;
}

const Editor: React.FC<EditorProps> = ({
  sectionID,
  className = "",
  wrapperClassName = "",
  pressRelease,
  isReadOnly,
}) => {
  const editorRef = useRef<EditorJS | null>(null);
  const blocks = useEditorBlocks(pressRelease);
  const { toast } = useToast();

  const handleSaveChanges = async () => {
    if (editorRef.current) {
      editorRef.current.save().then(async (outputData) => {
        const content = outputData?.blocks[0]?.data?.text;
        if (!content) return;
        try {
          await fetch(`/api/update-press-release`, {
            method: "POST",
            body: JSON.stringify({
              id: pressRelease.id,
              field: sectionID,
              value: content,
            }),
            headers: {
              "Content-Type": "application/json",
            },
          });
          toast({
            description: "Your content has been saved",
            className: "bg-blue-500 text-white",
          });
        } catch (error) {
          console.error("Error saving changes:", error);
        }
      });
    }
  };

  useInitializeEditor(
    editorRef,
    true,
    sectionID,
    blocks,
    isReadOnly,
    handleSaveChanges
  );
  return (
    <div className={cn("editor-wrapper", wrapperClassName)}>
      <div
        id={`${sectionID}`}
        key={`${sectionID}`}
        className={cn("editor-content text-black", className)}
      />
    </div>
  );
};

export default Editor;
