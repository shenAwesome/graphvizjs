# graphvizjs
use graphviz in browser

## Install
yarn add @aslab/graphvizjs

## Use in ES modules
    import { Viz } from '@aslab/graphvizjs'
    ...
    const viz = await Viz.create()
    const svg = viz.layout('digraph D {  A -> B }')
    console.log(svg)

## Use in plain Javascript
    <script src='./graphviz.js'></script>
    ...
    const viz = await graphviz.Viz.create()
    
## Use LayoutManager
    onst lm = viz.createLayoutManager()
    lm.addNode(100, 100, 'test1', (x, y) => {
        console.log(x, y)
    })
    lm.addNode(140, 150, 'test2', (x, y) => {
        console.log(x, y)
    })
    lm.addEdge('test1', 'test2') 
    const layout = lm.calculate()
    console.log(layout)