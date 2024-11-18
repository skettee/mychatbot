import { LGraph, LiteGraph } from "@comfyorg/litegraph"
import { SSE } from 'sse.js'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

import {chatMessages} from '$lib/store'

// graph
export const graph = new LGraph();

const addChatMessage = (chatMessage) => {
    chatMessages.update((data)=>{
        const id = chatMessage.id
        const founded = data.find( item => item.id == id )
        if( founded ) {
            data = data.map((item) => {
                if(item.id == id) {
                    return { ...item, content: chatMessage.content, done: chatMessage.done }
                }
                return item
            })
            return data
        }
        return [...data, chatMessage]
    })
}

const mapOpenAIMessages = (messages) => {
    return messages.map((item)=>{
        if( item.role == 'system' ) return
        if( item.tool_calls ) {
            // only one ?
            const args = JSON.parse(item.tool_calls[0].function.arguments)
            if(args) return { role: 'assistant', content: item.content? item.content : args.query }
            return
        }
        if( item.role == 'tool') return { role: 'user', content: item.content }
        if (typeof (item.content) == 'object') {
            const textContentList = item.content.filter((item) => ('text' in item))
            const textContent = textContentList.reduce((start, next) => {
                return { type: 'text', text: start.text + '\n---\n' + next.text}
            })
            if(textContent) return { role: item.role, content: textContent.text }
            return
        }
        return { role: item.role, content: item.content }
    }).filter((item)=>item)
}

const mapAnthropicMessages = (messages) => {
    return messages.map((item)=>{
        if (typeof (item.content) == 'object') {
            const textContentList = item.content.filter((item) => ('text' in item))
            const textContent = textContentList.reduce((start, next) => {
                return { type: 'text', text: start.text + '\n---\n' + next.text}
            })
            if(textContent) return { role: item.role, content: textContent.text }
            return
        }
        const toolResultContent = item.content.find((item) => ('tool_use_id' in item))
        if(toolResultContent) return { role: 'user', content: toolResultContent.content }
        return { role: item.role, content: item.content }
    }).filter((item)=>item)
}

//
// Node Classes
//

// AudioInput
class AudioInput {
    constructor() {
        this.title = "Audio File"
        // File uploads are currently limited to 25 MB and 
        // the following input file types are supported: 
        // mp3, mp4, mpeg, mpga, m4a, wav, and webm.
        this._audio = new Audio()
        this._audioStatus = 'stop'
        this._audioUrl = undefined
        this._name = undefined
        this._data = null
        const that = this

        this.addOutput("audio", LiteGraph.EVENT)
        this.addWidget("button", "Play/Pause", "", function () {
            if (that._audioUrl) {
                if (that._audioStatus == 'stop') {
                    that._audio.play()
                    that._audioStatus = 'play'
                }
                else if (that._audioStatus == 'play') {
                    that._audioStatus = 'stop'
                    that._audio.pause()
                }
            }
        })
        this.addWidget("button", "send", "", function () {
            if (that._audioUrl) {
                that.trigger("audio", that._data)
                URL.revokeObjectURL(that._audioUrl)
                that._audioUrl = undefined
            }
        })
    }
    onDropFile(file) {
        // console.log(file)
        if (file.size < 25000000 &&
            (file.type == "audio/mpeg" || file.type == "audio/webm" || file.type == "audio/wav")) {
            // createObjectURL
            if (this._audioUrl) {
                URL.revokeObjectURL(this._audioUrl)
            }
            this._data = file
            this._name = file.name
            this._audioUrl = URL.createObjectURL(file)
            // Audio
            this._audio.src = this._audioUrl
            this._audio.load()
            this._audio.controls = true
            this.boxcolor = "#AEA"
        }
        else {
            this.boxcolor = "red"
            console.error("error loading audio file")
        }
    }
    onRemoved() {
        if (this._audioUrl) {
            URL.revokeObjectURL(this._audioUrl)
        }
    }
}


// OpenAI Audio
class OpenAITranscription {
    constructor() {
        // Properties
        this.properties = {
            model: "whisper-1",
            language: "auto",
            temperature: 0
        }
        this.addInput("audio", LiteGraph.ACTION)
        this.addInput("prompt", "string")
        this.addOutput("content", LiteGraph.EVENT);
        // this.addOutput("text", "string")

        this.addWidget("combo", "language",
            "auto",
            { values: ["auto", "en", "ko", "ja"], property: "language" }
        )

        // colors
        this.title = "OpenAI Transcription"
        this.color = "#223" 
        this.bgcolor = "#335"

        // variables
        this._trigger = false
        this._audio = null
        // this._transcription = null
    }
    onAction(action, param) {
        // console.log(action, param)
        if (action == 'audio') {
            this._audio = param
            this._trigger = true
        }
    }
    onExecute() {
        let PROMPT = this.getInputData(1)

        if (this._trigger) {
            // Build formData
            const formData = new FormData()
            formData.append('file', this._audio)
            formData.append('model', this.properties.model)
            if (PROMPT) formData.append('prompt', PROMPT)
            if (this.properties.language != 'auto') formData.append('language', this.properties.language)

            // Fatch Message
            this.fetch(formData)
            this._trigger = false
            this._audio = null
        }
    }

