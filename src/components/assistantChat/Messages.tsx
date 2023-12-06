import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";

import { useContext, useEffect, useRef } from "react";
import { Loader2, MessageSquare } from "lucide-react";
import React from "react";
import Skeleton from "react-loading-skeleton";

import { useIntersection } from "@mantine/hooks";
import { AssistContext } from "./ChatContext";
import Message from "./Message";
import { ExtendedMessageAssistant } from "@/types/message";

interface MessagesProps {
  threadId: string;
}
const emptyMessage = (
  <div className="flex-1 flex flex-col items-center justify-center gap-2">
    <MessageSquare className="w-h-8 w-8 text-blue-500" />
    <h3 className="font-semibold text-xl"></h3>
    <p className="text-zinc-500 text-sm">
      Ask your first question to get started.
    </p>
  </div>
);
const Messages = ({ threadId }: MessagesProps) => {
  const { isLoading: isAiThinking } = useContext(AssistContext);
  // if (!threadId) return emptyMessage;
  const { data, isLoading } = trpc.booksRouter.getMessages.useQuery({
    threadId: threadId,
  });
  const messages = data;

  const loadingMessage = {
    id: "loading-message",
    role: "assistant" || "user",
    created_at: Number(new Date().toISOString()),
    text: (
      <span className="flex h-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </span>
    ),
  };
  const combinedMessages = [
    ...(isAiThinking ? [loadingMessage] : []),
    ...(messages ?? []),
  ];

  const lastMessageRef = useRef<HTMLDivElement>(null);
  const { ref, entry } = useIntersection({
    root: lastMessageRef.current,
    threshold: 1,
  });
  console.log(threadId);
  if (!threadId)
    return (
      <div className="flex max-h-[calc(100vh-3.5rem-7rem)] mb-28  border-nic-200 flex-1 flex-col-reverse gap-4 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrollin-touch">
        <Message
          ref={ref}
          message={{
            text: "TEMP MESSAGE",
            id: "lkajsd",
            created_at: Number(new Date().toTimeString),
            role: "user",
          }}
          isNextMessageSamePerson={false}
          key={12}
        />
      </div>
    );
  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] mb-28  border-nic-200 flex-1 flex-col-reverse gap-4 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrollin-touch">
      {combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((message, i) => {
          const isNextMessageSamePerson =
            combinedMessages[i - 1]?.role === combinedMessages[i].role;
          if (i === combinedMessages.length - 1) {
            return (
              <Message
                ref={ref}
                message={message as ExtendedMessageAssistant}
                isNextMessageSamePerson={isNextMessageSamePerson}
                key={message.id}
              />
            );
          } else
            return (
              <Message
                ref={ref}
                message={message as ExtendedMessageAssistant}
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

export default Messages;
