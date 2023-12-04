import { ReactNode, createContext, useRef, useState } from "react";
import { useToast } from "../ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { trpc } from "@/app/_trpc/client";
import { ExtendedMessageAssistant } from "@/types/message";

// import { trpc: as } from "~/utils/trpc";

// export default AssistContext
type StreamResponse = {
  addMessage: () => void;
  message: string;
  handleInputChange: (event: string) => void;
  isLoading: boolean;
  threadCreated: string | null;
};

export const AssistContext = createContext<StreamResponse>({
  addMessage: () => {},
  message: "",
  handleInputChange: () => {},
  isLoading: false,
  threadCreated: null,
});

interface Props {
  threadId: string | null;
  fileId: string;
  children: ReactNode;
  setThreadUrl: (arg0: string) => void;
}
export const AssistContextProvider = ({
  threadId,
  children,
  fileId,
  setThreadUrl,
}: Props) => {
  const [message, setMessage] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [threadCreated, setThreadCreated] = useState<string | null>(threadId);
  const { toast } = useToast();
  const backupMessage = useRef("");
  const utils = trpc.useContext();

  const { mutate: sendMessage } = trpc.booksRouter.newMessage.useMutation({
    onMutate: async ({ message }) => {
      backupMessage.current = message;

      await utils.booksRouter.getMessages.cancel();

      const config = {
        threadId: String(threadId),
      };
      const previousMessages = utils.booksRouter.getMessages.getData(config);
      utils.booksRouter.getMessages.setData(config, (old) => {
        if (!old)
          return [
            {
              created_at: Number(new Date()),
              id: "POKJNMJKLJNBJ",
              text: message,
              role: "user",
            },
          ];
        return [
          {
            created_at: Number(new Date()),
            id: "POKJNMJKLJNBJ",
            text: message,
            role: "user",
          },
          ...old,
        ];
      });
      setMessage("");
      setIsLoading(true);
      return {
        previousMessages,
      };
    },
    onSuccess: async (stream: any) => {
      setIsLoading(false);
      if (!stream) {
        return toast({
          title: "There was a problem sending this message",
          description: "Please refresh this page and try again",
          variant: "destructive",
        });
      }
      if (stream.thread_id) {
        const tId = String(stream.thread_id);
        if (tId) setThreadUrl(tId);
      }
      // return [stream];
    },
    onError: (_, __, context) => {
      setMessage(backupMessage.current);
      utils.booksRouter.getMessages.setData(
        { threadId: String(threadId) },
        context?.previousMessages
      );
    },
    onSettled: async () => {
      setIsLoading(false);
      await utils.booksRouter.getMessages.invalidate();
    },
  });

  const addMessage = () =>
    sendMessage({ message, fileId: fileId, threadId: threadId });

  const handleInputChange = (event: string) => {
    setMessage(event);
  };

  return (
    <AssistContext.Provider
      value={{
        message,
        addMessage,
        handleInputChange,
        isLoading,
        threadCreated,
      }}
    >
      {children}
    </AssistContext.Provider>
  );
};