    fetch(formData) {
        const that = this

        try {
            fetch('/api/openai/audio/transcription', {
                method: 'POST',
                headers: {
                    enctype: 'multipart/form-data'
                },
                body: formData
            }).then((response) => response.json())
                .then((data) => {
                    // that._transcription = data.text
                    addChatMessage({
                        id: uuidv4(),
                        name: that.title,
                        color: "#335",
                        timestamp: Date.now(),
                        role: 'assistant',
                        content: data.text,
                        done: true
                    })
                    that.trigger("content", data)
                })
        } catch (err) { console.error(err)} 
    }
}

//
// OpenAI Chat
//
class OpenAIChat {
    constructor() {
        // Properties
        this.properties = {
            model: "gpt-4o",
            temperature: 1.0
        }
        // Widgets
        this.addWidget("combo", "model",
            "gpt-4o",
            { values: ["gpt-4o", "gpt-4o-mini"], property: "model" }
        )
        this.addWidget("number", "temperature",
            1.0,
            { min: 0, max: 1.0, step: 1, precision: 1, property: "temperature" }
        )
        // Inputs
        this.addInput("messages", LiteGraph.ACTION)
        this.addInput("system", "string")
        this.addInput("agents_info", "object")
        // Outputs
        this.addOutput("assistant", LiteGraph.EVENT)
        this.addOutput("agents_call", LiteGraph.EVENT)
        // this.addOutput("usage", LiteGraph.EVENT)
        //Colors
        this.title = "OpenAI Chat"
        this.color = "#223"
        this.bgcolor = "#335"

        // Variables
        this._isOk = true
        this._trigger = false
        this._messages = null
        this._toolCalls = null
    }
    onAction(action, param) {
        // console.log(action, param);
        if (action == 'messages' && this._isOk) {
            this._messages = param
            this._trigger = true
        }
    }
    onExecute() {
        let SYSTEM = this.getInputData(1)
        let AGENTS = this.getInputData(2)

        if (this._trigger) {
            // Today and time now
            const timestamp = Date.now()
            const today = dayjs(timestamp).format('YYYY-MM-DD')
            const timenow = dayjs(timestamp).format('HH:mm A')
            // Build system message
            const system_datetime = SYSTEM ? SYSTEM : '' + "\nToday is " + today + " and the current time is " + timenow
            this._messages = [{ role: 'system', content: system_datetime }, ...this._messages]

            // Build Body
            let body = {
                model: this.properties.model,
                temperature: this.properties.temperature,
                messages: this._messages,
                stream: true
            }
            // add tools
            if (AGENTS) {
                // Convert to openai format
                const tools = AGENTS.map((item) => {
                    return {
                        type: "function",
                        function: item.agent
                    }
                })

                body.tools = tools
                body.parallel_tool_calls = false
                body.tool_choice = "auto"
            }

            // console.log('OpenAIChat', body)

            // Fatch Message
            this.fetch(body)
            this._trigger = false
        }
    }
    getTools(src, dst) {
        if (src) {
            return dst.map((item2) => {
                // find
                const found = src.find((item1) => item1.index == item2.index)
                // update
                const delta = item2.function.arguments
                if (found && delta) {
                    return {
                        index: found.index,
                        id: found.id,
                        type: found.type,
                        function: {
                            name: found.function.name,
                            arguments: found.function.arguments + delta
                        }
                    }
                }
            })
        }
        else return dst
    }
    fetch(body) {
        this._eventSource = undefined
        this._text = ''
        this._id = undefined
        this._name = this.title

        const that = this

        try {
            this._eventSource = new SSE('/api/stream/openai', {
                headers: {
                    'Content-Type': 'application/json',
                },
                payload: JSON.stringify({ body: body })
            })

            this._eventSource.addEventListener('error', function (err) {
                console.error(err)
                that._isOk = false
            })

            this._eventSource.addEventListener('message', function (e) {
                if (e.data === '[DONE]') {
                    return
                }
                const stream = JSON.parse(e.data)
                that._id = stream.id
                const [{ finish_reason }] = stream.choices
                if (finish_reason === 'stop') {
                    addChatMessage({
                        id: that._id,
                        content: that._text,
                        done: true
                    })
                    that.trigger("assistant", [{ role: 'assistant', content: that._text }])
                }
                if (finish_reason === 'tool_calls') {
                    let assistantMessage = [
                        {
                            role: 'assistant',
                            content: that._text ? that._text : "",
                            tool_calls: that._toolCalls
                        }
                    ]
                    // assistant with tool_calls
                    that.trigger("assistant", assistantMessage)
                    // build agents_call with memory + assistant
                    that._messages = [...that._messages, ...assistantMessage]
                    let agentCall = {
                        type: 'openai',
                        messages: that._messages,
                        calls: that._toolCalls.map((item) => {
                            return {
                                id: item.id,
                                name: item.function.name,
                                arguments: JSON.parse(item.function.arguments)
                            }
                        })
                    }
                    // agents_call
                    that.trigger("agents_call", agentCall)
                    // reset
                    that._toolCalls = null
                }
                const [{ delta }] = stream.choices
                if (delta.content) {
                    that._text = (that._text ?? '') + delta.content
                    addChatMessage({
                        id: that._id,
                        name: that.title,
                        color: "#335",
                        timestamp: Date.now(),
                        role: 'assistant',
                        content: that._text,
                        done: false
                    })
                }
                if (delta.tool_calls) {
                    // console.log('delta.tool_calls', delta.tool_calls)
                    that._toolCalls = that.getTools(that._toolCalls, delta.tool_calls)
                }
            })

        } catch (err) {
            console.error(err)
            this._toolCalls = null
            this._isOk = false
        }
    }
}

