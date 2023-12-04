"use client";
import { Send, MessageSquare } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";

const chatTsx = (
  <div className="flex max-h-[calc(100vh-3.5rem-7rem)] w-full mb-28  border-nic-200 flex-1 flex-col-reverse gap-4 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrollin-touch">
    <div className="flex-1 flex flex-col items-center justify-center gap-2">
      <MessageSquare className="w-h-8 w-8 text-blue-500" />
      <h3 className="font-semibold text-xl"></h3>
      <p className="text-zinc-500 text-sm">
        Please select a question to begin.
      </p>
    </div>
  </div>
);
interface ChatUiProps {
  disabledBtn: boolean;
}
const ChatUi = ({ disabledBtn }: ChatUiProps) => {
  return (
    <div className="shrink-0 flex-[0.75] border-t border-gray-200 lg:w-96 lg:border-l lg:border-t-0">
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2  ">
        {chatTsx}

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
                    onClick={() => {
                      console.log("Sending...");
                    }}
                    // disabled={true}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatUi;
