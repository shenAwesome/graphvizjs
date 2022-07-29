import { GraphvizSync, graphvizSync } from "./graphviz.es6"
// @ts-ignore
import wasm from "./graphvizlib.wasm"

const prom = graphvizSync(wasm)

type Format = 'svg' | 'plain' | 'dot' | 'json'
type visEngine = 'dot' | 'neato' | 'fdp' | 'sfdp' | 'circo' | 'twopi' | 'osage' | 'patchwork'

let visInstance = null as Viz

class Viz {
    constructor(private graphviz: any) {
    }
    /** Layout nodes */
    layout(dot: string, format: Format = 'svg', engine: visEngine = 'dot') {
        return this.graphviz.layout(dot, format, engine) as string
    }

    createLayoutManager() {
        return new LayoutManager(this)
    }
}

class Node {
    constructor(public readonly id: string, public width: number, public height: number) {

    }
    toString() {
        const { id, width, height } = this
        return `${id} [width="${width}",height="${height}"]; `
    }
}
class Edge {
    constructor(public readonly from: string, public readonly to: string) {

    }
    toString() {
        const { from, to } = this
        return `${from} -> ${to}; `
    }
}

class Group {
    constructor(public readonly id: string, public readonly children: string[]) {

    }
    toString() {
        const { id, children } = this
        return `subgraph cluster_${id} { ${children.join(';')} };`
    }
}

type Rankdir = "LR" | "TB" | "RL" | "BT"

class LayoutManager {

    private nodes = [] as Node[]
    private edges = [] as Edge[]
    private groups = [] as Group[]

    private idMap = {} as { [string: string]: string }

    constructor(private viz: Viz) {
    }

    addNode(id: string, width: number, height: number) {
        const autoId = (this.nodes.length + 1).toString()
        this.idMap[id] = autoId
        this.nodes.push(new Node(autoId, this.toInch(width), this.toInch(height)))
    }
    addEdge(from: string, to: string) {
        from = this.idMap[from]
        to = this.idMap[to]
        this.edges.push(new Edge(from, to))
    }
    addGroup(ids: string[]) {
        this.groups.push(new Group(this.groups.length + '', ids.map(id => this.idMap[id])))
    }

    calculate(rankdir: Rankdir = "TB") {
        const dot = `
        digraph D { 
            node [shape=record]
            rankdir = "${rankdir}"
            ${this.nodes.map(n => n.toString()).join(' ')}
            ${this.edges.map(n => n.toString()).join(' ')}
            ${this.groups.map(n => n.toString()).join(' ')}
        } `
        const out = this.viz.layout(dot, 'plain')
        const lines = out.split('\n')
        const { toPx } = this
        const paperInfo = lines[0].split(' ')
        const height = toPx(paperInfo.pop()),
            width = toPx(paperInfo.pop()),
            nodes = [] as any[]

        const idmap2 = {} as { [key: string]: string }
        Object.keys(this.idMap).forEach(k => idmap2[this.idMap[k]] = k)

        for (const line of lines.slice(1, -2)) {
            const [type] = line.split(' ')
            if (type == 'node') {
                const [type, id, x, y, w, h] = line.split(' ')
                const node = {
                    id: idmap2[id],
                    index: parseInt(id),
                    x: toPx(x),
                    y: height - toPx(y),
                    width: toPx(w),
                    height: toPx(h),
                }
                node.x = Math.round(node.x - node.width / 2)
                node.y = Math.round(node.y - node.height / 2)
                nodes.push(node)
            }
        }
        nodes.sort((a, b) => a.index - b.index)
        return { width, height, nodes }
    }

    toInch(px: number) {
        return px / 96
    }

    toPx(inch: number | string) {
        return Math.round(parseFloat(inch + '') * 96)
    }

    toSVG(rankdir: Rankdir = "TB") {
        const dot = `
        digraph D { 
            node [shape=record]
            rankdir = "${rankdir}"
            ${this.nodes.map(n => n.toString()).join(' ')}
            ${this.edges.map(n => n.toString()).join(' ')}
            ${this.groups.map(n => n.toString()).join(' ')}
        } `
        return this.viz.layout(dot, 'svg')
    }
}

/**
 * Create a viz object
 * ```javascript
 * viz = initViz()
 * vis.layout('digraph D {a->b}')
 * ```
 * @returns viz instance  
 */
async function initViz() {
    if (!visInstance) {
        const g = await prom.then()
        visInstance = new Viz(g)
    }
    return visInstance
}

/**
 * Layout nodes asynchronously 
 * @param dot nodes in DOT language
 * @param format 
 * @param engine 
 * @returns 
 */
async function layout(dot: string, format: Format = 'svg', engine: visEngine = 'dot') {
    await initViz()
    return visInstance.layout(dot, format, engine)
}

export { layout, initViz }