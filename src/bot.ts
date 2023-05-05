import { Telegraf } from "telegraf";
import { bold, italic } from "telegraf/format";

import { Configuration, OpenAIApi } from "openai";
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN as string);

const configuration = new Configuration({
  organization: process.env.OPENAI_API_ORGANIZATION,
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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

const ask = async (text: string) => {
  const resp = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are helpful assistant. First find relevant information, then answer the question based on the relevant information. Your answer should not contain more than 100 words",
      },
      { role: "user", content: "Who won the world series in 2020?" },
      {
        role: "assistant",
        content: "The Los Angeles Dodgers won the World Series in 2020.",
      },
      { role: "user", content: `${text}` },
    ],
    temperature: 1,
    max_tokens: 500,
  });
  return resp;
};

const isToBotMessage = (value: string) => {
  const regexp = /^\!/;
  return regexp.exec(value);
};

const getRandomNumber = (min: number, max: number): number => {
  return Math.round(Math.random() * (max - min) + min);
};

const getWaitingMessagesClosure = () => {
  let prevIdx: number | null = null;
  const getWaitingMessages = (): string => {
    const messages = [
      "Секретные данные переносим в защищенное место…",
      "Производим сложные расчеты… Надеемся, они верны!",
      "Немного передышки для нашей героической команды…",
      "Солнце светит, птицы поют, а мы все еще работаем над этим ответом…",
      "Генерируем случайные числа. Иногда они бывают правдоподобными…",
      "Процесс генерации данных в самом разгаре. Никуда не уходите!",
      "Машины генерируют данные для нашего благополучия…",
      "Согласно нашим вычислениям, данные должны появиться через несколько секунд…",
      "Данные в пути…",
      "Генерируем информацию…",
      "Ищем нужные ответы…",
      "Тут у нас группа экспертов работает над ответом. Подождите…",
      "Загружено котят: 0/100. Пожалуйста, подождите…",
      "Вы думали, мы что-то типа Google? Нет, у нас работает один кролик на четырех колесах. Подождите…",
      "Наши серверы как бегемоты. Большие, медленные и любят воду. Подождите…",
      "Данные запускаются на поток. Поток падает. Мы начинаем с начала…",
    ];
    const randomNumber = getRandomNumber(0, messages.length);
    if (prevIdx === randomNumber) {
      return getWaitingMessages();
    } else {
      prevIdx = randomNumber;
      return messages[randomNumber];
    }
  };
  return getWaitingMessages;
};

bot.hears(isToBotMessage, async (ctx) => {
  try {
    const getWaitingMessages = getWaitingMessagesClosure();
    let tempMess = await ctx.reply(italic(getWaitingMessages()), {reply_to_message_id: ctx.message.message_id});

    const interval = setInterval(async () => {
      await ctx.telegram.editMessageText(
        tempMess.chat.id,
        tempMess.message_id,
        undefined,
        italic(getWaitingMessages())
      );
    }, 3000);

    const resp = await ask(ctx.message.text.slice(1).trim());
    clearInterval(interval);
    if (resp.data.choices[0].message?.content) {
      await ctx.telegram.editMessageText(
        tempMess.chat.id,
        tempMess.message_id,
        undefined,
        resp.data.choices[0].message?.content
      );
    } else {
      await ctx.telegram.editMessageText(
        tempMess.chat.id,
        tempMess.message_id,
        undefined,
        bold("Ooops, something went wrong")
      );
    }
  } catch (error) {
    console.error(error);
    ctx.reply(bold("Ooops, something went wrong"));
  }
});

bot.launch();