// OpenAI Message Builder
class OpenAIInput {
    constructor() {
        // Input
        this.addInput("content", LiteGraph.ACTION)
        this.addInput("agent_result", LiteGraph.ACTION)
        //Output
        this.addOutput("message", LiteGraph.EVENT)

        this.title = "OpenAI Input"
    }
    onGetInputs() {
        return [["agent_result", LiteGraph.ACTION]]
    }
    onAction(action, param) {
        if( action == 'content' ) {
            let imageContent = []
            let textContent = []
            const inputFiles = param.files? param.files : []
            inputFiles.forEach((file) => {
                switch(file.type) {
                    case 'image': 
                        imageContent = [...imageContent, {
                            type: "image_url",
                            image_url: { url: file.src }
                        }]
                        break
                    case 'text':
                        textContent = [...textContent, {
                            type: "text",
                            text: file.src
                        }]
                        break
                }
            });
            const message = [{
                role: "user",
                content: [
                    { type: "text", text: param.text},
                    ...textContent,
                    ...imageContent
                ]
            }]
            this.trigger('message', message)
        }
        else if (action == 'agent_result') {
            const response = param
            this.trigger('message', [{ role: 'tool', content: response.content, tool_call_id: response.id }])
        }
    }
}

//
// Anthropic Chat
//
class AnthropicChat {
    constructor() {
        // Properties
        this.properties = {
            model: "claude-3-5-sonnet-20241022",
            temperature: 1.0,
            maxTokens: 8192
        }
        // Widgets
        this.addWidget("combo", "model",
            "claude-3-5-sonnet-20241022",
            { values: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"], property: "model" }
        )
        this.addWidget("number", "temperature",
            1.0,
            { min: 0, max: 1.0, step: 1, precision: 1, property: "temperature" }
        )
        // Inputs
        this.addInput("messages", LiteGraph.ACTION)
        this.addInput("system", "string")
        this.addInput("agents_info", "object")

        // Outputs
        this.addOutput("assistant", LiteGraph.EVENT)
        this.addOutput("agents_call", LiteGraph.EVENT)
        // this.addOutput("usage", LiteGraph.EVENT);

        // Colors
        this.title = "Anthropic Chat"
        this.color = "#323"
        this.bgcolor = "#535"

        // Variables
        this._isOk = true
        this._trigger = false
        this._messages = null
        this._toolUse = {
            id: null,
            name: null,
            input: null
        }
    }
    onAction(action, param) {
        // console.log(action, param);
        if (action == 'messages' && this._isOk) {
            // this.fetch(param)
            this._messages = param
            this._trigger = true
        }
    }
    onExecute() {
        let SYSTEM = this.getInputData(1)
        let AGENTS = this.getInputData(2)

        if (this._trigger) {
            // Build Body
            let body = {
                model: this.properties.model,
                max_tokens: this.properties.maxTokens,
                temperature: this.properties.temperature,
                messages: this._messages,
                stream: true
            }
            // Today and time now
            const timestamp = Date.now()
            const today = dayjs(timestamp).format('YYYY-MM-DD')
            const timenow = dayjs(timestamp).format('HH:mm A')
            // Build system message
            const system_datetime = SYSTEM ? SYSTEM : '' + "\nToday is " + today + " and the current time is " + timenow
            body.system = system_datetime

            // Add tools
            if (AGENTS) {
                // Convert to anthropic format
                const tools = AGENTS.map((item) => {
                    let tool = {
                        name: item.agent.name,
                        description: item.agent.description,
                        input_schema: item.agent.parameters
                    }
                    return tool
                })
                body.tools = tools
                body.tool_choice = { type: "auto" }
            }

            // console.log('AnthropicChat', body)

            // Fatch Message
            this.fetch(body)
            this._trigger = false
        }
    }
    fetch(body) {
        this._eventSource = undefined
        this._text = ''
        this._id = undefined
        this._name = this.title

        const that = this

        try {
            this._eventSource = new SSE('/api/stream/anthropic', {
                headers: {
                    'Content-Type': 'application/json',
                },
                payload: JSON.stringify({ body: body })
            })

            this._eventSource.addEventListener('error', function (err) {
                console.error(err)
                that._isOk = false
            })

            this._eventSource.addEventListener('message_start', function (e) {
                const stream = JSON.parse(e.data)
                that._id = stream.message.id
            })
            this._eventSource.addEventListener('content_block_start', function (e) {
                const stream = JSON.parse(e.data)
                if (that._id && stream.content_block.type === "text") {
                    addChatMessage({
                        id: that._id,
                        name: that.title,
                        color: "#535",
                        timestamp: Date.now(),
                        role: 'assistant',
                        content: that._text,
                        done: false
                    })
                }
                if (that._id && stream.content_block.type === "tool_use") {
                    that._toolUse.id = stream.content_block.id
                    that._toolUse.name = stream.content_block.name
                }
            })
            this._eventSource.addEventListener('ping', function () { })
            this._eventSource.addEventListener('content_block_delta', function (e) {
                const stream = JSON.parse(e.data)
                // console.log(stream)
                if (stream.delta.type === 'text_delta') {
                    that._text = (that._text ?? '') + stream.delta.text
                    addChatMessage({
                        id: that._id,
                        content: that._text,
                        done: false
                    })
                }
                if (stream.delta.type === "input_json_delta") {
                    that._toolUse.input = (that._toolUse.input ?? '') + stream.delta.partial_json
                }

            })
            this._eventSource.addEventListener('content_block_stop', function () { })
            this._eventSource.addEventListener('message_delta', function () { })
            this._eventSource.addEventListener('message_stop', function () {
                addChatMessage({
                    id: that._id,
                    content: that._text,
                    done: true
                })
                let content = [{ type: 'text', 'text': that._text }]
                if (that._toolUse.id) {
                    content = [...content,
                    {
                        type: 'tool_use',
                        id: that._toolUse.id,
                        name: that._toolUse.name,
                        input: JSON.parse(that._toolUse.input)
                    }
                    ]
                }
                let assistantMessage = [{ role: 'assistant', content: content }]
                // assistant with tool_use
                that.trigger("assistant", assistantMessage)
                // build agents_call with memory
                if (that._toolUse.id) {
                    // get tool
                    let toolInput = JSON.parse(that._toolUse.input)
                    // build agents_call with memory + assistant
                    that._messages = [...that._messages, ...assistantMessage]
                    let agentCall = {
                        type: 'anthropic',
                        messages: that._messages,
                        calls: [{
                            id: that._toolUse.id,
                            name: that._toolUse.name,
                            arguments: toolInput
                        }]
                    }
                    // agents_call
                    that.trigger("agents_call", agentCall)
                }
                // reset
                that._toolUse = { id: null, name: null, input: null }
            })
        } catch (err) {
            console.error(err)
            this._toolUse = { id: null, name: null, input: null }
            this._isOk = false
        }
    }
}

// Anthropic Message Builder
class AnthropicInput {
    constructor() {
        // Input
        this.addInput("content", LiteGraph.ACTION)
        this.addInput("agent_result", LiteGraph.ACTION)
        //Output
        this.addOutput("message", LiteGraph.EVENT)

        this.title = "Anthropic Input"
    }
    onGetInputs() {
        return [["agent_result", LiteGraph.ACTION]]
    }
    onAction(action, param) {
        if( action == 'content' ) {
            let imageContent = []
            let textContent = []
            let pdfContent = []
            const inputFiles = param.files? param.files : []
            inputFiles.forEach((file) => {
                switch(file.type) {
                    case 'image': 
                        imageContent = [...imageContent, {
                            type: "image",
                            source: {
                                type: "base64",
                                media_type: file.media_type,
                                data: file.src.replace('data:', '').replace(/^.+,/, '')
                            }
                        }]
                        break
                    case 'text':
                        textContent = [...textContent, {
                            type: "text",
                            text: file.src,
                            cache_control: { type: "ephemeral" }
                        }]
                        break
                    case 'pdf':
                        pdfContent = [...pdfContent, {
                            type: "document",
                            source: {
                                type: "base64",
                                media_type: file.media_type,
                                data: file.src.replace('data:', '').replace(/^.+,/, '')
                            },
                            cache_control: { type: "ephemeral" }
                        }]
                        break
                }
            });
            const message = [{
                role: "user",
                content: [
                    ...pdfContent,
                    ...imageContent,
                    ...textContent,
                    { type: "text", text: param.text}
                ]
            }]
            this.trigger('message', message)
        }
        else if (action == 'agent_result') {
            const response = param
            // console.log('result:', param)
            this.trigger('message', [{
                role: 'user', content: [
                    { type: 'tool_result', content: response.content, tool_use_id: response.id }
                ]
            }])
        }
    }
}

class Input {
    constructor() {
        this.addOutput("content", LiteGraph.EVENT)

        this.title = "Chat Input";
        this.color = "#233"
        this.bgcolor = "#355"
    }
    chat(param) {
        addChatMessage({
            id: uuidv4(),
            name: 'User',
            color: "#355",
            timestamp: Date.now(),
            role: 'user',
            content: param.text,
            done: true
        })

        this.trigger('content', param)
    }
}

class Memory {
    constructor() {
        this.addInput("user", LiteGraph.ACTION)
        this.addInput("assistant", LiteGraph.ACTION)
        this.addOutput("messages", LiteGraph.EVENT)
        this.properties = {}

        const that = this
        this.addWidget("button", "reset", "", function () {
            that._history = []
        })
        this.title = "Chat Memory"

        this._history = []
    }
    onAction(action, param) {
        if (action == 'user' && typeof (param) == 'object') {
            this._history = [...this._history, ...param]
            this.trigger('messages', this._history)
        }
        else if (action == 'assistant' && typeof (param) == 'object') {
            this._history = [...this._history, ...param]
        }
    }
}

class PromptTemplate {
    constructor() {
        this.addInput("var1", "string")
        this.addInput("var2", "string")
        this.addInput("var3", "string")
        this.addOutput("text", "string")
        this.addOutput("text", LiteGraph.EVENT)

        this._prompt = this.addWidget("text", "", "Refer to {var1}", function () { }, { multiline: true })
        this._var1 = undefined
        this._var2 = undefined
        this._var3 = undefined
        const that = this
        this.addWidget("button", "send", "", function () {
            if (that._prompt.value) {
                let prompt = that._prompt.value
                if (that._var1) {
                    prompt = prompt.replace("{var1}", that._var1)
                }
                if (that._var2) {
                    prompt = prompt.replace("{var2}", that._var2)
                }
                if (that._var3) {
                    prompt = prompt.replace("{var3}", that._var3)
                }
                that.trigger("text", prompt)
            }
        })
        this.serialize_widgets = true
        this.title = 'Prompt Template'
    }
    onExecute() {
        this._var1 = this.getInputData(0)
        this._var2 = this.getInputData(1)
        this._var3 = this.getInputData(2)
        let prompt = this._prompt.value
        if (this._var1) {
            prompt = prompt.replace("{var1}", this._var1)
        }
        if (this._var2) {
            prompt = prompt.replace("{var2}", this._var2)
        }
        if (this._var3) {
            prompt = prompt.replace("{var3}", this._var3)
        }

        this.setOutputData(0, prompt)
    }
}

// Text
class PromptText {
    constructor() {
        this.addOutput("text", "string")
        this.addOutput("text", LiteGraph.EVENT)

        this._prompt = this.addWidget("text", "", "You are a helpful AI assistant.", function () { }, { multiline: true })
        const that = this
        this.addWidget("button", "send", "", function () {
            if (that._prompt.value) {
                that.trigger("text", that._prompt.value)
            }
        })

        this.serialize_widgets = true
        this.title = "Prompt Text"
    }
    onExecute() {
        this.setOutputData(0, this._prompt.value)
    }
}

// Print
class PrintEventSlot {
    constructor() {
        this.addInput("event", LiteGraph.ACTION)

        this.title = "Print Event"
        this.color = "#322"
        this.bgcolor = "#533"
    }
    onAction(action, param) {
        if (action == 'event') {
            let content = undefined
            switch (typeof (param)) {
                case 'object':
                    content = "```json\n" + JSON.stringify(param, null, 2) + "\n```"
                    break
                case 'string':
                    content = "<pre>" + param + "</pre>"
                    break
                case 'number':
                    content = "<pre>" + param.toString() + "</pre>"
                    break
                default:
                    content = "<pre> undefined </pre>"
            }

            addChatMessage({
                id: uuidv4(),
                name: this.title,
                color: "#533",
                timestamp: Date.now(),
                role: 'assistant',
                content: content,
                done: true
            })
        }
    }
}

class PrintSlot {
    constructor() {
        this._string = undefined
        this._object = undefined

        this.addInput("object", "object")
        this.addInput("string", "string")

        const that = this
        this.addWidget("button", "print", "", function () {
            let content = undefined
            if (that._string && !that._object) {
                content = "<pre>" + that._string + "</pre>"
                addChatMessage({
                    id: uuidv4(),
                    name: that.title,
                    color: "#533",
                    timestamp: Date.now(),
                    role: 'assistant',
                    content: content,
                    done: true
                })
            }
            else if (that._object && !that._string) {
                content = "```json\n" + JSON.stringify(that._object, null, 2) + "\n```"
                addChatMessage({
                    id: uuidv4(),
                    name: that.title,
                    color: "#533",
                    timestamp: Date.now(),
                    role: 'assistant',
                    content: content,
                    done: true
                })
            }
        })

        this.title = "Print Slot"
        this.color = "#322"
        this.bgcolor = "#533"
    }
    onExecute() {
        this._object = this.getInputData(0)
        this._string = this.getInputData(1)
    }
}

//
// Agents
//

// OpenAI Agent
class AgentOpenAI {
    constructor() {
        // Properties
        this.properties = {
            name: "transfer_to_writing",
            desc: "Transfer to Writing Agent for writing report, code, novel etc.",
            model: "gpt-4o",
            temperature: 1.0
        }

        this._inputTools = undefined
        this._messages = []
        this._call = undefined

        // Widgets
        this.addWidget("text", "name", this.properties.name, function () { }, { property: "name" })
        this.addWidget("text", "desc", this.properties.desc, function () { }, { multiline: true, property: "desc" })
        this.addWidget("combo", "model",
            "gpt-4o",
            { values: ["gpt-4o", "gpt-4o-mini"], property: "model" }
        )
        this.addWidget("number", "temperature",
            1.0,
            { min: 0, max: 1.0, step: 1, precision: 1, property: "temperature" }
        )
        // Inputs
        this.addInput("info(chain)", "object")
        this.addInput("instruction", "string")
        this.addInput("agent_call", LiteGraph.ACTION)

        // Outputs
        this.addOutput("info(chain)", "object")
        this.addOutput("agent_result", LiteGraph.EVENT)

        this.title = "Agent (OpenAI)"
        this.color = "#223"
        this.bgcolor = "#335"

        // Flags
        this._isOk = true
        this._trigger = false

    }
    onAction(action, param) {
        if (action == 'agent_call') {
            // check agent name
            let calls = param.calls
            this._call = calls.find((item) => item.name == this.properties.name)
            if (this._call) {
                // rebuild messages
                const type = param.type
                if( type == 'openai' ) {this._messages = mapOpenAIMessages(param.messages)}
                else if(type == 'anthropic') {this._messages = mapAnthropicMessages(param.messages)}
                // add user message
                this._messages = [...this._messages,
                { role: 'user', content: this._call.arguments.query }]

                // console.log('agent messages', this._messages)
                this._trigger = true
            }
        }
    }
    onExecute() {
        // Build tool
        let TOOL = [{
            "agent": {
                "name": this.properties.name,
                "description": this.properties.desc,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The query that is specific and descriptive."
                        }
                    }
                }
            }
        }]

        let INPUT_TOOLS = this.getInputData(0)
        let SYSTEM = this.getInputData(1)

        if (INPUT_TOOLS) {
            let parsed = INPUT_TOOLS
            this.setOutputData(0, [...parsed, ...TOOL])
        }
        else {
            this.setOutputData(0, TOOL)
        }

        if (this._trigger) {
            if (SYSTEM) {
                this._messages = [{ role: 'system', content: SYSTEM }, ...this._messages]
            }
            // Build Body
            let body = {
                model: this.properties.model,
                temperature: this.properties.temperature,
                messages: this._messages,
                stream: true
            }
            // console.log('AgentOpenAI', body)

            // fatch Message
            this.fetch(body)
            this._trigger = false
        }
    }
    fetch(body) {
        this._eventSource = undefined
        this._text = ''
        this._id = undefined
        this._name = this.title

        const that = this

        try {
            this._eventSource = new SSE('/api/stream/openai', {
                headers: {
                    'Content-Type': 'application/json',
                },
                payload: JSON.stringify({ body: body })
            })

            this._eventSource.addEventListener('error', function (err) {
                console.error(err)
                that._isOk = false
            })

            this._eventSource.addEventListener('message', function (e) {
                if (e.data === '[DONE]') {
                    return
                }
                const stream = JSON.parse(e.data)
                that._id = stream.id
                const [{ finish_reason }] = stream.choices
                if (finish_reason === 'stop') {
                    addChatMessage({
                        id: that._id,
                        content: that._text,
                        done: true
                    })
                    const agentResult = {
                        id: that._call.id,
                        content: (that._text) ? that._text : ''
                    }
                    that.trigger("agent_result", agentResult)
                }
                const [{ delta }] = stream.choices
                if (delta.content) {
                    that._text = (that._text ?? '') + delta.content
                    addChatMessage({
                        id: that._id,
                        name: that.title,
                        color: "#335",
                        timestamp: Date.now(),
                        role: 'assistant',
                        content: that._text,
                        done: false
                    })
                }
            })

        } catch (err) {
            console.error(err)
            this._isOk = false
        }
    }
}

