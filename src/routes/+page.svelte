<script>
    // store
    import {chatMessages} from '$lib/store'
    // svelte components
    import ChatEditor from '../lib/components/ChatEditor.svelte';
	import ChatInput from '../lib/components/ChatInput.svelte';
    import ChatView from '../lib/components/ChatView.svelte';
    // utils
    import { Pane, Splitpanes } from 'svelte-splitpanes';
    import { onMount, tick } from 'svelte';
    import { browser } from '$app/environment'
    // graph
    import {graph} from '$lib/graph.js'
    import defaultNode from '$lib/data/default.json'
    
    let messagesContainerElement;

    const handleSubmit = async (userPrompt, userFiles) => {
        // console.log(userPrompt, userFiles)
        graph.sendEventToAllNodes("chat", {
            prompt: userPrompt,
            files: userFiles
        } );
    }

    onMount(() => {
        const savedNode = sessionStorage.getItem("saved-node")
        if( savedNode ) {
            graph.configure( JSON.parse( savedNode ) )
        }
        else {
            graph.configure(defaultNode)
        }
        graph.start()
    })

    if( browser ) {
        window.onbeforeunload = function(){
            sessionStorage.setItem( "saved-node", JSON.stringify( graph.serialize() ) )
        }
    }

    $: if($chatMessages) {
        if(messagesContainerElement) {
            // scrollToBottom(messagesContainerElement)
            tick().then(() => messagesContainerElement.scroll(
                { top: messagesContainerElement.scrollHeight, behavior: 'smooth' }
            ))
        }
    }
    
</script>

<!-- Main Container -->
<div class="min-h-screen max-h-screen w-full max-w-full flex flex-col">
    <!-- TODO: Nav -->
    <Splitpanes horizontal >
        <Pane size={50} maxSize={72}>
            <!-- LiteGraph -->
             <ChatEditor/>
        </Pane>
        <Pane size={50}>
            <div class="h-full flex flex-col flex-auto pb-20
                        text-stone-900 bg-stone-200 
                        dark:text-stone-200 dark:bg-[#212121]">
                <div id="messages-container"
                    bind:this={messagesContainerElement}
                    class="flex flex-col justify-between w-full flex-auto overflow-auto scrollbar h-0 max-w-full">
                    <!-- Chat View-->
                    <ChatView />         
                </div>
                <!-- ChatInput -->
                <ChatInput {handleSubmit}/>
            </div>
        </Pane>
    </Splitpanes>
</div>

