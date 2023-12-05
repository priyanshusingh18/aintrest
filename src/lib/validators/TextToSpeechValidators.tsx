import z from "zod";
export const textToAudioValidator = z.object({
  text: z.string(),
});
