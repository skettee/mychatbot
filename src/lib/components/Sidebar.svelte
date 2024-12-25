<script>
    import { goto } from '$app/navigation';
    import {graph} from '$lib/graph.js'
    import tooltip from "$lib/tooltip.js"
    // store
    import {userInfo} from '$lib/store'

    let showMenu = false

    let name_workflow = ''
    let desc_workflow = ''
    
    export let user
    export let supabase
    export let workflows

    const myWorkflows = workflows.filter((item)=> item.user_id == user.id)
    const otherWorkflows = workflows.filter((item)=> item.user_id != user.id)

    const save = async () => {
        // update current workspace
        const { error } = await supabase
            .from('members')
            .update( { workflow: graph.serialize() } )
            .eq('user_id', user.id)
        if(error) {
            console.log(error)
        }
    }

    const logout = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            console.error(error)
        }
    }

    const handleLoadWorkflow = async (id) => {
        graph.stop()
        // Read workflow
        let { data: workflows, error } = await supabase
            .from('workflows')
            .select("*")
            .eq('id', id)
        if(error) {
            console.log(error)
        }
        else {
            graph.configure(workflows[0].workflow)
            graph.start()
        }
    }

    const handleShareWorkflow = () => {
        // TBD
    }

    const handleUserInfo = async () => {
        // console.log('update user info')
        
        const { data, error } = await supabase
            .from('members')
            .update({ name: $userInfo.name?  $userInfo.name: 'User'})
            .eq('user_id', $userInfo.user_id)
            .select()
        if(error) {
            console.log(error)
        }
        if(data) {
            userInfo.update((user)=>{
                user.name = data[0].name
                return user
            })
        }
    }

</script>

