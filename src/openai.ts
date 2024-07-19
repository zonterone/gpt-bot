import OpenAI from 'openai'
import { db } from './db'
import { defaultModel, defaultPrompt } from './helpers'

import 'dotenv/config'

const { MAX_MESSAGES_COUNT = 50 } = process.env

const openAi = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const systemMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
  role: 'system',
  content: (process.env.GPT_PROMPT as string) || defaultPrompt,
}

export const ask = async (text: string, chatId: number) => {
  try {
    const prevMessages = await db.getObjectDefault<
      OpenAI.Chat.Completions.ChatCompletionMessageParam[]
    >(`/chats/${chatId}`, [])

    const userMessage: OpenAI.Chat.Completions.ChatCompletionMessageParam = {
      role: 'user',
      content: `${text}`,
    }

    const messages = [...prevMessages, userMessage]

    if (messages.length >= Number(MAX_MESSAGES_COUNT)) {
      messages.splice(0, 2)
    }

    const resp = await openAi.chat.completions.create({
      model: process.env.MODEL || defaultModel,
      messages: [...messages, systemMessage],
      temperature: Number(process.env.TEMPERATURE) || 0.5,
      max_tokens: Number(process.env.MAX_TOKENS) || undefined,
    })

    const botAnswer = resp.choices[0].message

    await db.push(`/chats/${chatId}`, [userMessage, botAnswer], false)

    return botAnswer?.content
  } catch (error: any) {
    if (error?.response?.data?.error?.message) {
      throw new Error(
        `${error?.response?.data?.error?.message} \n\nYou can try to execute /reset command to start a new conversation.`
      )
    } else {
      throw new Error(error)
    }
  }
}
