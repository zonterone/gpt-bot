import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";
import { db } from "./db";
import { defaultPrompt } from "./helpers";

import "dotenv/config";

const { MAX_MESSAGES_COUNT = 50 } = process.env;

const configuration = new Configuration({
  organization: process.env.OPENAI_API_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export const ask = async (text: string, chatId: number) => {
  try {
    const messages = await db.getObjectDefault<ChatCompletionRequestMessage[]>(
      `/chats/${chatId}`,
      [
        {
          role: "system",
          content: (process.env.GPT_PROMPT as string) || defaultPrompt,
        },
      ]
    );

    messages.push({ role: "user", content: `${text}` });

    const resp = await openai.createChatCompletion({
      model: process.env.MODEL || "gpt-3.5-turbo",
      messages,
      temperature: Number(process.env.TEMPERATURE) || 1,
      max_tokens: Number(process.env.MAX_TOKENS) || 1000,
    });

    const botAnswer = resp.data.choices[0].message?.content;

    messages.push({
      role: "assistant",
      content: `${botAnswer}`,
    });

    if (messages.length >= Number(MAX_MESSAGES_COUNT)) {
      messages.splice(1, 2);
    }

    await db.push(`/chats/${chatId}`, messages);

    return botAnswer;
  } catch (error) {
    console.error(error);
  }
};