// Anthropic Agent
class AgentAnthropic {
    constructor() {
        // Properties
        this.properties = {
            name: "transfer_to_writing",
            desc: "Transfer to Writing Agent for writing report, code, novel etc.",
            model: "claude-3-5-sonnet-20241022",
            temperature: 1.0,
            maxTokens: 8192
        }

        this._inputTools = undefined
        this._messages = []
        this._call = undefined

        // Widgets
        this.addWidget("text", "name", this.properties.name, function () { }, { property: "name" })
        this.addWidget("text", "desc", this.properties.desc, function () { }, { multiline: true, property: "desc" })
        this.addWidget("combo", "model",
            "claude-3-5-sonnet-20241022",
            { values: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"], property: "model" }
        )
        this.addWidget("number", "temperature",
            1.0,
            { min: 0, max: 1.0, step: 1, precision: 1, property: "temperature" }
        )
        // Inputs
        this.addInput("info(chain)", "object")
        this.addInput("instruction", "string")
        this.addInput("agent_call", LiteGraph.ACTION)

        // Outputs
        this.addOutput("info(chain)", "object")
        this.addOutput("agent_result", LiteGraph.EVENT)

        this.title = "Agent (Anthropic)"
        this.color = "#323"
        this.bgcolor = "#535"

        // Flags
        this._isOk = true
        this._trigger = false
    }
    onAction(action, param) {
        if (action == 'agent_call') {
            // check agent name
            let calls = param.calls
            this._call = calls.find((item) => item.name == this.properties.name)
            if (this._call) {
                // rebuild messages
                const type = param.type
                if( type == 'openai' ) {this._messages = mapOpenAIMessages(param.messages)}
                else if(type == 'anthropic') {this._messages = mapAnthropicMessages(param.messages)}
                
                // add user message
                this._messages = [...this._messages,
                { role: 'user', content: this._call.arguments.query }]

                this._trigger = true
            }
        }
    }
    onExecute() {
        // Build tool
        let TOOL = [{
            "agent": {
                "name": this.properties.name,
                "description": this.properties.desc,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The query that is specific and descriptive."
                        }
                    }
                }
            }
        }]

        let INPUT_TOOLS = this.getInputData(0)
        let SYSTEM = this.getInputData(1)

        if (INPUT_TOOLS) {
            let parsed = INPUT_TOOLS
            this.setOutputData(0, [...parsed, ...TOOL])
        }
        else {
            this.setOutputData(0, TOOL)
        }

        if (this._trigger) {
            // Build Body
            let body = {
                model: this.properties.model,
                max_tokens: this.properties.maxTokens,
                temperature: this.properties.temperature,
                messages: this._messages,
                stream: true
            }

            if (SYSTEM) {
                body.system = SYSTEM
            }

            // console.log('AgentAnthropic', body)

            // Fatch Message
            this.fetch(body)
            this._trigger = false
        }
    }
    fetch(body) {
        this._eventSource = undefined
        this._text = ''
        this._id = undefined
        this._name = this.title

        const that = this

        try {
            this._eventSource = new SSE('/api/stream/anthropic', {
                headers: {
                    'Content-Type': 'application/json',
                },
                payload: JSON.stringify({ body: body })
            })

            this._eventSource.addEventListener('error', function (err) {
                console.error(err)
                that._isOk = false
            })

            this._eventSource.addEventListener('message_start', function (e) {
                const stream = JSON.parse(e.data)
                that._id = stream.message.id
            })
            this._eventSource.addEventListener('content_block_start', function (e) {
                const stream = JSON.parse(e.data)
                if (that._id && stream.content_block.type === "text") {
                    addChatMessage({
                        id: that._id,
                        name: that.title,
                        color: "#535",
                        timestamp: Date.now(),
                        role: 'assistant',
                        content: that._text,
                        done: false
                    })
                }
            })
            this._eventSource.addEventListener('ping', function () { })
            this._eventSource.addEventListener('content_block_delta', function (e) {
                const stream = JSON.parse(e.data)
                that._text = (that._text ?? '') + stream.delta.text
                addChatMessage({
                    id: that._id,
                    content: that._text,
                    done: false
                })
            })
            this._eventSource.addEventListener('content_block_stop', function () { })
            this._eventSource.addEventListener('message_delta', function () { })
            this._eventSource.addEventListener('message_stop', function () {
                addChatMessage({
                    id: that._id,
                    content: that._text,
                    done: true
                })
                const agentResult = {
                    id: that._call.id,
                    content: (that._text) ? that._text : ''
                }
                that.trigger("agent_result", agentResult)
            })

        } catch (err) {
            console.error(err)
            this._isOk = false
        }
    }
}

