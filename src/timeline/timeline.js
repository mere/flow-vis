import Tree from '../tree/tree'

export default (parent)=>(
  nFlow.create('timeline')
    .parent(parent)
    .call(Tree)
    .data({
      eventRoot:{
        name: 'event-root',
        guid: -1,
        parent: null,
        children: [],
        isNew: false,
        source: null,
        hidden: true
      }
    })
    .on('update', update)
    .call(init)
    // .on('allow-dragging', allowDragging)
    // .on('show-events', showEvents)
    // .on('show-route', showRoute)
    // .on('type', setType)

)

function init(f){
  f.emit.downstream('dragging', 'horizontal')
  f.create('lines')
    .on('dom'   , dom)

}

function dom(d){
  
  let d3dom = d3.select(d)

  let drag = d3dom.select('.tree')
    .insert('g',":first-child")
  let depth = [1,2,3,4,5,6,7,8] //todo use the calculated depth
  depth.forEach(e=>{
    drag.append('line')
      .attr("x1", -10000)
      .attr("y1", e*40)
      .attr("x2", 10000)
      .attr("y2", e*40);
    
  })

}

function update(d){
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
    
    if (lastEvent.source == p.source) {
      lastEvent.children.push(e)
      return null
    }
    return {
        name: p.name,
        guid: p.guid+ '-'+d.eventRoot.children.length,
        children: [e],
        isNew: false,
        source: p.source,
        hidden: false
      }
  }

}


