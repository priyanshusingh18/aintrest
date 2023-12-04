import { trpc } from "@/app/_trpc/client";
import { useContext, useEffect, useRef } from "react";
import React from "react";
import Skeleton from "react-loading-skeleton";
import Message from "./Message";
import { QnAChatContext } from "./QNAChatContext";
import { MessageSquare } from "lucide-react";

interface MessagesProps {
  questionId: number;
}

const QnAMessages = ({ questionId }: MessagesProps) => {
  const { isLoading: isAiThinking } = useContext(QnAChatContext);

  const { data, isLoading } = trpc.questions.getQnAMessages.useQuery({
    quesId: Number(questionId),
  });
  const messages = data?.QnAMessages;
  const loadingMessage = {
    createdAt: new Date().toISOString(),
    id: 999991,
    isUserMessage: false,
    text: "loading",
    audioUrl: null,
  };
  const combinedMessages = [
    ...(isAiThinking ? [loadingMessage] : []),
    ...(messages ?? []),
  ];

  const lastMessageRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] mb-28  border-nic-200 flex-1 flex-col-reverse gap-4 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrollin-touch">
      {combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((message, i) => {
          const isNextMessageSamePerson =
            combinedMessages[i - 1]?.isUserMessage ===
            combinedMessages[i].isUserMessage;
          if (i === combinedMessages.length - 1) {
            return (
              <Message
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
                key={message.id}
              />
            );
          } else
            return (
              <Message
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
                key={message.id}
              />
            );
        })
      ) : isLoading ? (
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="w-full" />
          <Skeleton className="w-full" />
          <Skeleton className="w-full" />
          <Skeleton className="w-full" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="w-h-8 w-8 text-blue-500" />
          <h3 className="font-semibold text-xl"></h3>
          <p className="text-zinc-500 text-sm">
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default QnAMessages;
