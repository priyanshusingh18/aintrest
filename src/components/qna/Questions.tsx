"use client";
import "regenerator-runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import { Loader2, MessageSquare, Mic, Send } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";

import { trpc } from "@/app/_trpc/client";
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
interface Question {
  id: number;
  question: string;
  userId: string;
  score: number | null;
  active: boolean;
  promptId: number;
  createdAt: Date;
  updatedAt: Date;
}

interface QuestionListProps {
  questionArr?: Question[];
  isLoading: boolean;
  areQuestion?: boolean;
  active?: number;
}
const Questions = ({
  areQuestion,
  questionArr,
  isLoading,
  active,
}: QuestionListProps) => {
  const [qnsPrompt, setQnsPrompt] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const router = useRouter();

  const handlesumbit = ({ message }: { message: string }) => {
    getQuestions({ message });
  };
  const commands = [
    {
      command: "stop listening",
      callback: () => [SpeechRecognition.stopListening(), resetTranscript()],
      isFuzzyMatch: true,
    },
  ];
  const {
    finalTranscript,
    resetTranscript,
    listening,
    transcript,
    interimTranscript,
  } = useSpeechRecognition({
    commands,
  });

  const startListening = () => {
    if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    resetTranscript();
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });
  };
  const stopListening = () => SpeechRecognition.stopListening();

  // useEffect(() => {
  //   if (finalTranscript.trim()) {
  //     setQnsPrompt((prevText) => prevText + finalTranscript + " ");
  //   }

  //   resetTranscript();
  // }, [finalTranscript]);

  const { isLoading: loadingPrompt, mutate: getQuestions } =
    trpc.questions.getQuestions.useMutation({
      onError(error, variables, context) {
        console.log("WHY", error);
      },
      onSuccess({ promptId }, variables, context) {
        router.push(`/answer-writing/${promptId}`);
      },
      onSettled(data, error, variables, context) {
        console.log(data, error, variables, context);
      },
    });
  return (
    <div className="flex-1 flex relative">
      {isLoading || loadingPrompt ? (
        <div className="flex m-auto self-center items-center justify-center">
          <Loader2 className="my-24 h-6 w-6 animate-spin" />
        </div>
      ) : (
        <div className="px-4 h-[calc(100vh-3.5rem-5rem)] w-full overflow-y-auto py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
          {areQuestion && questionArr && questionArr.length > 0 ? (
            questionArr.map((question) => {
              return (
                <div
                  key={question.id}
                  className={`colspan-1 divide-y divide-gray-200 rounded-lg  ${
                    active == question.id
                      ? "bg-gradient-to-r from-cyan-100 to-blue-100"
                      : "bg-white"
                  }  shadow transition hover:shadow-lg w-full p-4 mb-4`}
                >
                  <h3 className="font-semibold text-xl mb-2">
                    {question.question}
                  </h3>

                  <Button
                    onClick={() => {
                      router.push(`/answer-writing/solve/${question.id}`);
                    }}
                  >
                    Take Question
                  </Button>
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
                          handlesumbit({ message: qnsPrompt });
                          // handleTakeQuestion();
                          textareaRef.current?.focus();
                        }
                      }}
                      onChange={(e) => setQnsPrompt(e.target.value)}
                      className="resize-none  pr-12 text-base py-3 scrollbar-thumb-rounded scrollbar-thumb-blue scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch "
                      placeholder="Enter your question..."
                    />
                    {/* <Button
                      disabled={isLoading || loadingPrompt}
                      className={`absolute bottom-1.5 right-[58px] ${
                        listening ? "animate-pulse" : ""
                      } ${
                        listening ? "bg-red-500" : "bg-gray-400"
                      }  hover:bg-gray-700`}
                      aria-label="send messages"
                      type="submit"
                      onClick={() => {
                        listening
                          ? SpeechRecognition.stopListening()
                          : startListening();
                      }}
                    >
                      <Mic className="h-4 w-4" />
                    </Button> */}
                    <Button
                      disabled={isLoading || loadingPrompt}
                      className="absolute bottom-1.5 right-[8px]"
                      aria-label="send messages"
                      type="submit"
                      onClick={() => {
                        // handleTakeQuestion();
                        handlesumbit({ message: qnsPrompt });
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
      )}
    </div>
  );
};

export default Questions;
