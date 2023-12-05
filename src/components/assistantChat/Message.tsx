import { cn } from "@/lib/utils";
import { ExtendedMessageAssistant } from "@/types/message";
import { Icons } from "../Icons";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { forwardRef } from "react";
import Player from "../audio/Player";

interface MessageProps {
  message: ExtendedMessageAssistant;
  isNextMessageSamePerson: boolean;
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMessageSamePerson }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-end", {
          "justify-end": message.role === "user",
        })}
      >
        <div
          className={cn(
            "relative flex h-6 w-6 aspect-square items-center justify-center",
            {
              "order-2 bg-blue-600 rounded-sm": message.role === "user",
              "order-1 bg-zinc-800 rounded-sm": !(message.role === "user"),
              invisible: isNextMessageSamePerson,
            }
          )}
        >
          {message.role === "user" ? (
            <Icons.user className="fill-zinc-200 text-zinc-200 h-3/4 w-3/4" />
          ) : (
            <Icons.logo className="fill-zinc-300 h-3/4 w-3/4" />
          )}
        </div>

        <div
          className={cn("flex flex-col space-y-2 text-base max-w-md mx-2", {
            "order-1 items-end": message.role === "user",
            "order-2 items-start": !(message.role === "user"),
          })}
        >
          <div
            className={cn("px-4 py-2 rounded-lg inline-block", {
              "bg-blue-600 text-white": message.role === "user",
              "bg-gray-200 text-gray-900": !(message.role === "user"),
              "rounded-br-none":
                !isNextMessageSamePerson && message.role === "user",
              "rounded-bl-none":
                !isNextMessageSamePerson && !(message.role === "user"),
            })}
          >
            {typeof message.text === "string" ? (
              <ReactMarkdown
                className={cn("prose", {
                  "text-zinc-50": message.role === "user",
                })}
              >
                {message.text}
              </ReactMarkdown>
            ) : (
              message.text
            )}
            {message.id !== "loading-message" ? (
              <div
                className={cn("text-xs select-none mt-2 w-full text-right", {
                  "text-zinc-500": !(message.role === "user"),
                  "text-blue-300": message.role === "user",
                })}
              >
                {format(new Date(message.created_at), "HH:mm")}
              </div>
            ) : null}
            {typeof message.text === "string" && (
              <Player
                text={message.text}
                isUserMessage={message.role === "user"}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
);

Message.displayName = "Message";

export default Message;
