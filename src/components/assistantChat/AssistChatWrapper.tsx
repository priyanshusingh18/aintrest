"use client";

import { trpc } from "@/app/_trpc/client";
import {
  ChevronDown,
  ChevronLeft,
  Loader2,
  MessageSquare,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import ChatInput from "./AssistChatInput";
import { AssistContext, AssistContextProvider } from "./ChatContext";
import Messages from "./Messages";
import { useContext, useEffect } from "react";
import { useQueryState } from "next-usequerystate";
interface ChatWrapperProps {
  threadId: string | null;
  fileId: string;
}
const AssistChatWrapper = ({ threadId, fileId }: ChatWrapperProps) => {
  //   const { threadCreated, isLoading } = useContext(AssistContext);

  const [thread, setThread] = useQueryState("threadId");

  const setThreadUrl = (threadUrl: string) => {
    if (threadUrl.length > 10) setThread(threadUrl);
  };
  return (
    <AssistContextProvider
      setThreadUrl={setThreadUrl}
      threadId={threadId}
      fileId={fileId}
    >
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2  ">
        <div className="flex-1 justify-between flex flex-col">
          {threadId ? (
            <Messages threadId={threadId} />
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
        <ChatInput isDisabled={false} />
      </div>
    </AssistContextProvider>
  );
};

export default AssistChatWrapper;
