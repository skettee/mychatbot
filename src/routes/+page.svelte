<script>
    // store
    import {chatMessages, userInfo} from '$lib/store'
    // svelte components
    import Sidebar from '../lib/components/Sidebar.svelte';
    import ChatEditor from '../lib/components/ChatEditor.svelte';
	import ChatInput from '../lib/components/ChatInput.svelte';
    import ChatView from '../lib/components/ChatView.svelte';
    // utils
    import { Pane, Splitpanes } from 'svelte-splitpanes';
    import { onMount, tick } from 'svelte';
    import { browser } from '$app/environment'
    // graph
    import {graph} from '$lib/graph.js'
    // default workflow
    import defaultNode from '$lib/data/default.json'
    
    let messagesContainerElement;
    let scrollBehavior = 'auto'

    const handleSubmit = async (userPrompt, userFiles) => {
        scrollBehavior = 'smooth'
        graph.sendEventToAllNodes("chat", {
            prompt: userPrompt,
            files: userFiles
        } )
    }

    // Session
    /** @type {import('./$types').Snapshot<string>} */
    export const snapshot = {
		capture: () => {
            return {
                chatMessages: $chatMessages
            }
        },
		restore: (data) => {
            $chatMessages = data.chatMessages
        }
	}

    $: if($chatMessages) {
        if(messagesContainerElement) {
            tick().then(() => messagesContainerElement.scroll(
                { top: messagesContainerElement.scrollHeight, behavior: scrollBehavior }
            ))
        }
    }

    // Supabase
    export let data
    let { supabase, workflows, member } = data
    $: user = data.user

    onMount(async () => {
        // console.log('onMount')

        //get userInfo
        if(user && member[0]) {
            // get userInfo
            userInfo.update((user)=>{
                user.id = member[0].id
                user.user_id = member[0].user_id
                user.name = member[0].name
                user.profile = member[0].profile
                return user
            })
            // console.log($userInfo)
        }

        // graph configure: sessionStorage > supabase > default
        const savedNode = sessionStorage.getItem("saved-node")
        if( savedNode ) {
            // console.log('from sessionStorage')
            graph.configure( JSON.parse( savedNode ) )
        }
        else if(user && member[0] && member[0].workflow) {
            // console.log('from supabase')
            graph.configure( member[0].workflow )
        }
        else {
            graph.configure(defaultNode)
        }
        
        // graph start
        graph.start()
    })

    if( browser ) {
        window.onbeforeunload = function() {
            sessionStorage.setItem( "saved-node", JSON.stringify( graph.serialize() ) )
        }
    }

</script>

<!-- Main Container -->
<div class="min-h-screen max-h-screen w-full max-w-full flex flex-col">
    <!-- Sidebar -->
    <Sidebar {...{user, supabase, workflows}}/>
    <Splitpanes horizontal >
        <Pane size={50} maxSize={70}>
            <!-- LiteGraph -->
            <ChatEditor />
        </Pane>
        <Pane>
            <div class="h-full flex flex-col flex-auto pb-24
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

