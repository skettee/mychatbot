<svelte:head>
	<title>myChatbot</title>
</svelte:head>

<script>
    import "../tailwind.css";
    import { invalidate } from '$app/navigation'
    import { onMount } from 'svelte'
    
    export let data
    // export let children
    let { session, supabase } = data

    onMount(() => {
        const { data } = supabase.auth.onAuthStateChange((_, newSession) => {
            if (newSession?.expires_at !== session?.expires_at) {
                invalidate('supabase:auth')
            }
        })

        return () => data.subscription.unsubscribe()
  })
</script>

<div class="app relative">
    <div class="text-stone-900 bg-stone-200 
                dark:text-stone-200 dark:bg-[#212121] 
                min-h-screen overflow-hidden flex flex-row">
        <slot/>
    </div>
</div>

<style>
    :global(.tippy-box[data-theme~='chat-tooltip']) {
      @apply text-xs text-stone-900 bg-stone-300 dark:text-stone-300 dark:bg-[#2f2f2f];
    }
</style>