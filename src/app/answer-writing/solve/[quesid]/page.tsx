import QnAChatWrapper from "@/components/qna/QnAChatWrapper";
import Questions from "@/components/qna/Questions";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
interface ChatWrapperProps {
  params: {
    quesid: number;
  };
}
const Page = async ({ params }: ChatWrapperProps) => {
  const { quesid } = params;
  const { getUser } = getKindeServerSession();
  const user = getUser();
  console.log(user, "WHY");
  if (!user || !user.id) console.log(user);
  // redirect(`/auth-callback?origin=answer-writing/${quesid}`);
  const config = {
    id: Number(quesid),
    userId: user.id!,
  };
  console.log(config);
  const promptAndQuestions = await db.question.findMany({
    where: {
      prompt: {
        questions: {
          some: config,
        },
      },
    },
  });
  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto  w-full max-w-8xl grow lg:flex xl:px-2">
        <Questions
          areQuestion={true}
          questionArr={promptAndQuestions}
          active={quesid}
          isLoading={false}
        />
        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <QnAChatWrapper questionId={quesid} />
        </div>
      </div>
    </div>
  );
};

export default Page;
