import { Context, NarrowedContext, Telegraf } from "telegraf";
import { db } from "./db";
import { bold, italic } from "telegraf/format";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import { message } from "telegraf/filters";

import { getWaitingMessagesClosure, isToBotMessage } from "./helpers";
import { ask } from "./openai";

import "dotenv/config";

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

const userIdsPendingRequestStack = <number[]>[];

bot.on(message("text"), async (ctx) => {
  if (userIdsPendingRequestStack.includes(ctx.chat.id)) {
    ctx.reply(bold("You need to wait for the completion of the answer to the previous question."), { reply_to_message_id: ctx.message.message_id });
  } else if (ctx.chat.type === "private" || isToBotMessage(ctx.message.text)) {
    userIdsPendingRequestStack.push(ctx.chat.id);
    onBotMessage(ctx).then(() => {
      const idx = userIdsPendingRequestStack.indexOf(ctx.chat.id);
      userIdsPendingRequestStack.splice(idx, 1);
    });
  }
});
