<script>
    import UserMessage from "./UserMessage.svelte";
    import AssistantMessage from "./AssistantMessage.svelte";
    import {chatMessages} from '$lib/store'

</script>

<div class="h-full flex">
    <div class="w-full pt-2">
        {#each $chatMessages as message (message.id)}
            <div class=" w-full">
                <div class="flex flex-col justify-between px-5 mb-3 max-w-5xl mx-auto rounded-lg group">
                    {#if message.role === 'user'}
                        <UserMessage {message}/>
                    {:else}
                        <AssistantMessage {message}/>
                    {/if}
                </div>
            </div>
        {/each}
    </div>
</div>