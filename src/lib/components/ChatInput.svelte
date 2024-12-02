<script>
    import { tick, afterUpdate } from 'svelte';
    import tooltip from "$lib/tooltip.js"

    export let handleSubmit

    const MAX_IMAGE_SIZE = 5000000  // Anthropic limitation
    const IMAGE_TYPE = ['image/gif', 'image/webp', 'image/jpeg', 'image/png']
    const PDF_TYPE = ['application/pdf']
    const TEXT_TYPE = ['text/x-python', 'text/x-fortran', 'text/x-c', 
                    'text/x-asm', 'text/x-java-source', 'text/x-pascal',
                    'text/css', 'text/csv', 'text/html', 'text/javascript',
                    'text/plain', 'text/markdown', 'application/json', 'application/xml',
                    'application/x-perl', 'application/yaml']
    const AUDIO_TYPE = ['audio/mpeg', 'audio/mp3', 'audio/wav']

    let prompt = ''
    let chatTextAreaElement
    let filesInputElement = undefined
    let files = []
    let inputFiles

    $: if (prompt) {
		if (chatTextAreaElement) {
			chatTextAreaElement.style.height = '';
			chatTextAreaElement.style.height = Math.min(chatTextAreaElement.scrollHeight, 200) + 'px';
		}
	}

    $: disabled = false

    afterUpdate( async ()=>{
        await tick()
        chatTextAreaElement.focus()
    })

    const handleChange = async () => {
        if (inputFiles && inputFiles.length > 0) {
            const _inputFiles = Array.from(inputFiles)
            _inputFiles.forEach((file)=>{
                // console.log(file.type)
                if( IMAGE_TYPE.includes(file.type) && file.size < MAX_IMAGE_SIZE ) {
                    let reader = new FileReader()
                    reader.onload = (e) => {
                        files = [...files, {
                            type: 'image',
                            subtype: getSubtype(file.type, file.name),
                            media_type: file.type,
                            name: file.name,
                            src: e.target.result
                        }]
                    }
                    reader.readAsDataURL(file)
                }
                else if(PDF_TYPE.includes(file.type)) {
                    let reader = new FileReader()
                    reader.onload = (e) => {
                        files = [...files, {
                            type: 'pdf',
                            subtype: getSubtype(file.type, file.name),
                            media_type: file.type,
                            name: file.name,
                            src: e.target.result
                        }]
                    }
                    reader.readAsDataURL(file)
                }
                else if(AUDIO_TYPE.includes(file.type)) {
                    let reader = new FileReader()
                    reader.onload = (e) => {
                        files = [...files, {
                            type: 'audio',
                            subtype: getSubtype(file.type, file.name),
                            media_type: file.type,
                            name: file.name,
                            src: e.target.result
                        }]
                    }
                    reader.readAsDataURL(file)
                }
                else if(TEXT_TYPE.includes(file.type)) {
                    let reader = new FileReader()
                    reader.onload = (e) => {
                        files = [...files, {
                            type: 'text',
                            subtype: getSubtype(file.type, file.name),
                            media_type: file.type,
                            name: file.name,
                            src: e.target.result
                        }]
                    }
                    reader.readAsText(file)
                }
            })
            inputFiles = null
            filesInputElement.value = ''
        }
    }

    const getSubtype = (type, name) => {
        const TYPE2SUBTYPE = {
            'image/gif': 'gif',
            'image/jpeg': 'jpeg',
            'image/png': 'png',
            'image/webp': 'webp',
            'text/x-python': 'python',
            'text/x-fortran': 'fortran',
            'text/x-asm': 'assembly',
            'text/x-java-source': 'java',
            'text/x-pascal': 'pascal',
            'text/css': 'css',
            'text/html': 'html',
            'text/javascript': 'javascript',
            'text/plain': 'text',
            'text/markdown': 'markdown',
            'application/json': 'json',
            'application/xml': 'xml',
            'application/x-perl': 'perl',
            'application/yaml': 'yaml',
            'application/pdf': 'pdf',
            'audio/mpeg': 'mp3',
            'audio/mp3': 'mp3',
            'audio/wav': 'wav'
        }

        if(type === 'text/x-c') {
            // get file extension
            ext = name.split('.').at(-1).toLowerCase()
            if(ext == 'c') return 'c'
            if(ext == 'h') return 'h'
            if(ext == 'cpp' || ext == 'cxx' || ext == 'cc') return 'cpp'
            if(ext == 'hpp' || ext == 'hxx' || ext == 'hh') return 'hpp'
        }
        return TYPE2SUBTYPE[type]? TYPE2SUBTYPE[type] : 'text'
    }

</script>

