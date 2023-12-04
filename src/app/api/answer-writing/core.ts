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

interface Question {
  id: number;
  question: string;
}

export const questionsRouter = router({
  getQuestions: privateProcedure
    .input(
      z.object({
        message: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { message } = input;
      const { userId } = ctx;
      const embeddings = new OpenAIEmbeddings({
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
      const pineconeIndex = pinecone.Index("aintrest");
      const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
        pineconeIndex: pineconeIndex,
      });

      const results = await vectorStore.similaritySearch(message);

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: `Use the following pieces of context to generate an array that contains objects that contain written questions from the context given. Your reply should strictly be a json array and no words. The objects of the array should look like this
              {
                "id": {Unique ID},
                "question": {Content of the question},

              }
              The Questions must be let the user give free-text answers.
              The questions must be in written format and not in any other format like mcq or true/false.
              if asked to generate questions from a given context, don't copy questions given in them, generate new questions by yourself from that context
              Don't generate quetions from anything other than the given context,
              if the context does not contain information about the asked question then don't generate questions rather generate a object like this 
              {
                "errror": true
              }
              `,
          },
          {
            role: "user",
            content: `${message}
      
        \n----------------\n
      
        CONTEXT:
        ${results.map((r) => r.pageContent).join("\n\n")}`,
          },
        ],
      });
      console.log(response.choices[0].message.content);
      if (response.choices[0].message.content) {
        try {
          console.log("Reached here atleast");
          const arr: Question[] = JSON.parse(
            response.choices[0].message.content
          );
          const createdPrompt = await db.prompt.create({
            data: {
              text: message,
              userId: userId,
            },
          });
          console.log(arr);
          const questionPromises = arr.map((question) => {
            return db.question.create({
              data: {
                question: question.question,
                userId: createdPrompt.userId, // Use the same user ID as the prompt
                promptId: createdPrompt.id, // Associate with the newly created prompt
              },
            });
          });
          await Promise.all(questionPromises);

          return {
            success: true,
            questionArr: arr,
            promptId: createdPrompt.id,
          };
        } catch (error) {
          console.log(error);
          throw new TRPCError({ code: "NOT_FOUND" });
        }
      } else throw new TRPCError({ code: "NOT_FOUND" });
    }),
  evaluateAnswer: privateProcedure
    .input(z.object({ message: z.string(), id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { message, id } = input;
      const { userId } = ctx;
      const messages = await db.questionAnswerMessage.findMany({
        where: {
          userId: userId,
          questionId: Number(id),
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
          questionId: Number(id),
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
      const systemPrompt = `You are a helpful assistant that helps user learn how to answer written questions. You will never give user the Answer to the questions no matter what, only hints, if the user asks for a hint, give him some,
but if the user repedatly asks for hints tell them to attempt to answer the question, You will have to judge whether the user is attempting to answer the question or 
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

Never give out the answer, if answer is nearly correct, praise the user but if it is very far from the correct answer try to direct the user towards the correct answer
\n----------------\n
    
CONTEXT:
${results.map((r) => r.pageContent).join("\n\n")}


\n----------------\n


PREVIOUS MESSAGES
${pastMessageArr}


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
      console.log(systemPrompt, "systemPrompt for ai");
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
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
      console.log("HEY HOW ARE YOU");
      const stream = OpenAIStream(response, {
        async onCompletion(completion) {
          console.log(completion, "WE EWILL");
          await db.questionAnswerMessage.create({
            data: {
              text: completion,
              isUserMessage: false,
              userId,
              questionId: Number(id),
            },
          });
        },
      });

      return new StreamingTextResponse(stream);
    }),
  getPrompts: privateProcedure.query(async ({ ctx, input }) => {
    const { userId } = ctx;
    const prompts = await db.prompt.findMany({
      where: {
        userId: userId,
      },
      include: {
        _count: {
          select: { questions: true },
        },
      },
    });
    return prompts;
  }),
  getPrompt: privateProcedure
    .input(z.object({ promptId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { promptId } = input;
      const prompts = await db.prompt.findMany({
        where: {
          userId: userId,
          id: promptId,
        },
      });
      return prompts;
    }),
  addAudio: privateProcedure
    .input(z.object({}))
    .query(async ({ ctx, input }) => null),
  getQnAMessages: privateProcedure
    .input(
      z.object({
        quesId: z.number(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { quesId } = input;

      console.log(quesId, userId, "JHINGLU");
      const question = await db.question.findFirst({
        where: {
          id: quesId,
          userId,
        },
      });
      const QnAMessages = await db.questionAnswerMessage.findMany({
        where: {
          questionId: quesId,
          userId,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          createdAt: true,
          isUserMessage: true,
          text: true,
          audioUrl: true,
        },
      });

      if (!question) throw new TRPCError({ code: "PARSE_ERROR" });
      console.debug(QnAMessages, "QnAMessages");
      return {
        QnAMessages,
      };
    }),
});
export type AppRouter = typeof questionsRouter;
