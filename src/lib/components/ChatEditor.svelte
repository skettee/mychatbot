<script>
    import {LGraphCanvas} from "@comfyorg/litegraph"
    import '@comfyorg/litegraph/css/litegraph.css'
    import {graph} from '$lib/graph.js'

    // Canvas
    function editGraph(node) {
        var canvas = new LGraphCanvas(node, graph);
        canvas.allow_searchbox = false;
    }
</script>

<main class="editor-area">
    <canvas class='graphcanvas' width='1920' height='640' style='border: 1px solid' use:editGraph></canvas>
</main>

