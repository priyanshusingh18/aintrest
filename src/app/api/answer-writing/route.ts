import { NextApiResponse } from "next";
import { NextRequest } from "next/server";
import { db } from "@/db";
import { openai } from "@/lib/openai";
import { pinecone } from "@/lib/pinecone";
import { SendQnAMessageValidator } from "@/lib/validators/SendMessageValidators";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";

import { OpenAIStream, StreamingTextResponse } from "ai";

type ResponseData = {
  message: string;
};
export const POST = async (
  req: NextRequest,
  res: NextApiResponse<ResponseData>
) => {
  const body = await req.json();
  const { getUser } = getKindeServerSession();
  const user = getUser();
  const { id: userId } = user;
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const { questionId, message } = SendQnAMessageValidator.parse(body);

  const messages = await db.questionAnswerMessage.findMany({
    where: {
      userId: userId,
      questionId: Number(questionId),
    },
    orderBy: {
      createdAt: "asc", // Sort by the 'createdAt' field in ascending order (change to 'desc' for descending order)
    },
  });
  await db.questionAnswerMessage.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      questionId: Number(questionId),
    },
  });
  const pastMessageArr = messages.map((message) => {
    return {
      role: message.isUserMessage ? "user" : "assistant",
      content: message.text,
    };
  });
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  const pineconeIndex = pinecone.Index("aintrest");
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: pineconeIndex,
  });
  const tempMessage = `answer this question "${message}"`;
  console.log(tempMessage, "tempMessage");

  const results = await vectorStore.similaritySearch(tempMessage);
  const systemPrompt = `You are a helpful assistant that helps user learn how to answer written questions. You will never give user the Answer to the questions, if the user asks for a hint, give him some,
  but is the user repedatly asks for hints tell them to attempt to answer the question, You will have to judge weather the user is attempting to answer the question or 
  if asking for hints or giving irrelevant messages tell them you can only asist them in answer writing, if the user has attempted to answer the question then evaulate their answer and give them suggestions on how can they improve their answer.
  you will always only reply in a js object format, and nothing else not a single word, just objects as your replies will be automatically parsed and we can only parse objects,
  The objects should look like this 
  {
  text: {whatever your actuall reply is},
  type: enum["evaluation", "hint", "irrelevant-answer-by-user"]
  score: {if the type was "evaluation" then give the user's answer a score out of 10}
  }
  remember all your replies should be in this object format and nothing else.
  Here is the context from where you can find information about the answer
  \n----------------\n
      
  CONTEXT:
  ${results.map((r) => r.pageContent).join("\n\n")}
  
  
  \n----------------\n
  
  
  PREVIOUS MESSAGES
  ${pastMessageArr.map((message) => {
    if (message.role === "user") return `User: ${message.content}\n`;
    return `Assistant: ${message.content}\n`;
  })}

  
  
  `;
  const ass = [
    {
      role: "system",
      content: systemPrompt,
    },
    {
      role: "user",
      content: message,
    },
  ];
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0.2,
    stream: true,
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: message,
      },
    ],
  });
  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      await db.questionAnswerMessage.create({
        data: {
          text: completion,
          isUserMessage: false,
          userId,
          questionId: Number(questionId),
        },
      });
    },
  });

  return new StreamingTextResponse(stream);
};
