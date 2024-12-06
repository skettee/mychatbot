<script>
    // graph
    import {graph} from '$lib/graph.js'

    import tooltip from "$lib/tooltip.js"
    import { v4 as uuidv4 } from 'uuid'
    // store
    import {workflows} from '$lib/store'

    let showMenu = false

    let name_workflow = ''
    let desc_workflow = ''
    const handleAddWorkflow = () => {
        // get workflow
        graph.stop()
        const workflow =  graph.serialize()
        workflow.nodes.forEach(node => {
            if (node.properties && node.properties.memory) {
                node.properties.memory = [];
            }
        })
        // serialize workflow
        workflows.update((flows) => {
            return [{
                id: uuidv4(),
                name: name_workflow,
                desc: desc_workflow,
                workflow: workflow,
                timestamp: Date.now()
            }, ...flows]
        })
        // localStorage
        localStorage.mychatbot = JSON.stringify($workflows)
        name_workflow = ''
        desc_workflow = ''

        graph.start()
    }

    const handleLoadWorkflow = (workflow) => {
        graph.stop()
        graph.configure(workflow)
        graph.start()
    }

    const handleRemoveWorkflow = (id) => {
        workflows.update((flows) => flows.filter((item) => item.id != id))
        // console.log(id, $workflows)
        localStorage.mychatbot = JSON.stringify($workflows)
    }

</script>

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
<div class="fixed top-0 left-0 z-20 w-64 h-full transition-all duration-500 transform shadow-lg 
            text-stone-900 bg-stone-100 
            dark:bg-stone-900 dark:text-stone-200
            {showMenu ? 'translate-x-0': '-translate-x-full'}">
    <div class="px-3 pt-14 pb-3 m-1 flex flex-col h-full">
        <!-- Save -->
        <h2 class="text-lg font-semibold my-2">Save workflow</h2>
        <form class="flex flex-col" on:submit|preventDefault={handleAddWorkflow}>
            <p class="text-xs text-gray-500">Name:</p>
            <input id="name_workflow" type="text" placeholder="Current workflow name" maxlength="10" required
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
                Add
            </button>
        </form>
        <!-- Recent -->
        <h2 class="text-lg font-semibold my-2">Recents</h2>
        <div class="flex-1 flex flex-col space-y-1 overflow-y-auto scrollbar scrollbar-none">
            <ul>
                {#each $workflows as workflow (workflow.id)}
                <li>
                    <div class="flex justify-between text-xs p-3 rounded-xl w-full my-1
                                 bg-stone-300 text-stone-900
                                dark:bg-[#2f2f2f] dark:text-stone-200">
                        <button class="p-1.5 rounded-xl hover:bg-stone-400 dark:hover:bg-[#212121]"
                                type="button"
                                on:click|preventDefault|stopPropagation={() => {handleLoadWorkflow(workflow.workflow)}}
                                title="Load {workflow.name} workflow" use:tooltip={{ 
                                    theme: "chat-tooltip",
                                    placement: 'right',
                                    arrow: false
                                }}>
                            {workflow.name}
                        </button>
                        <button class="text-stone-900 bg-stone-300 hover:bg-stone-400 
                                    dark:text-stone-300 dark:bg-[#2f2f2f] dark:hover:bg-[#212121]
                                    transition rounded-xl p-1.5"
                                    type="button"
                                    on:click|preventDefault|stopPropagation={() => {handleRemoveWorkflow(workflow.id)}}
                                    title="Delete workflow" use:tooltip={{ 
                                        theme: "chat-tooltip",
                                        placement: 'right',
                                        arrow: false
                                    }}>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" class="w-4 h-4">
                                <path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/>
                            </svg>
                        </button>
                    </div>                        
                </li>
                {/each}
            </ul>
        </div>
        <!-- Hub -->
        <div class="justify-self-end flex flex-col ">
            <button class=" flex p-3 rounded-xl w-full text-gray-500 bg-stone-300 dark:bg-[#2f2f2f] transition disabled"
                        title="Comming Soon" use:tooltip={{ 
                        theme: "chat-tooltip",
                        placement: 'top',
                        arrow: false
                    }}>              
                <div class="p-1.5 text-sm font-semibold my-2">myChatbot Hub</div>
            </button>
        </div>
    </div>
</div>