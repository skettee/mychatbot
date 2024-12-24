# myChatbot

A Node Graph-Based User Interface for Large Language Models (similar to ComfyUI). You can build your own chatbot without coding.

https://github.com/user-attachments/assets/9c70968f-8fd4-4169-bf4b-8de75f8b902c

## Features

- 🪄 **No Coding Required**: Easily create and manage workflows by simply dragging and dropping nodes, and connecting them without the need for coding skills.
- 🎛️ **Customization**: Users can connect various LLMs and agent features to achieve high-quality results according to their preferences.
- ⛓️ **Agentic Workflows**: Utilize advanced techniques, such as chaining Large Language Models (LLMs), to enhance the quality and accuracy of results. (inspired by [OpenAI Swarm](https://github.com/openai/swarm))
- 🖼️ **Vision Capabilities**: Integrate and process images, allowing for image loading and understanding.
- 📄 **PDF Support**: Support PDF input and understand both text and visual content within documents. (Anthropic, Gemini)
- 🎨 **Image Generation**: Create an original image given a text prompt (DALL-E 3)
- 🔉 **Audio Generation**: Generate a spoken audio response to a prompt. (OpenAI)
- 📜 **Markdown Support**: Enhanced readability with markdown and syntax highlighting capabilities.
- 🤖 **Supported LLMs**: OpenAI, Anthropic, Gemini and more LLMs in the future.
- 🩷 **Share Workflows**: Share cool workflows created by other users (Coming Soon)
- 🌟 **And more...** : Constantly improving with new features!

## How to Install

### 1. Get API Keys 🔑

- You need to obtain at least one API key from Gemini, Anthropic, or OpenAI.
- For OpenAI, go to [API keys - OpenAI API](https://platform.openai.com/api-keys) to get your key.
- For Anthropic, visit [Anthropic Console](https://console.anthropic.com/) to obtain a key.
- For Gemini, go to [Get a Gemini API key | Google AI for Developers](https://ai.google.dev/gemini-api/docs/api-key) to get your key.

### 2. Install Docker Desktop 🐋

- For Windows, go to [Windows | Docker Docs](https://docs.docker.com/desktop/setup/install/windows-install/) to download and install Docker Desktop.
- For Mac, go to [Mac | Docker Docs](https://docs.docker.com/desktop/setup/install/mac-install/) to download and install Docker Desktop.

### 3. Open Docker terminal and pull image 🖥️

- After starting Docker, run `>_ Terminal` at the bottom to enable the Docker Terminal.
- Enter and execute the following command:

```shell
docker pull ghcr.io/skettee/mychatbot:latest
```

### 4. Run myChatbot Container 🚀

- Run the command below and enter your obtained API keys:

```shell
docker run -d -p 3001:3001 --name mychatbot --restart always \
	-e OPENAI_API_KEY=your-openai-api-key \
	-e ANTHROPIC_API_KEY=your-anthropic-api-key \
	-e GEMINI_API_KEY=your-gemini-api-key \
	ghcr.io/skettee/mychatbot:latest
```

### 5. Open a Browser 🧭

- Open your browser and enter the address `localhost:3001`.

## Examples

- Check out the examples on the [myChatbot - 조립식 챗봇 - YouTube](https://www.youtube.com/@myChatbot-k7w) channel.

