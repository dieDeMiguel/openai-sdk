import ImageKeywordsContainer from "@/components/image-uploader/image-keywords-container";
import EditorPlaceholder from "@/components/ui/editor-placeholder";
import { getGeneratedPressRelease } from "@/db";
import dynamic from "next/dynamic";
import { headers } from "next/headers";
import Link from "next/link";

const Editor = dynamic(() => import("@/components/editor/editor"), {
  ssr: false,
  loading: () => <EditorPlaceholder />,
});

export default async function Page() {
  const headerList = headers();
  const pathname = headerList.get("x-current-path");
  const id = pathname?.split("/").pop() || "";
  const numericId = parseInt(id, 10);
  const pressRelease = await getGeneratedPressRelease(numericId);
  return (
    <div className="max-w-maxWidthEditorCanvas w-full lg:w-3/4 shadow-md h-full overflow-auto bg-white px-4 py-8 lg:px-6 rounded-lg flex flex-col gap-8">
      <Editor
        sectionID="pressrelease_body"
        pressRelease={pressRelease}
        wrapperClassName=""
        className="editor-content"
        isReadOnly={false}
      />
      <ImageKeywordsContainer {...pressRelease} />
      <Link
        href="/impressum"
        className="block text-center text-gray-500 hover:text-black cursor-pointer max-w-[var(--size-1200)] m-auto"
      >
        Impressum
      </Link>
    </div>
  );
}
