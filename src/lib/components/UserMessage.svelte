<script>
    import dayjs from 'dayjs'
    export let message

    const timestamp = dayjs(message.timestamp).format('MM/DD/YYYY HH:mm')

    const colorVariants = {
        '#533': 'bg-[#533]',        // red
        '#593930': 'bg-[#593930]',  // brown
        '#353': 'bg-[#353]',        // green
        '#335': 'bg-[#335]',        // blue
        '#3f5159': 'bg-[#3f5159]',  // pale_blue
        '#355': 'bg-[#355]',        // cyan
        '#535': 'bg-[#535]',        // purple
        '#653': 'bg-[#653]',        // yellow
        '#000': 'bg-[#222]'         // black
    }

    const bgColor = String.raw`bg-[` + message.color + String.raw`]`

</script>

<div class="flex w-full">
    <div class="mr-4">
        <div class='relative w-7 h-7 flex justify-center items-center rounded-full {colorVariants[message.color]}'>
            <span class='text-gray-100 text-sm font-bold'>{message.name.trim()[0].toUpperCase()}</span>
        </div>
    </div>
    <div class="w-full overflow-hidden">
        <div class="user-message">
            <div class="self-center font-bold mb-0.5 capitalize line-clamp-1">
                {message.name}
                <span class="invisible group-hover:visible text-gray-400 text-xs font-medium">{timestamp}</span>
            </div>
        </div>
        <div class="prose chat-user w-full max-w-full font-serif dark:prose-invert prose-headings:my-0 prose-p:my-0 prose-pre:my-0 prose-table:my-0 prose-blockquote:my-0 prose-img:my-0 whitespace-pre-line">
            <div class="w-full">
                <p id="user-message">
                    {message.content}
                </p>
            </div>
        </div>
    </div>
</div>
