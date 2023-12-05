"use client";
import { cn } from "@/lib/utils";

import { Icons } from "../Icons";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { forwardRef, useEffect, useState } from "react";
import { Loader2, Volume1 } from "lucide-react";
import { useToast } from "../ui/use-toast";
import Player from "../audio/Player";

interface Message {
  id: number;
  text: string;
  createdAt: string;
  isUserMessage: boolean;
  audioUrl: string | null;
}
interface MessageProps {
  message: Message;
  isNextMessageSamePerson: boolean;
}

const Message = forwardRef<HTMLDivElement, MessageProps>(
  ({ message, isNextMessageSamePerson }, ref) => {
    const [audioUrl, setAudioUrl] = useState<null | string>(null);
    const [audio, setAudio] = useState<null | HTMLAudioElement>(null);
    const { toast } = useToast();
    useEffect(() => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.play();
      } else {
        audio && (audio as HTMLAudioElement).play();
      }
      return () => {
        console.log("YEY, audio", audio);
        audio?.pause();
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
        }
      };
    }, [audio]);
    try {
      const handlePlayAudio = async () => {
        console.log(audioUrl, audio);
        if (audio) {
          audio.pause();
          audio.currentTime = 0;
          audio.play();
          return;
        } else if (audioUrl) {
          console.log("MUST COME HERE");
          setAudio(() => new Audio(audioUrl));
          console.log(audio);
          // audio && (audio as HTMLAudioElement).play();
          return;
        }
        try {
          const response = await fetch("/api/audio", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              text: message.text,
            }),
          });
          if (!response.ok) {
            toast({
              title: "Error Playing Audio",
              description: "Please try again later",
              variant: "destructive",
            });
          }
          const audioBlob = await response.blob();
          const tempAudioUrl = URL.createObjectURL(audioBlob);
          setAudioUrl(tempAudioUrl);
          setAudio(() => new Audio(tempAudioUrl));
        } catch (error) {
          toast({
            title: "Error Playing Audio",
            description: "Please try again later",
            variant: "destructive",
          });
          console.error("Error playing audio:", error);
        }
      };
      return (
        <div
          ref={ref}
          className={cn("flex items-end", {
            "justify-end": message.isUserMessage,
          })}
        >
          <div
            className={cn(
              "relative flex h-6 w-6 aspect-square items-center justify-center",
              {
                "order-2 bg-blue-600 rounded-sm": message.isUserMessage,
                "order-1 bg-zinc-800 rounded-sm": !message.isUserMessage,
                invisible: isNextMessageSamePerson,
              }
            )}
          >
            {message.isUserMessage ? (
              <Icons.user className="fill-zinc-200 text-zinc-200 h-3/4 w-3/4" />
            ) : (
              <Icons.logo className="fill-zinc-300 h-3/4 w-3/4" />
            )}
          </div>

          <div
            className={cn("flex flex-col space-y-2 text-base max-w-md mx-2", {
              "order-1 items-end": message.isUserMessage,
              "order-2 items-start": !message.isUserMessage,
            })}
          >
            <div
              className={cn("px-4 py-2 rounded-lg  flex flex-col", {
                "bg-blue-600 text-white": message.isUserMessage,
                "bg-gray-200 text-gray-900": !message.isUserMessage,
                "rounded-br-none":
                  !isNextMessageSamePerson && message.isUserMessage,
                "rounded-bl-none":
                  !isNextMessageSamePerson && !message.isUserMessage,
              })}
            >
              {typeof message.text === "string" &&
              message.text !== "loading" ? (
                <ReactMarkdown
                  className={cn("prose", {
                    "text-zinc-50": message.isUserMessage,
                  })}
                >
                  {message.text}
                </ReactMarkdown>
              ) : (
                <span className="flex h-full items-center justify-center">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </span>
              )}
              {message.id === 999991 ? (
                <div
                  className={cn("text-xs select-none mt-2 w-full text-right", {
                    "text-zinc-500": !message.isUserMessage,
                    "text-blue-300": message.isUserMessage,
                  })}
                >
                  {format(new Date(message.createdAt), "HH:mm")}
                </div>
              ) : null}
              {/* <button
                className={`${
                  message.isUserMessage
                    ? "self-end rotate-180 scale-y-[-1]"
                    : ""
                } w-4 h-4  `}
                onClick={() => {
                  handlePlayAudio();
                }}
              >
                <Volume1 className="w-4 h-4" />{" "}
              </button> */}
              <Player
                text={message.text}
                isUserMessage={message.isUserMessage}
              />
            </div>{" "}
          </div>
        </div>
      );
    } catch (error) {
      return <div>error</div>;
    }
  }
);

Message.displayName = "Message";

export default Message;
// const audio = new Audio(tempAudioUrl);
// audio.play();

// {
//   const mp3 = await openai.audio.speech.create({
//     model: "tts-1",
//     voice: "nova",
//     input: message.text,
//   });

//   const audioBlob = new Blob([await mp3.arrayBuffer()], {
//     type: "audio/mp3",
//   });
//   const audioUrl = URL.createObjectURL(audioBlob);

//   setAudioUrl(audioUrl);
// }

// const url = URL.createObjectURL(blob);
