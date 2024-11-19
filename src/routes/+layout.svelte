<svelte:head>
	<title>myChatbot</title>
</svelte:head>

<script>
    import "../tailwind.css";
</script>

<div class="app relative">
    <div class="text-stone-900 bg-stone-200 
                dark:text-stone-200 dark:bg-[#212121] 
                min-h-screen overflow-hidden flex flex-row">
        <slot/>
    </div>
</div>