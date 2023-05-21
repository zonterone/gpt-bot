import { Configuration} from "openai/dist/configuration";
import { ChatCompletionRequestMessage, OpenAIApi } from "openai/dist/api"
import { db } from "./db";
import { defaultPrompt } from "./helpers";

import "dotenv/config";
import { error } from "console";

const { MAX_MESSAGES_COUNT = 50 } = process.env;

const configuration = new Configuration({
  organization: process.env.OPENAI_API_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const systemMessage: ChatCompletionRequestMessage = {
  role: "system",
  content: (process.env.GPT_PROMPT as string) || defaultPrompt,
};

export const ask = async (text: string, chatId: number) => {
  try {
    const prevMessages = await db.getObjectDefault<
      ChatCompletionRequestMessage[]
    >(`/chats/${chatId}`, []);

    const userMessage: ChatCompletionRequestMessage = {
      role: "user",
      content: `${text}`,
    };

    const messages = [...prevMessages, userMessage];

    if (messages.length >= Number(MAX_MESSAGES_COUNT)) {
      messages.splice(0, 2);
    }

    const resp = await openai.createChatCompletion({
      model: process.env.MODEL || "gpt-3.5-turbo",
      messages: [...messages, systemMessage],
      temperature: Number(process.env.TEMPERATURE) || 1,
      max_tokens: Number(process.env.MAX_TOKENS) || undefined,
    });

    const botAnswer = resp.data.choices[0].message;

    await db.push(`/chats/${chatId}`, [userMessage, botAnswer], false);

    return botAnswer?.content;
  } catch (error: any) {
    if (error?.response?.data?.error?.message) {
      throw new Error(
        `${error?.response?.data?.error?.message} \n\nYou can try to execute /reset command to start a new conversation.`
      );
    } else {
      throw new Error(error);
    }
  }
};
