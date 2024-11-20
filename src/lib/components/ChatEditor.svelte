<script>
    import {LGraphCanvas} from "@comfyorg/litegraph"
    import '@comfyorg/litegraph/css/litegraph.css'
    import {graph} from '$lib/graph.js'

    // Canvas
    function editGraph(node) {
        node.width = window.screen.width
        node.height = Math.ceil(window.screen.height * 0.7)
        var canvas = new LGraphCanvas(node, graph);
        canvas.allow_searchbox = false;
    }

    // const width = window.screen.width
</script>

<main class="editor-area">
    <canvas class='graphcanvas' style='border: 1px solid' use:editGraph></canvas>
</main>

