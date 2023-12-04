// "use client";
import React, { ReactNode, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Loader2, MessageSquare, Send } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { NextResponse } from "next/server";
import { trpc } from "@/app/_trpc/client";
import Skeleton from "react-loading-skeleton";

interface Question {
  id: number;
  title: string;
  description: string;
}

interface QuestionListProps {
  questions: Question[];
}
const answerPrompt = (
  <div className="absolute grainy bottom-0 left-0 w-full">
    <div className="mx-2 flex  flex-row gap-3 md:mx-4  lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
      <div className="relative  flex h-full flex-1 items-stretch md:flex-col">
        <div className="relative grainy  flex flex-col w-full flex-grow p-4">
          <div className="relative pt-2">
            <Textarea
              autoFocus
              rows={1}
              maxRows={4}
              className="resize-none  pr-12 text-base py-3 scrollbar-thumb-rounded scrollbar-thumb-blue scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch "
              placeholder="Enter your question..."
            />
            <Button
              className="absolute bottom-1.5 right-[8px]"
              aria-label="send messages"
              type="submit"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const chatTsx = (
  <div className="flex max-h-[calc(100vh-3.5rem-7rem)] w-full mb-28  border-nic-200 flex-1 flex-col-reverse gap-4 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrollin-touch">
    <div className="flex-1 flex flex-col items-center justify-center gap-2">
      <MessageSquare className="w-h-8 w-8 text-blue-500" />
      <h3 className="font-semibold text-xl"></h3>
      <p className="text-zinc-500 text-sm">
        Ask your first question to get started.
      </p>
    </div>
  </div>
);
const QuestionList = () => {
  const [qnsPrompt, setQnsPrompt] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [questionList, setQuestionList] = useState<Question[]>([]);

  const { isLoading, data, mutate, isSuccess } =
    trpc.questions.getQuestions.useMutation();
  const questionArr = data?.questionArr;
  const handleTakeQuestion = () => {
    mutate({ message: qnsPrompt });
  };

  const handleSubmitAnswer = () => {};

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh-3.5rem)]">
      <div className="mx-auto  w-full max-w-8xl grow lg:flex xl:px-2">
        <div className="flex-1 flex relative">
          {isLoading ? (
            <div className="flex m-auto self-center items-center justify-center">
              <Loader2 className="my-24 h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="px-4 h-[calc(100vh-3.5rem-5rem)] w-full overflow-y-auto py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
              {questionArr && questionArr.length > 1 ? (
                questionArr.map((question) => {
                  return (
                    <div
                      key={question.id}
                      className=" colspan-1 divide-y divide-gray-200 rounded-lg bg-white shadow transition hover:shadow-lg w-full p-4 mb-4"
                    >
                      <h3 className="font-semibold text-xl mb-2">
                        {question.question}
                      </h3>

                      <Button>Take Question</Button>
                    </div>
                  );
                })
              ) : (
                <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2  ">
                  <div className="flex-1 justify-between flex flex-col ">
                    {chatTsx}
                  </div>{" "}
                </div>
              )}
            </div>
          )}

          <div className="absolute bottom-0 left-0 w-full">
            <div className="mx-2 flex  flex-row ">
              <div className="relative  flex h-full flex-1 items-stretch md:flex-col">
                <div className="relative grainy  flex flex-col w-full flex-grow p-4">
                  <div className="relative pt-2">
                    <Textarea
                      autoFocus
                      rows={1}
                      ref={textareaRef}
                      maxRows={4}
                      value={qnsPrompt}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && event.shiftKey) {
                          event.preventDefault();
                          // getQuestions({ message: qnsPrompt });
                          handleTakeQuestion();
                          textareaRef.current?.focus();
                        }
                      }}
                      onChange={(e) => setQnsPrompt(e.target.value)}
                      className="resize-none  pr-12 text-base py-3 scrollbar-thumb-rounded scrollbar-thumb-blue scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch "
                      placeholder="Enter your question..."
                    />
                    <Button
                      disabled={isLoading}
                      className="absolute bottom-1.5 right-[8px]"
                      aria-label="send messages"
                      type="submit"
                      onClick={() => {
                        handleTakeQuestion();
                        textareaRef.current?.focus();
                      }}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
          <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2  ">
            {isLoading ? (
              <> {chatTsx} </>
            ) : (
              <div className="flex max-h-[calc(100vh-3.5rem-7rem)] mb-28  border-nic-200 flex-1 flex-col-reverse gap-4 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrollin-touch">
                <div className="flex-1 justify-between flex flex-col ">
                  <div className="w-full flex flex-col gap-2">
                    <Skeleton className="w-full h-14 my-8" />
                    <Skeleton className="w-full h-14 my-8" />

                    <Skeleton className="w-full h-14 my-8" />
                    <Skeleton className="w-full h-14 my-8" />
                    <Skeleton className="w-full h-14 my-2" />
                  </div>
                </div>{" "}
              </div>
            )}

            {answerPrompt}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionList;
