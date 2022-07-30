import { graphvizSync } from "./graphviz.es6"
// @ts-ignore
import wasm from "./graphvizlib.wasm"

const prom = graphvizSync(wasm)

type Format = 'svg' | 'plain' | 'dot' | 'json'
type VizEngine = 'dot' | 'neato' | 'fdp' | 'sfdp' | 'circo' | 'twopi' | 'osage' | 'patchwork'
type Rankdir = "LR" | "TB" | "RL" | "BT"

class Viz {
    private static instance = null as Viz

    /**
     * 
     * @returns A Viz instance
     */
    static async create() {
        if (!Viz.instance) {
            const g = await prom.then()
            Viz.instance = new Viz(g)
        }
        return Viz.instance
    }

    /**
     * Layout nodes asynchronously 
     * @param dot nodes in DOT language
     * @param format 
     * @param engine 
     * @returns 
     */
    static async layoutAsync(dot: string, format: Format = 'svg', engine: VizEngine = 'dot') {
        const viz = await Viz.create()
        return viz.layout(dot, format, engine)
    }

    private constructor(private graphviz: any) { }

    public createLayoutManager() {
        return new LayoutManager(this)
    }

    /** Layout nodes */
    public layout(dot: string, format: Format = 'svg', engine: VizEngine = 'dot') {
        return this.graphviz.layout(dot, format, engine) as string
    }
}

class Node {
    constructor(public id: string, public width: number, public height: number) { }
    callback: (x: number, y: number) => void
    toString() {
        const { id, width, height } = this
        return `${id} [width="${width}",height="${height}"]; `
    }
}

class Edge {
    constructor(public from: string, public to: string) { }
    toString() {
        const { from, to } = this
        return `${from} -> ${to}; `
    }
}

class Group {
    constructor(public id: string, public children: string[]) { }
    toString() {
        const { id, children } = this
        return `subgraph cluster_${id} { ${children.join(';')} };`
    }
}

class LayoutManager {

    private nodes = [] as Node[]
    private edges = [] as Edge[]
    private groups = [] as Group[]
    private idMap = {} as { [string: string]: string }

    constructor(private viz: Viz) {
    }

    /**
     * Add an node and return id. id is for referring this node when using addEge or addGroup.
     * @param width 
     * @param height 
     * @param id if an id is not given in option, one will be created 
     * @param callback called on LayoutManager.calculate()
     * @returns 
     */
    addNode(width: number, height: number, id: string, callback?: (x: number, y: number) => void) {
        const autoId = (this.nodes.length + 1).toString()
        id = id || autoId
        this.idMap[id] = autoId
        const node = new Node(autoId, this.toInch(width), this.toInch(height))
        node.callback = callback
        this.nodes.push(node)
        return node.id
    }

    addEdge(from: string, to: string) {
        from = this.idMap[from]
        to = this.idMap[to]
        this.edges.push(new Edge(from, to))
    }

    addGroup(ids: string[]) {
        this.groups.push(new Group(this.groups.length + '', ids.map(id => this.idMap[id])))
    }

    calculate(rankdir: Rankdir = "TB", engine?: VizEngine) {
        if (!engine) {
            engine = this.edges.length > 0 ? 'dot' : 'neato'
        }

        const dot = `
        digraph D { 
            node [shape=record]
            rankdir = "${rankdir}"
            ${this.nodes.map(n => n.toString()).join(' ')}
            ${this.edges.map(n => n.toString()).join(' ')}
            ${this.groups.map(n => n.toString()).join(' ')}
        } `
        const out = this.viz.layout(dot, 'plain', engine),
            svg = this.viz.layout(dot, 'svg', engine),
            lines = out.split('\n'),
            { toPx } = this,
            paperInfo = lines[0].split(' '),
            height = toPx(paperInfo.pop()),
            width = toPx(paperInfo.pop()),
            nodes = [] as any[],
            idmap = {} as { [key: string]: string }
        Object.keys(this.idMap).forEach(k => idmap[this.idMap[k]] = k)

        for (const line of lines.slice(1, -2)) {
            const [type] = line.split(' ')
            if (type == 'node') {
                const [_, idx, x, y, w, h] = line.split(' ')
                const node = {
                    id: idmap[idx], index: parseInt(idx),
                    x: toPx(x), y: height - toPx(y),
                    width: toPx(w), height: toPx(h),
                }
                node.x = Math.max(0, Math.round(node.x - node.width / 2))
                node.y = Math.max(0, Math.round(node.y - node.height / 2))
                nodes.push(node)
                const _node = this.nodes.find(n => n.id == idx)
                if (_node && _node.callback) _node.callback(node.x, node.y)
            }
        }
        nodes.sort((a, b) => a.index - b.index)
        return { width, height, nodes, svg }
    }

    toInch(px: number) {
        return px / 96
    }

    toPx(inch: number | string) {
        return Math.round(parseFloat(inch + '') * 96)
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
    return Viz.create()
}

export { initViz, Viz }
