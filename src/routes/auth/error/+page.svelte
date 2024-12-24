<script>
    import { goto } from '$app/navigation';
</script>
<div class="w-full h-screen flex justify-center items-center">
    <div class="flex flex-col m-5 p-5 rounded-xl shadow-xl text-stone-900 bg-stone-100 
            dark:bg-stone-900 dark:text-stone-200">
        <div class="text-xl font-bold p-1.5 my-1">⚠️ Login error</div>
        <button class="p-1.5 my-1
                text-stone-300 bg-stone-900 hover:bg-stone-600 
                dark:text-stone-900 dark:bg-stone-600 dark:hover:bg-stone-500
                transition rounded-xl"
                on:click={() => {goto('/auth')}}>
                Login
        </button>
        <button class="p-1.5 my-1
                text-stone-300 bg-stone-900 hover:bg-stone-600 
                dark:text-stone-900 dark:bg-stone-600 dark:hover:bg-stone-500
                transition rounded-xl"
                on:click={() => {goto('/')}}>
                Home
        </button>
    </div>
</div>