import Tree from '../tree/tree'
import nflow from 'nflow'

export default (parent)=>(
  nflow.create('timeline')
    .parent(parent)
    .call(Tree)
    .data({
      eventRoot:{
        name: 'event-root',
        guid: -1,
        parent: null,
        children: [],
        hidden:true
      },
      d3dom: null
    })
    .on('update', updateEventRoot
                , updateBG)
    .call(init)
    // .on('allow-dragging', allowDragging)
    // .on('show-events', showEvents)
    // .on('show-route', showRoute)
    // .on('type', setType)

)

function init(f){
  var d = f.data()
  f.emit.downstream('dragging', 'horizontal')
  f.create('lines')
    .on('dom'   , dom=>{d.d3dom = d3.select(dom)}
                , dom
      )

}

function dom(d){
  
  let d3dom = d3.select(d)
    
  let drag = d3dom.select('.tree')
    .insert('g',":first-child")
    .classed('timeline-bg', true)


}

function updateEventRoot(d){
  //console.log('timeline update')
  d.eventRoot = this.target.data().eventRoot
  d.eventRoot.source = d.root.source
  d.eventRoot.guid = d.root.guid
  d.eventRoot.children = []
  findEvents(d.root)
  
  function findEvents(node){
    node.children.forEach(e=>{
      if (e.isEvent) {
        //let n = clone(e, node)
        let n = e
        n && d.eventRoot.children.push(n)
      }
      else findEvents(e)
    })
  }

  function clone(e,p){
    let lastEvent = d.eventRoot.children.length 
      && d.eventRoot.children[d.eventRoot.children.length-1]
    
    // if (lastEvent.source == p.source) {
    //   lastEvent.children.push(e)
    //   return null
    // }
    return {
        name: p.name,
        guid: p.guid+ '-'+d.eventRoot.children.length,
        children: [e],
        //source: p.source
      }
  }

}

function updateBG(d){
  var maxDepth = getMaxDepth(d.eventRoot)
  var depthArr = [...Array(maxDepth)]

  var data = this.target.data()
  var sel = data.d3dom.select('.timeline-bg')
    .selectAll('rect')
    .data(depthArr)

  sel.enter()
    .append('rect')
      .attr("x", -10000)
      .attr("y", (d,i)=>40+i*40)
      .attr("width", 20000)
      .attr("height", 40)

  sel.exit().remove()
  
}

function getMaxDepth(node, i=0){
  if (!node.children
    || !node.children.length) return i
  return Math.max(...node.children
    .map(e=>getMaxDepth(e,i+1)))
}


