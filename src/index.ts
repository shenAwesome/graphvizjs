import { GraphvizSync, graphvizSync } from "./graphviz.es6"
// @ts-ignore
import wasm from "./graphvizlib.wasm"

const prom = graphvizSync(wasm)

/*
let viz = {
    layout: (dot: string, type: string, engine: string) => { }
}

function init() {
    return prom.then((_viz: any) => {
        viz = _viz
        console.log('viz: ', viz)
        return viz
    })
}
*/

type vizType = 'SVG' | 'Plain Text' | 'DOT' | 'JSON' | 'PNG'
type visEngine = 'dot' | 'neato' | 'fdp' | 'sfdp' | 'circo' | 'twopi' | 'osage' | 'patchwork'

let _vis = null as any
async function layout(dot: string, type: vizType, engine: visEngine) {
    if (!_vis) _vis = await prom.then()
    return _vis.layout(dot, type, engine)
}

export { layout }