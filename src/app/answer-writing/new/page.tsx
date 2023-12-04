import ChatUi from "@/components/ChatUi";
// import QuestionList from "@/components/QuestionListFunc";
import Questions from "@/components/qna/Questions";
import React from "react";

interface Question {
  id: number;
  title: string;
  description: string;
}
const questions: Question[] = [
  {
    id: 1,
    title: "Question 1",
    description:
      "Does transpiration serve any useful function in the plants? Explain.",
  },
  {
    id: 2,
    title: "Question 2",
    description: `Why is transport of materials necessary in a plant or in an animal?
    Explain.`,
  },
  {
    id: 3,
    title: "Question 3",
    description: `Draw a diagram of the human excretory system and label the various
    parts.`,
  },
  {
    id: 4,
    title: "Question 4",
    description: `Why is transport of materials necessary in a plant or in an animal?
    Explain.`,
  },
  {
    id: 5,
    title: "Question 5",
    description: `Draw a diagram of the human excretory system and label the various
    parts.`,
  },
];

const Page = async () => {
  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto  w-full max-w-8xl grow lg:flex xl:px-2">
        <Questions areQuestion={false} isLoading={false} />
        <ChatUi disabledBtn={true} />
      </div>
    </div>
  );
};

export default Page;
