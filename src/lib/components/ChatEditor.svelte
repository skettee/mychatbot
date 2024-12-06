<script>
    import {LGraphCanvas} from "@comfyorg/litegraph"
    import '@comfyorg/litegraph/style.css'
    import {graph} from '$lib/graph.js'

    // Canvas
    function editGraph(node) {
        node.width = window.screen.width * window.devicePixelRatio
        node.height = Math.ceil(window.screen.height * window.devicePixelRatio * 0.7)
        var canvas = new LGraphCanvas(node, graph);
        canvas.allow_searchbox = false;
    }
</script>

<main class="editor-area">
    <canvas class='graphcanvas' style='border: 1px solid' use:editGraph></canvas>
</main>

