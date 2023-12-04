import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey:
    process.env.OPENAI_API_KEY ||
    "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",
  dangerouslyAllowBrowser: true,
});
