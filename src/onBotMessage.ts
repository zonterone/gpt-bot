import { ask } from "./bot"
import { bold, italic } from "telegraf/format";
import Context, { NarrowedContext } from "telegraf/typings/context";
import { Message, Update } from "telegraf/typings/core/types/typegram";
import { getWaitingMessagesClosure } from "./helpers"

export const onBotMessage = async (
  ctx: NarrowedContext<
    Context<Update> & {
      match: RegExpExecArray;
    },
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

    interval = setInterval(async () => {
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
      ctx.telegram.deleteMessage(tempMess.chat.id, tempMess.message_id)
      await ctx.reply(resp.data.choices[0].message?.content, {
        reply_to_message_id: ctx.message.message_id,
      })
    } else {
      await ctx.telegram.editMessageText(
        tempMess.chat.id,
        tempMess.message_id,
        undefined,
        bold("Ooops, something went wrong")
      );
    }
  } catch (error) {
    if (interval) {
      clearInterval(interval);
    }
    console.error(error);
  }
};