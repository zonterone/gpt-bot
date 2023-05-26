import { Telegraf } from "telegraf"
import { message } from "telegraf/filters"
import { bold, italic } from "telegraf/format"
import { Context, NarrowedContext } from "telegraf/typings/context"
import { Message, Update } from "telegraf/typings/core/types/typegram"

import { db } from "./db"

import { getWaitingMessagesClosure, isToBotMessage } from "./helpers"
import { ask } from "./openai"

import "dotenv/config"

export const bot = new Telegraf(process.env.BOT_TOKEN as string);

const onBotMessage = async (
  ctx: NarrowedContext<
    Context<Update>,
    {
      message: Update.New & Update.NonChannel & Message.TextMessage;
      update_id: number;
    }
  >
) => {
  let interval: NodeJS.Timer | undefined;
  let tempMess: Message.TextMessage;
  try {
    const getWaitingMessages = getWaitingMessagesClosure();

    tempMess = await ctx.reply(italic(getWaitingMessages()), {
      reply_to_message_id: ctx.message.message_id,
    });

    interval = setInterval(() => {
      ctx.telegram.editMessageText(
        tempMess.chat.id,
        tempMess.message_id,
        undefined,
        italic(getWaitingMessages())
      );
    }, 3000);

    const userMessage =
      ctx.chat.type === "private"
        ? ctx.message.text.trim()
        : ctx.message.text.slice(1).trim();

    const resp = await ask(userMessage, ctx.message.chat.id);
    clearInterval(interval);
    if (resp) {
      await ctx.telegram.deleteMessage(tempMess.chat.id, tempMess.message_id);
      await ctx.reply(resp, { reply_to_message_id: ctx.message.message_id });
    } else {
      await ctx.telegram.editMessageText(
        tempMess.chat.id,
        tempMess.message_id,
        undefined,
        bold("Ooops, something went wrong")
      );
    }
  } catch (error: any) {
    console.error(error);
    if (interval) {
      clearInterval(interval);
    }
    if (error.message) {
      await ctx.reply(bold(error.message));
    } else {
      await ctx.reply(bold("Ooops, something went wrong"));
    }
  }
};

bot.start((ctx) =>
  ctx.reply(
    `Hi I'm a ChatGPT bot. You can ask me a question or ask me to do something by writing me a message. For group chats, start your question with "/". \n Execute /reset to clear history of conversation`
  )
);

bot.help((ctx) =>
  ctx.reply(
    `Hi I'm a ChatGPT bot. You can ask me a question or ask me to do something by writing me a message. For group chats, start your question with "/". \n Execute /reset to clear history of conversation`
  )
);

bot.command("reset", async (ctx) => {
  await db.delete(`/chats/${ctx.chat.id}`);
  ctx.reply(`Conversation history cleared`);
});

const chatIdsPendingRequestStack = <number[]>[];

bot.on(message("text"), async (ctx) => {
  if (ctx.chat.type === "private" || isToBotMessage(ctx.message.text)) {
    if (chatIdsPendingRequestStack.includes(ctx.chat.id)) {
      ctx.reply(
        bold(
          "You need to wait for the completion of generating the answer to the previous question."
        ),
        { reply_to_message_id: ctx.message.message_id }
      );
    } else {
      chatIdsPendingRequestStack.push(ctx.chat.id);
      onBotMessage(ctx).then(() => {
        const chatIdIdx = chatIdsPendingRequestStack.indexOf(ctx.chat.id);
        chatIdsPendingRequestStack.splice(chatIdIdx, 1);
      });
    }
  }
  return
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
