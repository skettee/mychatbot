<script>
    import { marked } from 'marked'
    import auto_render from 'katex/dist/contrib/auto-render.min.js';
    import 'katex/dist/katex.min.css';
    import CodeBlock from './CodeBlock.svelte';
    import { tick } from 'svelte';
    import { browser } from '$app/environment'

    import dayjs from 'dayjs'

    export let message

    const timestamp = dayjs(message.timestamp).format('MM/DD/YYYY HH:mm')

    let messageElement;

    const renderLatex = () => {
        if (messageElement) {
            auto_render(messageElement, {
                // customised options
                // • auto-render specific keys, e.g.:
                delimiters: [
                    { left: '$$', right: '$$', display: true },
                    { left: '$ ', right: ' $', display: false },
                    { left: '\[ ', right: ' \]', display: true },
                    { left: '\( ', right: ' \)', display: false }
                ],
                // • rendering keys, e.g.:
                output: 'html',
                throwOnError: false
            });
        }
    };

    const colorVariants = {
        '#533': 'bg-[#533]',        // red
        '#593930': 'bg-[#593930]',  // brown
        '#353': 'bg-[#353]',        // green
        '#335': 'bg-[#335]',        // blue
        '#3f5159': 'bg-[#3f5159]',  // pale_blue
        '#355': 'bg-[#355]',        // cyan
        '#535': 'bg-[#535]',        // purple
        '#653': 'bg-[#653]',        // yellow
        '#000': 'bg-[#222]'         // black
    }

    // onMount(()=>{
    //     messageElement = document.getElementById('chat-assistant');
    //     // console.log(messageElement)
    //     // renderLatex()
    // })

    let tokens = []
    let renderer = undefined

    $: if(message) {
        // Workaround for openai math equations
        const msg = message.content.replaceAll('\\[\n', '\\[ ').replaceAll('\n\\]', ' \\]')
        tokens = marked.lexer(msg);
        // console.log(tokens)

        renderer = new marked.Renderer();
        renderer.codespan = (token) => {
            // console.log(token.text)
            return `<code>${token.text.replaceAll('&amp;', '&')}</code>`;
        };

        tick().then(()=>renderLatex())
    }

    const handleCopy = (content) => {
        if( browser ) {
            navigator.clipboard.writeText(content)
        }
    }

    const handleDownlaod = (content) => {
        if ( browser ) {
            const name = 'myChatbot ' + dayjs(Date.now()).format('YYYY-MM-DD HHmmss') + '.txt'
            // console.log(name)
            const blob = new Blob([content], {type:'text/plain'})
            const url = URL.createObjectURL(blob)

            const a = document.createElement('a')
            a.style.display = 'none'
            a.href = url
            a.download = name
            document.body.appendChild(a)

            a.click()

            setTimeout(() => {
                document.body.removeChild(a)
                URL.revokeObjectURL(url)
            }, 100)
        }
    }

</script>
<div class="flex w-full pb-1" id={message.id}>
    <div class="mr-4">
        <div class='relative w-7 h-7 flex justify-center items-center rounded-full {colorVariants[message.color]}'>
            <span class='text-gray-100 text-sm font-bold'>{message.name.trim()[0].toUpperCase()}</span>
        </div>
    </div>
    <div class="w-full overflow-hidden">
        <div class="self-center font-bold mb-0.5 capitalize line-clamp-1">
            {message.name}
            <span class="invisible group-hover:visible text-gray-400 text-xs font-medium">{timestamp}</span>
        </div>
        <div id="chat-assistant" bind:this={messageElement} class="prose w-full max-w-full font-serif dark:prose-invert prose-headings:my-0 prose-p:m-0 prose-table:my-0 prose-blockquote:my-0 prose-img:my-0 prose-ul:-my-4 prose-ol:-my-4 prose-li:-my-2 prose-em:font-sans prose-em:text-sm prose-em:text-[#b37eb5] whitespace-pre-line">
            <div>
                <div class="w-full">
                    {#each tokens as token, tokenIdx}
                        {#if token.type === 'code'}
                            <CodeBlock
                                lang={token.lang}
                                code={token.text}
                                done={message.done}
                            />
                        {:else}
                            {@html marked.parse(token.raw, {
                                ...marked.getDefaults(),
                                renderer
                            })}
                        {/if}
                    {/each}
                </div>
            </div>
            {#if message.done}
            <div class=" flex justify-end overflow-x-auto buttons text-stone-900 dark:text-stone-300">
                <button class="p-1.5 mr-1 rounded-lg hover:bg-stone-300 dark:hover:bg-[#2f2f2f]" on:click={()=>handleCopy(message.content)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" class="w-4 h-4">
                        <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/>
                    </svg>
                </button>
                <button class="p-1.5 mr-1 rounded-lg hover:bg-stone-300 dark:hover:bg-[#2f2f2f]" on:click={()=>handleDownlaod(message.content)}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" class="w-4 h-4">
                        <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
                    </svg>
                </button>
            </div>
            {/if}
        </div>
    </div>
</div>
