"use client";

import { trpc } from "@/app/_trpc/client";
import { ChevronDown, ChevronLeft, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";
import QnAChatInput from "./QNAInput";
import { QnAContextProvider } from "./QNAChatContext";
import QnAMessages from "./Messages";
interface ChatWrapperProps {
  questionId: number;
}
const QnAChatWrapper = ({ questionId }: ChatWrapperProps) => {
  return (
    <QnAContextProvider questionId={questionId}>
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2  ">
        <div className="flex-1 justify-between flex flex-col">
          <QnAMessages questionId={questionId} />
        </div>
        <QnAChatInput isDisabled={false} />
      </div>
    </QnAContextProvider>
  );
};

export default QnAChatWrapper;
