import React, { useContext, useEffect, useRef } from "react";
import { Textarea } from "../ui/textarea";
import { Mic, Send } from "lucide-react";
import { Button } from "../ui/button";
import { ChatContext } from "./ChatContext";
import "regenerator-runtime";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
interface ChatInputProps {
  isDisabled: boolean;
  textareaRef: React.LegacyRef<HTMLDivElement>;
}
const ChatInput = ({ isDisabled, textareaRef }: ChatInputProps) => {
  const { addMessage, handleInputChange, isLoading, message } =
    useContext(ChatContext);
  const textFocusRef = useRef<HTMLTextAreaElement>(null);
  const commands = [
    {
      command: "stop ",
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

  useEffect(() => {
    if (finalTranscript.trim()) {
      handleInputChange(message + finalTranscript + " ");
    }

    resetTranscript();
  }, [finalTranscript]);
  // const textareaRef = useRef<HTMLTextAreaElement>(null);
  return (
    <div ref={textareaRef} className="grainy absolute bottom-0 left-0 w-full">
      <div className="mx-2 flex flex-row gap-3 md:mx-4  lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <div className="relative">
              <Textarea
                ref={textFocusRef}
                autoFocus
                rows={1}
                onChange={(e) => {
                  handleInputChange(e.target.value);
                }}
                value={message}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && event.shiftKey) {
                    event.preventDefault();
                    addMessage();
                    textFocusRef.current?.focus();
                  }
                }}
                maxRows={4}
                className="resize-none  pr-28 text-base py-3 scrollbar-thumb-rounded scrollbar-thumb-blue scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch "
                placeholder="Enter your question..."
              />
              <Button
                disabled={isLoading}
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
              </Button>
              <Button
                disabled={isLoading || isDisabled}
                className="absolute bottom-1.5 right-[8px]"
                aria-label="send messages"
                type="submit"
                onClick={() => {
                  addMessage();
                  textFocusRef.current?.focus();
                }}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
