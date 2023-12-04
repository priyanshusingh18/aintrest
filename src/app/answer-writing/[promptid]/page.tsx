import ChatUi from "@/components/ChatUi";
import QuestionList from "@/components/QuestionListFunc";

import Questions from "@/components/qna/Questions";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";
import React from "react";
interface PageProps {
  params: {
    promptid: number;
  };
}
const Page = async ({ params }: PageProps) => {
  const { promptid } = params;
  const { getUser } = getKindeServerSession();
  const user = getUser();
  if (!user || !user.id)
    redirect(`/auth-callback?origin=answer-writing/${promptid}`);
  const questions = await db.question.findMany({
    where: {
      promptId: Number(promptid),
      userId: user.id,
    },
  });
  console.log(questions);

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto  w-full max-w-8xl grow lg:flex xl:px-2">
        <Questions
          areQuestion={true}
          isLoading={false}
          questionArr={questions}
        />
        <ChatUi disabledBtn={true} />
      </div>
    </div>
  );
};

export default Page;