<div class="fixed bottom-0 left-0 right-0 z-15 
            text-stone-900 bg-stone-200 
            dark:text-stone-200 dark:bg-[#212121]">
    <div class="w-full">
    <div class="max-w-3xl px-2.5 mx-auto inset-x-0">
        <div class=" pb-2">
            <!-- Input -->
            <input type="file" 
                multiple 
                bind:this={filesInputElement} 
                bind:files={inputFiles} 
                accept=".gif, .jpg, .jpeg, .png, .webp, .pdf, .py, .f, .f77, .f90, .for, .c, .cc, .cpp, .cxx, .dic, .h, .hh, .asm, .s, .java, .inc, .p, .pas, .pp, .css, .csv, .htm, .html, .js, .conf, .def, .diff, .in, .ksh, .list, .log, .pl, .text, .txt, .markdn, .markdown, .md, .mdown, .json, .xml, .pl, .yaml, .yml, .mp3, .wav" 
                style="display:none"
                on:change={handleChange}>
            <!-- Form -->
            <form class="flex flex-col relative w-full rounded-xl px-1.5 
                         text-stone-900 bg-stone-300 
                         dark:bg-[#2f2f2f] dark:text-stone-200"
                    on:submit|preventDefault={() => {
                        handleSubmit(prompt, files);
                        prompt = ''
                        files = []
                    }}>
                <fieldset disabled={disabled}>
                    <!-- File attachment -->
                    {#if files.length > 0}
                    <div class="mx-1 mt-2.5 mb-1 flex flex-wrap gap-2">
                        {#each files as file, fileIdx}
                            <div class=" relative group">
                                {#if file.type === 'image'}
                                    <img src={file.src} alt="file {fileIdx}" class=" h-16 w-16 rounded-xl object-cover" />
                                {:else}
                                    <div class="text-stone-900 bg-stone-200 
                                                dark:text-stone-200 dark:bg-stone-900  
                                                p-3 rounded-xl">
                                        <img src='icons/{file.subtype}.svg' class="w-5 h-5" alt="file {fileIdx}">
                                        <div class="flex flex-col justify-center -space-y-0.5">
                                            <div class="text-sm font-medium line-clamp-1">
                                                {file.name}
                                            </div>
                                        </div>
                                    </div>
                                {/if}
                                <div class=" absolute -top-1 -right-1">
                                    <button
                                        class="bg-stone-300 text-stone-900 
                                               dark:bg-stone-800 dark:text-stone-300 
                                               border border-white 
                                               rounded-full group-hover:visible invisible transition"
                                        type="button"
                                        on:click={() => {
                                            files.splice(fileIdx, 1);
                                            files = files;
                                        }}>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            class="w-4 h-4">
                                            <path
                                                d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        {/each}
                    </div>
                    {/if}
                    <!-- Text area and Buttons -->
                    <div class="flex">
                        <div class=" self-end mb-2 ml-1">
                            <div aria-label="Upload files">
                                <button 
                                    id="upload-files"
                                    class="text-stone-900 bg-stone-300 hover:bg-stone-400 
                                           dark:text-stone-300 dark:bg-[#2f2f2f] dark:hover:bg-[#212121] 
                                           transition rounded-xl p-1.5 self-center"
                                    type="button"
                                    title="Upload files" use:tooltip={{ 
                                        theme: "chat-tooltip",
                                        placement: 'top',
                                        arrow: false
                                    }}
                                    on:click={() => {filesInputElement.click()}}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" class="w-5 h-5">
                                        <path d="M720-330q0 104-73 177T470-80q-104 0-177-73t-73-177v-370q0-75 52.5-127.5T400-880q75 0 127.5 52.5T580-700v350q0 46-32 78t-78 32q-46 0-78-32t-32-78v-370h80v370q0 13 8.5 21.5T470-320q13 0 21.5-8.5T500-350v-350q-1-42-29.5-71T400-800q-42 0-71 29t-29 71v370q-1 71 49 120.5T470-160q70 0 119-49.5T640-330v-390h80v390Z"/>
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <!-- Textarea -->
                        <textarea
                            id="chat-textarea"
                            bind:this={chatTextAreaElement}
                            class="bg-stone-300 text-stone-900
                                   dark:bg-[#2f2f2f] dark:text-stone-200 
                                   placeholder-stone-400 dark:placeholder-stone-700
                                   scrollbar outline-none w-full py-3 px-3 pl-4 rounded-xl resize-none h-12 "
                            placeholder='Say something...'
                            rows="1"
                            bind:value={prompt}
                            on:keypress={(e) => {
                                
                                if (e.key == 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                }
                                if (prompt !== '' && e.key == 'Enter' && !e.shiftKey) {
                                    handleSubmit(prompt, files);
                                    prompt = ''
                                    files = []
                                    tick().then(() => {
                                        e.target.style.height = '';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                                    })
                                }
                            }}
                            on:input={(e) => {
                                e.target.style.height = '';
                                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                            }}
                            on:focus={(e) => {
                                e.target.style.height = '';
                                e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px';
                            }}
                            on:paste={(e) => {
                                const clipboardData = e.clipboardData || window.clipboardData;
                            }}/>
                        <!-- Send button -->
                        <div class="self-end mb-2 flex space-x-1 mr-1">
                            <div aria-label="Send message">
                                <button id="send-message-button" 
                                        type="submit"
                                        class="{(prompt !== '' || files.length > 0)
                                                    ? 'text-stone-300 bg-stone-900 hover:bg-stone-600 dark:text-[#2f2f2f] dark:bg-stone-300 dark:hover:bg-stone-500'
                                                    : 'text-stone-300 bg-stone-400 dark:text-[#2f2f2f] dark:bg-stone-600 disabled'} transition rounded-xl p-1.5 self-center"
                                        disabled={prompt === '' && files.length == 0}>
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                                        </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </fieldset>
            </form>
        </div>
        <div class="mt-1.5 text-xs text-gray-500 text-center">
            LLMs can make mistakes. Please double-check responses.
        </div>
    </div>
    </div>
</div>
