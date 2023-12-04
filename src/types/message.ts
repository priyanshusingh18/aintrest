import { AppRouter } from "@/trpc";
import { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>;

type Messages = RouterOutput["getFileMessages"]["messages"];

type OmitText = Omit<Messages[number], "text">;

type ExtendedText = {
  text: string | JSX.Element;
};

type MessagesAssistant = RouterOutput["booksRouter"]["getMessages"];

type OmitTextAssistant = Omit<MessagesAssistant[number], "text">;

type ExtendedTexAssistantt = {
  text: string | JSX.Element;
  // role: string | "user" | "assistant";
};

export type ExtendedMessage = OmitText & ExtendedText;
export type ExtendedMessageAssistant = OmitTextAssistant &
  ExtendedTexAssistantt;
