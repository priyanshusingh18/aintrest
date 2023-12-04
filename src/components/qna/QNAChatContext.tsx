import { ReactNode, createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
// import { trpc: as } from "~/utils/trpc";

// export default QnAChatContext
type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: string) => void;
  isLoading: boolean;
};
// React.ChangeEvent<HTMLTextAreaElement>
export const QnAChatContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
});

interface Props {
  questionId: number;
  children: ReactNode;
}
export const QnAContextProvider = ({ questionId, children }: Props) => {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  const backupMessage = useRef("");
  const utils = trpc.useContext();

  const { mutate: evaluateAnswer } = useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      setIsLoading(true);

      const response = await fetch("/api/answer-writing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          questionId: Number(questionId),
          message: message,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      setMessage("");
      return response.body;
    },
    onMutate: async ({ message }) => {
      backupMessage.current = message;

      await utils.questions.getQnAMessages.cancel();

      const config = {
        quesId: Number(questionId),
      };
      const previousMessages = utils.questions.getQnAMessages.getData(config);
      // console.log(previousMessages, "TSHI ");
      utils.questions.getQnAMessages.setData(config, (old) => {
        if (!old) {
          return {
            QnAMessages: [],
          };
        }

        let newPages = [
          {
            createdAt: new Date().toISOString(),
            id: ~~(Math.random() * 50000),
            text: message,
            isUserMessage: true,
            audioUrl: null,
          },
          ...old.QnAMessages,
        ];

        return {
          QnAMessages: newPages,
        };
      });

      setIsLoading(true);
      return {
        previousMessages,
      };
    },
    onSuccess: async (stream) => {
      setIsLoading(false);
      if (!stream) {
        return toast({
          title: "There was a problem sending this message",
          description: "Please refresh this page and try again",
          variant: "destructive",
        });
      }
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let done = false;

      // accumulated response
      let accResponse = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        accResponse += chunkValue;
        // append chunk to the actual message
        utils.questions.getQnAMessages.setData(
          { quesId: Number(questionId) },
          (old) => {
            if (!old) {
              return {
                QnAMessages: [],
              };
            }

            const asd = 999999;
            let isAiResponseCreated = old.QnAMessages.some(
              (message) => message.id === asd
            );

            let newMessage = {
              createdAt: new Date().toISOString(),
              id: asd,
              text: accResponse,
              isUserMessage: false,
              audioUrl: null,
            };

            old.QnAMessages = isAiResponseCreated
              ? old.QnAMessages.map((message) =>
                  message.id === asd
                    ? { ...message, text: accResponse }
                    : message
                )
              : [newMessage, ...old.QnAMessages];
            return {
              ...old,
            };
          }
        );
      }
    },
    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      utils.questions.getQnAMessages.setData(
        { quesId: questionId },
        {
          QnAMessages: context?.previousMessages?.QnAMessages ?? [],
        }
      );
    },
    onSettled: async () => {
      setIsLoading(false);
      await utils.questions.getQnAMessages.invalidate();
    },
  });

  const addMessage = () => evaluateAnswer({ message });

  const handleInputChange = (event: string) => {
    setMessage(event);
  };
  // React.ChangeEvent<HTMLTextAreaElement>
  return (
    <QnAChatContext.Provider
      value={{ message, addMessage, handleInputChange, isLoading }}
    >
      {children}
    </QnAChatContext.Provider>
  );
};
