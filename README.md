
# Simple telegram ChatGPT Bot

## Prerequisites

1. Get a OpenAI API Key at [OpenAI](https://platform.openai.com/account/api-keys)
2. Get a Telegram bot Token at [BotFather](https://telegram.me/BotFather)

## Installation

1. Clone the repo

```sh
    git clone https://github.com/zonterone/gpt-bot.git
```

2. Go to project directory

```sh
    cd gpt-bot
```

3. Build Docker image

```sh
    docker build . -t zonter/telegram-gpt
```

4. Run Docker container

```sh
docker run -d --name=telegram-gpt-bot \
-e BOT_TOKEN=<your telegram api token> \
-e OPENAI_API_KEY=<your openAi API key> \
-e GPT_PROMPT=<your system prompt> \
-e MAX_TOKENS=<max tokens> \
-e TEMPERATURE=<temperature> \ 
-e MODEl=<openAi model> \
-e MAX_MESSAGES_COUNT=<max count messages in conversation> \
--restart unless-stopped \
zonter/telegram-gpt:latest
```

5. Start conversation with your bot. Also you can invite this bot to a group chats.

## ENV variables

| Variable             | Required     | Description                                                         |
| :------------------- | :----------- | :------------------------------------------------------------------ |
| `BOT_TOKEN`          | **Required** | Your Telegram API bot token                                         |
| `OPENAI_API_KEY`     | **Required** | Your openAi API key                                                 |
| `GPT_PROMPT`         | Optional     | Your system prompt. Defaults prompt acts like helpful assistant.    |
| `MAX_TOKENS`         | Optional     | Max tokens for answer. Defaults set to `max model tokens`           |
| `TEMPERATURE`        | Optional     | Model temperature. Number between 0-2. Defaults sets to `1`.        |
| `MODEl`              | Optional     | OpenAI GPT model. Defaults sets to `gpt-4o-mini`                    |
| `MAX_MESSAGES_COUNT` | Optional     | Number of max messages count in conversation. Defaults sets to `50` |
