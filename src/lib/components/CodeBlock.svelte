<script>
    import hljs from 'highlight.js';
	import 'highlight.js/styles/github-dark.min.css';
    import { browser } from '$app/environment'

    import dayjs from 'dayjs'

    // export let messageId
    // export let codeId
    export let lang
    export let code
    export let done

    $: highlightedCode = code ? hljs.highlightAuto(code, hljs.getLanguage(lang)?.aliases).value : '';

    const LANGINFO = {
        "python": { type: "text/x-python", ext: "py" },
        "fortran": { type: "text/x-fortran", ext: "f" },
        "c": { type: "text/x-c", ext: "c"},
        "cpp": { type: "text/x-c", ext: "cpp"},
        "cshop": { type: "text/x-c", ext: "cs"},
        "css": { type: "text/css", ext: "css"},
        "csv": { type: "text/csv", ext: "csv"},
        "html": { type: "text/html", ext: "html"},
        "java": { type: "text/x-java-source", ext: "java"},
        "javascript": { type: "text/javascript", ext: "js"},
        "json": { type: "application/json", ext: "json"},
        "markdown": { type: "text/markdown", ext: "md"},
        "perl": { type: "application/x-perl", ext: "pl"},
        "plaintext": { type: "text/plain", ext: "txt"},
        "x86asm": { type: "text/x-asm", ext: "asm"},
        "xml": { type: "application/xml", ext: "xml"},
        "yaml": { type: "application/yaml", ext: "yaml"}
    }

    const handleCopy = (code) => {
        if( browser ) {
            navigator.clipboard.writeText(code)
        }
    }

    const handleDownlaod = (lang, code) => {
        const mediaType = LANGINFO[lang].type ? LANGINFO[lang].type : "text/plain"
        const ext = LANGINFO[lang].ext ? LANGINFO[lang].ext : "txt"
        if ( browser ) {
            const name = 'mychatbot_' + dayjs(Date.now()).format('YYYY-MM-DD-HHmmss') + '.' + ext
            const blob = new Blob([code], {type: mediaType})
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

<div>
{#if code}
    <div class="flex justify-between bg-[#2f2f2f] text-stone-400 mt-3 px-4 pt-1 pb-0.5 rounded-t-lg overflow-x-auto">
        <div class="p-1">{lang}</div>
    </div>
    <pre class="hljs p-4 overflow-x-auto scrollbar"><code class="language-{lang} whitespace-pre">{@html highlightedCode || code}</code></pre>
    {#if done}
    <div class="flex justify-start buttons bg-[#2f2f2f] text-stone-300 mb-3 px-4 pt-1 pb-0.5 rounded-b-lg overflow-x-auto">
        <button class="p-1.5 m-1 rounded-lg hover:bg-[#212121]" on:click={()=>handleCopy(code)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" class="w-4 h-4">
                <path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/>
            </svg>
        </button>
        <button class="p-1.5 m-1 rounded-lg hover:bg-[#212121]" on:click={()=>handleDownlaod(lang, code)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" class="w-4 h-4">
                <path d="M480-320 280-520l56-58 104 104v-326h80v326l104-104 56 58-200 200ZM240-160q-33 0-56.5-23.5T160-240v-120h80v120h480v-120h80v120q0 33-23.5 56.5T720-160H240Z"/>
            </svg>
        </button>
    </div>
    {/if}
{/if}
</div>