{#if user}
<div class="fixed top-3 left-1 z-50">
    <button class="p-1.5 mr-1 rounded-lg 
                 text-cyan-600 hover:bg-stone-700"
            title="Sidebar" use:tooltip={{ 
                theme: "chat-tooltip",
                placement: 'right',
                arrow: false
            }}
            on:click={() => { showMenu = !showMenu }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" class="w-5 h-5">
            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm280-80h280v-560H480v560Z"/>
        </svg>
    </button>
</div>
{/if}
<div class="fixed top-0 left-0 z-20 w-64 h-full transition-all duration-500 transform shadow-lg 
            text-stone-900 bg-stone-100 
            dark:bg-stone-900 dark:text-stone-200
            {(showMenu && user)? 'translate-x-0': '-translate-x-full'}">
    <div class="px-3 pt-14 pb-3 m-1 flex flex-col h-full">
        <!-- My Chatbots -->
        <div class="text-base font-semibold my-2">My Chatbots</div>
        <div class="flex-1 flex flex-col space-y-1 overflow-y-auto scrollbar scrollbar-none">
            <ul>
                {#each myWorkflows as workflow (workflow.id)}
                <li class="p-1 rounded-xl w-full my-1
                    bg-stone-300 text-stone-900
                    dark:bg-[#2f2f2f] dark:text-stone-200">
                    <button class="p-1.5 w-full rounded-xl hover:bg-stone-400 dark:hover:bg-[#212121]"
                                type="button"
                                on:click|preventDefault|stopPropagation={() => {handleLoadWorkflow(workflow.id)}}
                                title="Load {workflow.name} workflow" use:tooltip={{ 
                                    theme: "chat-tooltip",
                                    placement: 'right',
                                    arrow: false
                                }}>
                            <div class="text-left text-sm font-semibold">{workflow.name}</div>
                            <div class="text-left text-xs">{workflow.desc}</div>
                    </button>
                </li>
                {/each}
            </ul>
        </div>
        <!-- Other Chatbots -->
        <div class="text-base font-semibold my-2">Other Chatbots</div>
        <div class="flex-1 flex flex-col space-y-1 overflow-y-auto scrollbar scrollbar-none">
            <ul>
                {#each otherWorkflows as workflow (workflow.id)}
                <li class="p-1 rounded-xl w-full my-1
                    bg-stone-300 text-stone-900
                    dark:bg-[#2f2f2f] dark:text-stone-200">
                    <button class="p-1.5 w-full rounded-xl hover:bg-stone-400 dark:hover:bg-[#212121]"
                                type="button"
                                on:click|preventDefault|stopPropagation={() => {handleLoadWorkflow(workflow.id)}}
                                title="Load {workflow.name} workflow" use:tooltip={{ 
                                    theme: "chat-tooltip",
                                    placement: 'right',
                                    arrow: false
                                }}>
                            <div class="text-left text-sm font-semibold">{workflow.name}</div>
                            <div class="text-left text-xs">{workflow.desc}</div>
                    </button>
                </li>
                {/each}
            </ul>
        </div>
        <!-- Share myChatbot -->
        <div class="text-base font-semibold my-2">Share myChatbot</div>
        <form class="flex flex-col" on:submit|preventDefault={handleShareWorkflow}>
        <fieldset disabled>
            <p class="text-xs text-gray-500">Name:</p>
            <input id="name_workflow" type="text" placeholder="Workflow name" maxlength="10" required
                   class="text-xs w-full py-1 px-3 my-1
                        bg-stone-300 text-stone-900
                        dark:bg-[#2f2f2f] dark:text-stone-200
                        outline-none 
                        rounded-xl resize-none h-[30px] 
                        placeholder-stone-400 dark:placeholder-stone-500"
                        bind:value={name_workflow}>
            <p class="text-xs text-gray-500">Description:</p>
            <input id="desc_workflow" type="text" placeholder="Description" maxlength="50" required
                   class="text-xs w-full py-1 px-3 my-1
                         bg-stone-300 text-stone-900
                        dark:bg-[#2f2f2f] dark:text-stone-200
                        outline-none 
                        rounded-xl resize-none h-[30px]
                        placeholder-stone-400 dark:placeholder-stone-500"
                        bind:value={desc_workflow}>
            <button class="{ (name_workflow !== '' && desc_workflow !== '')
                    ? 'text-stone-300 bg-stone-900 hover:bg-stone-600 dark:text-[#2f2f2f] dark:bg-stone-300 dark:hover:bg-stone-500'
                    : 'text-stone-300 bg-stone-400 dark:text-[#2f2f2f] dark:bg-stone-600 disabled'} 
                    text-xs transition rounded-xl p-1.5 my-1 self-start">
                Push
            </button>
        </fieldset>
        </form>
        <!-- User Profile-->
        <div class="justify-self-end flex flex-col my-2">
            <div class=" flex rounded-xl py-3 w-full text-gray-500 bg-stone-300 dark:bg-[#2f2f2f] transition">
                <div class=" self-start mx-3">
                    <div class='relative w-8 h-8 bg-[#3f5159] flex justify-center items-center rounded-full'>
                        <span class='text-gray-100 text-sm font-bold'>{$userInfo.name? $userInfo.name.trim()[0].toUpperCase() : ''}</span>
                    </div>
                </div>
                <div contenteditable="true" class="self-center font-semibold  mr-3 w-4/6 block"
                        bind:textContent={$userInfo.name}
                        on:focusout={()=>{handleUserInfo()}}>{$userInfo.name}</div>
            </div>
        </div>
    </div>
</div>
{#if user}
<div class="fixed top-3 right-10 z-50">
    <button class="p-1.5 mr-1 rounded-lg 
                 text-cyan-600 hover:bg-stone-700"
            title="Saved!" use:tooltip={{ 
                theme: "chat-tooltip",
                placement: 'left',
                arrow: false,
                trigger: 'click',
            }}
            on:click={save}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" class="w-5 h-5">
            <path d="M840-680v480q0 33-23.5 56.5T760-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h480l160 160Zm-80 34L646-760H200v560h560v-446ZM480-240q50 0 85-35t35-85q0-50-35-85t-85-35q-50 0-85 35t-35 85q0 50 35 85t85 35ZM240-560h360v-160H240v160Zm-40-86v446-560 114Z"/>
        </svg>
    </button>
</div>
<div class="fixed top-3 right-1 z-50">
    <button class="p-1.5 mr-1 rounded-lg 
                 text-cyan-600 hover:bg-stone-700"
            title="Sign out" use:tooltip={{ 
                theme: "chat-tooltip",
                placement: 'left',
                arrow: false
            }}
            on:click={logout}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" class="w-5 h-5">
            <path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/>
        </svg>
    </button>
</div>
{:else}
<div class="fixed top-3 right-1 z-50">
    <button class="p-1.5 mr-1 rounded-lg 
                 text-cyan-600 hover:bg-stone-700"
            title="Sign in" use:tooltip={{ 
                theme: "chat-tooltip",
                placement: 'left',
                arrow: false
            }}
            on:click={() => { goto('/auth') }}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" class="w-5 h-5">
            <path d="M480-120v-80h280v-560H480v-80h280q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H480Zm-80-160-55-58 102-102H120v-80h327L345-622l55-58 200 200-200 200Z"/>
        </svg>
    </button>
</div>
{/if}