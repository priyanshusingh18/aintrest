import z from "zod";

export const SendMessageValidator = z.object({
  fileId: z.string(),
  message: z.string(),
});
export const SendQnAMessageValidator = z.object({
  questionId: z.number(),
  message: z.string(),
});
