import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { openai } from "@/lib/openai";
import { pinecone } from "@/lib/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { TRPCError } from "@trpc/server";
import { db } from "@/db";
import { z } from "zod";
import { privateProcedure, publicProcedure, router } from "@/trpc/trpc";
import { OpenAIStream, StreamingTextResponse } from "ai";

export const booksRouter = router({
  newMessage: privateProcedure
    .input(
      z.object({
        message: z.string(),
        fileId: z.string(),
        threadId: z.string().nullish(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { fileId, threadId, message } = input;
      const { userId } = ctx;

      try {
        if (!threadId) {
          const assistant = await db.assistant.findFirst({
            where: {
              bookCount: 1,
              books: {
                every: {
                  fileId: fileId,
                },
              },
            },
            select: {
              id: true,
            },
          });

          if (!assistant)
            return new Response("Something Went Wrong", { status: 500 });
          const { created_at, id, metadata } =
            await openai.beta.threads.create();
          console.log(created_at, id, metadata);
          const threadDb = await db.thread.create({
            data: {
              id,
              userId,
              created_at,
              assistantId: assistant.id,
            },
          });

          const threadMessages = await openai.beta.threads.messages.create(id, {
            role: "user",
            content: message,
          });

          const run = await openai.beta.threads.runs.create(id, {
            assistant_id: assistant.id,
          });
          let response = await openai.beta.threads.runs.retrieve(id, run.id);

          while (
            response.status === "in_progress" ||
            response.status === "queued"
          ) {
            console.log("waiting...");
            await new Promise((resolve) => setTimeout(resolve, 1500));
            response = await openai.beta.threads.runs.retrieve(id, run.id);
          }

          const messageList = await openai.beta.threads.messages.list(id);
          const lastMessage = messageList.data
            .filter(
              (message: any) =>
                message.run_id === run.id && message.role === "assistant"
            )
            .pop();
          if (!lastMessage)
            return new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          if (lastMessage?.content[0].type === "text")
            return {
              thread_id: id,
              text: lastMessage?.content[0].text.value,
              created_at: lastMessage.created_at,
              role: "assistant",
              id: lastMessage.id,
            };
          else
            return {
              thread_id: id,
              text: "",
              created_at: lastMessage.created_at,
              role: "assistant",
              id: lastMessage.id,
            };

          console.log(messageList, lastMessage);
          return lastMessage;
        } else {
          const assistant = await db.assistant.findFirst({
            where: {
              bookCount: 1,
              books: {
                every: {
                  fileId: fileId,
                },
              },
            },
            select: {
              id: true,
            },
          });
          if (!assistant)
            return new Response("Something Went Wrong", { status: 500 });
          const threadDbId = await db.thread.findFirst({
            where: {
              id: threadId,
              assistantId: assistant.id,
            },
            select: {
              id: true,
              assistantId: true,
            },
          });

          if (!threadDbId)
            return new Response("Something Went Wrong", { status: 500 });
          const threadMessages = await openai.beta.threads.messages.create(
            threadId,
            {
              role: "user",
              content: message,
            }
          );
          const run = await openai.beta.threads.runs.create(threadId, {
            assistant_id: assistant.id,
          });
          let response = await openai.beta.threads.runs.retrieve(
            threadId,
            run.id
          );
          while (
            response.status === "in_progress" ||
            response.status === "queued"
          ) {
            console.log("waiting...");
            await new Promise((resolve) => setTimeout(resolve, 1500));
            response = await openai.beta.threads.runs.retrieve(
              threadId,
              run.id
            );
          }

          const messageList = await openai.beta.threads.messages.list(threadId);
          const lastMessage = messageList.data
            .filter(
              (message: any) =>
                message.run_id === run.id && message.role === "assistant"
            )
            .pop();
          if (!lastMessage)
            return new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
          if (lastMessage?.content[0].type === "text")
            return {
              text: lastMessage?.content[0].text.value,
              created_at: lastMessage.created_at,
              role: "assistant",
              id: lastMessage.id,
            };
          else
            return {
              text: "",
              created_at: lastMessage.created_at,
              role: "assistant",
              id: lastMessage.id,
            };
        }
      } catch (error) {
        console.log(error);
        return new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      }
    }),
  runThread: privateProcedure
    .input(z.object({ fileId: z.string(), threadId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { threadId, fileId } = input;
      const assistant = await db.assistant.findFirst({
        where: {
          bookCount: 1,
          books: {
            every: {
              fileId: fileId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      if (!assistant)
        return new Response("Something Went Wrong", { status: 500 });
      const run = await openai.beta.threads.runs.create(threadId, {
        assistant_id: assistant.id,
      });
      let response = await openai.beta.threads.runs.retrieve(threadId, run.id);

      while (
        response.status === "in_progress" ||
        response.status === "queued"
      ) {
        console.log("waiting...");
        await new Promise((resolve) => setTimeout(resolve, 1500));
        response = await openai.beta.threads.runs.retrieve(threadId, run.id);
      }

      const messageList = await openai.beta.threads.messages.list(threadId);
      const lastMessage = messageList.data
        .filter(
          (message: any) =>
            message.run_id === run.id && message.role === "assistant"
        )
        .pop();
      if (!lastMessage) return new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      if (lastMessage?.content[0].type === "text")
        return {
          thread_id: threadId,
          text: lastMessage?.content[0].text.value,
          created_at: lastMessage.created_at,
          role: "assistant",
          id: lastMessage.id,
        };
    }),
  getMessages: privateProcedure
    .input(
      z.object({
        threadId: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { threadId } = input;
      const thread = await db.thread.findFirst({
        where: {
          userId: userId,
          id: threadId,
        },
        select: {
          id: true,
        },
      });
      if (!thread) new Response("Unauthorized", { status: 401 });
      const messageList = await openai.beta.threads.messages.list(threadId);

      const result = messageList.data.map((message) => ({
        id: message.id,
        created_at: message.created_at,
        role: message.role,
        text:
          message.content[0].type === "text"
            ? message.content[0].text.value
            : "",
      }));
      return result;
    }),
});
export type AppRouter = typeof booksRouter;
