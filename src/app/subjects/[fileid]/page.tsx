import AssistChatWrapper from "@/components/assistantChat/AssistChatWrapper";
import PdfRenderer from "@/components/PdfRenderer";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: {
    fileid: string;
  };
  searchParams: { [key: string]: string | undefined | null };
}

const Page = async ({ params, searchParams }: PageProps) => {
  const { fileid } = params;
  const { getUser } = getKindeServerSession();
  const user = getUser();
  if (!user || !user.id) redirect(`/auth-callback?origin=subjects/${fileid}`);
  const assistatnt = await db.assistant.findFirst({
    where: {
      bookCount: 1,
      books: {
        every: {
          fileId: fileid,
        },
      },
    },
  });
  const file = await db.books.findFirst({
    where: {
      fileId: fileid,
    },
  });

  let { threadId } = searchParams;
  if (!threadId) threadId = null;
  if (!file) notFound();

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/*  LEFT SIDE */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            {/* Main area */}
            <PdfRenderer url={file.url} />
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <AssistChatWrapper threadId={threadId} fileId={fileid} />
        </div>
      </div>
    </div>
  );
};

export default Page;
