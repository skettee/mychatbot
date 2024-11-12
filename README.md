# myChatbot

A Node Graph-Based User Interface for Large Language Models (similar to ComfyUI). You can build your own chatbot without coding.

https://github.com/user-attachments/assets/4c419c0a-75d5-4d21-8383-8e63714a27f6


## Features
- 🪄 **No Coding Required**: Easily create and manage workflows by simply dragging and dropping nodes, and connecting them without the need for coding skills.
- 🎛️ **Customization**: Users can connect various LLMs and agent features to achieve high-quality results according to their preferences.
- ⛓️ **Agentic Workflows**: Utilize advanced techniques, such as chaining Large Language Models (LLMs), to enhance the quality and accuracy of results. (inspired by [OpenAI Swarm](https://github.com/openai/swarm))
- 🖼️ **Vision Capabilities**: Integrate and process images, allowing for image loading and understanding.
- 📢 **Audio Transcription**: Effortlessly load audio files and convert them into text with transcription support.
- 📜  **Markdown Support**: Enhanced readability with markdown and syntax highlighting capabilities.
- 🤖 **Supported LLMs**: OpenAI, Anthropic, Perplexity and more LLMs in the future.
- 🌟 **And more...** : Constantly improving with new features!

## How to Install

- Clone the repository from Github

```bash

git clone https://github.com/skettee/mychatbot.git

```

- Install dependencies

```bash

cd mychatbot
npm install

```

- Set environment variables

```bash

# rename .env.example to .env
# add your api keys
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key
PERPLEXITY_API_KEY==your-perplexity-api-key
```

- Start a development server

```bash

npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open

```

- Build the application

```bash

npm run build

```

- Start the application

```bash

node -r dotenv/config build

# If you use Node.js v20.6+, you can use the `--env-file`
node --env-file=.env build

```
