<script>
    import { marked } from 'marked'
    import auto_render from 'katex/dist/contrib/auto-render.min.js';
    import 'katex/dist/katex.min.css';
    import CodeBlock from './CodeBlock.svelte';
    import { onMount } from 'svelte';

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
                    { left: '$$', right: '$$', display: false },
                    { left: '$ ', right: ' $', display: false },
                    { left: '\\(', right: '\\)', display: false },
                    { left: '\\[', right: '\\]', display: false },
                    { left: '[ ', right: ' ]', display: false }
                ],
                // • rendering keys, e.g.:
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

    const bgColor = String.raw`bg-[` + message.color + String.raw`]`


    onMount(()=>{
        messageElement = document.getElementById('chat-assistant');
        // console.log(messageElement)
        renderLatex()
    })

    let tokens
    let renderer

    $: if(message) {
        tokens = marked.lexer(message.content);
        // console.log(tokens)

        renderer = new marked.Renderer();

        renderer.codespan = (token) => {
            // console.log(token.text)
            return `<code>${token.text.replaceAll('&amp;', '&')}</code>`;
        };
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
        <div id="chat-assistant" class="prose w-full max-w-full font-serif dark:prose-invert prose-headings:my-0 prose-p:m-0 prose-pre:my-2 prose-table:my-0 prose-blockquote:my-0 prose-img:my-0 prose-ul:-my-4 prose-ol:-my-4 prose-li:-my-2 prose-em:font-sans prose-em:text-sm prose-em:text-[#b37eb5] whitespace-pre-line">
            <div>
                <div class="w-full">
                    {#each tokens as token}
                        {#if token.type === 'code'}
                            <CodeBlock
                                lang={token.lang}
                                code={token.text}
                            />
                        {:else}
                            {@html marked.parse(token.raw, {
                                ...marked.getDefaults(),
                                gfm: true,
                                breaks: true,
                                renderer
                            })}
                        {/if}
                    {/each}
                </div>
            </div>
        </div>
    </div>
</div>