// Perplexity Agent
class AgentPerplexity {
    constructor() {
        // Properties
        this.properties = {
            name: "transfer_to_research",
            desc: "Transfer to Research Agent for deep research using web search",
            model: "llama-3.1-sonar-large-128k-online",
            temperature: 0.2
        }

        this._inputTools = undefined
        this._messages = []
        this._call = undefined

        // Widgets
        this.addWidget("text", "name", this.properties.name, function () { }, { property: "name" })
        this.addWidget("text", "desc", this.properties.desc, function () { }, { multiline: true, property: "desc" })
        this.addWidget("combo", "model",
            "llama-3.1-sonar-large-128k-online",
            {
                values: ["llama-3.1-sonar-large-128k-online",
                    "llama-3.1-sonar-small-128k-online",
                    "llama-3.1-sonar-huge-128k-online"],
                property: "model"
            }
        )
        // this.addWidget("number", "temperature",
        //     0.2,
        //     { min: 0, max: 1.0, step: 1, precision: 1, property: "temperature" }
        // )
        // Inputs
        this.addInput("info(chain)", "object")
        this.addInput("instruction", "string")
        this.addInput("agent_call", LiteGraph.ACTION)

        // Outputs
        this.addOutput("info(chain)", "object")
        this.addOutput("agent_result", LiteGraph.EVENT)

        this.title = "Agent (Perplexity)"
        this.color = "#432"
        this.bgcolor = "#653"

        // Flags
        this._isOk = true
        this._trigger = false
    }
    onAction(action, param) {
        if (action == 'agent_call') {
            // check agent name
            let calls = param.calls
            this._call = calls.find((item) => item.name == this.properties.name)
            if (this._call) {
                // rebuild messages
                const type = param.type
                if( type == 'openai' ) {this._messages = mapOpenAIMessages(param.messages)}
                else if(type == 'anthropic') {this._messages = mapAnthropicMessages(param.messages)}
                // add user message
                this._messages = [...this._messages,
                { role: 'user', content: this._call.arguments.query }]
                this._trigger = true
            }
        }
    }
    onExecute() {
        // Build tool (OpenAI format)
        let TOOL = [{
            "agent": {
                "name": this.properties.name,
                "description": this.properties.desc,
                "parameters": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "The query that is specific and descriptive."
                        }
                    }
                }
            }
        }]

        let INPUT_TOOLS = this.getInputData(0)
        let SYSTEM = this.getInputData(1)

        if (INPUT_TOOLS) {
            let parsed = INPUT_TOOLS
            this.setOutputData(0, [...parsed, ...TOOL])
        }
        else {
            this.setOutputData(0, TOOL)
        }

        if (this._trigger) {
            // Build system message
            if (SYSTEM) {
                this._messages = [{ role: 'system', content: SYSTEM }, ...this._messages]
            }
            // Build Body
            let body = {
                model: this.properties.model,
                temperature: this.properties.temperature,
                messages: this._messages,
                stream: true
            }
            // console.log('AgentPerplexity', body)

            // fatch Message
            this.fetch(body)
            this._trigger = false
        }
    }
    fetch(body) {
        this._eventSource = undefined
        this._text = ''
        this._id = undefined
        this._name = this.title

        const that = this

        try {
            this._eventSource = new SSE('/api/stream/perplexity', {
                headers: {
                    'Content-Type': 'application/json',
                },
                payload: JSON.stringify({ body: body })
            })

            this._eventSource.addEventListener('error', function (err) {
                console.error(err)
                that._isOk = false
            })

            this._eventSource.addEventListener('message', function (e) {
                const stream = JSON.parse(e.data)
                that._id = stream.id
                const [{ finish_reason }] = stream.choices
                if (finish_reason === 'stop') {
                    addChatMessage({
                        id: that._id,
                        content: that._text,
                        done: true
                    })
                    const agentResult = {
                        id: that._call.id,
                        content: (that._text) ? that._text : ''
                    }
                    that.trigger("agent_result", agentResult)
                }
                const [{ delta }] = stream.choices
                if (delta.content) {
                    that._text = (that._text ?? '') + delta.content
                    addChatMessage({
                        id: that._id,
                        name: that.title,
                        color: "#653",
                        timestamp: Date.now(),
                        role: 'assistant',
                        content: that._text,
                        done: false
                    })
                }
            })

        } catch (err) {
            console.error(err)
            this._isOk = false
        }
    }
}

// Register in the system

// Chat
LiteGraph.registerNodeType("chat/input", Input)
LiteGraph.registerNodeType("chat/memory", Memory)
// OpenAI
LiteGraph.registerNodeType("openai/input", OpenAIInput)
LiteGraph.registerNodeType("openai/chat", OpenAIChat)
LiteGraph.registerNodeType("openai/audio", OpenAITranscription)
// Anthropic
LiteGraph.registerNodeType("anthropic/input", AnthropicInput)
LiteGraph.registerNodeType("anthropic/chat", AnthropicChat )

// Prompt
LiteGraph.registerNodeType("prompt/text", PromptText )
LiteGraph.registerNodeType("prompt/template", PromptTemplate)
// File
LiteGraph.registerNodeType("file/audio", AudioInput )
// Agent
LiteGraph.registerNodeType("agent/openai", AgentOpenAI)
LiteGraph.registerNodeType("agent/anthropic", AgentAnthropic)
LiteGraph.registerNodeType("agent/perplexity", AgentPerplexity)
// Debug
LiteGraph.registerNodeType("print/event", PrintEventSlot)
LiteGraph.registerNodeType("print/slot", PrintSlot)
