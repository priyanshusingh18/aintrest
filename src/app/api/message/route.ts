import { db } from "@/db";
import { openai } from "@/lib/openai";
import { pinecone } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidators";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextRequest } from "next/server";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextApiResponse } from "next";
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

  const { fileId, message } = SendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });
  console.log("HEY REACHED HERE ");
  if (!file) return new Response("Not Found", { status: 404 });

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });
  const embeddings = new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
  const pineconeIndex = pinecone.Index("aintrest");
  console.log(pineconeIndex);
  const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex: pineconeIndex,
    namespace: file.id,
    // namespace: file.id,
  });

  const results = await vectorStore.similaritySearch(message);
  console.log(message, results, "resilt");
  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  });
  const formattedPrevMessages = prevMessages.map((msg) => {
    return {
      content: msg.text,
      role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
    };
  });
  const joined = results.map((r) => r.pageContent).join("\n\n");
  console.log(
    `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.
  CONTEXT:
 ${results.map((r) => r.pageContent).join("\n\n")}`,
    "messages from the past"
  );
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0.2,
    stream: true,
    messages: [
      {
        role: "system",
        content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.
        CONTEXT:
       ${results.map((r) => r.pageContent).join("\n\n")}`,
      },
      ...formattedPrevMessages,
      {
        role: "user",
        content: message,
      },
    ],
  });
  const stream = OpenAIStream(response, {
    async onCompletion(completion) {
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          userId,
          fileId,
        },
      });
    },
  });

  return new StreamingTextResponse(stream);
};
