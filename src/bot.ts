import { Telegraf } from "telegraf";
import { Configuration, OpenAIApi } from "openai";
import { isToBotMessage } from "./helpers";
import { onBotMessage } from "./onBotMessage"
import "dotenv/config"

const bot = new Telegraf(process.env.BOT_TOKEN as string);

bot.start((ctx) =>
  ctx.reply(
    `Привет, я бот ChatGPT. Вы можете задать мне вопрос или попросить что-то сделать начав свое сообщение с "!".`
  )
);

bot.help((ctx) =>
  ctx.reply(
    `Привет, я бот ChatGPT. Вы можете задать мне вопрос или попросить что-то сделать начав свое сообщение с "!".`
  )
);

const configuration = new Configuration({
  organization: process.env.OPENAI_API_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const ask = async (text: string) => {
  const resp = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: process.env.GPT_PROMPT as string,
      },
      { role: "user", content: `${text}` },
    ],
    temperature: Number(process.env.TEMPERATURE),
    max_tokens: Number(process.env.MAX_TOKENS),
  });
  return resp;
};



bot.hears(isToBotMessage, async (ctx) => {
  queueMicrotask(() => onBotMessage(ctx))
});

bot.launch();
