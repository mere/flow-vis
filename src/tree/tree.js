import './tree.scss'
import nFlow from 'nFlow'
import Nodes from '../nodes/nodes'
import Links from '../links/links'

export default (parent)=>(
  nFlow.create('tree')
    .parent(parent)
    .call(Nodes)
    .call(Links)
    .data({
      tree: null,
      dom: null,
      duration: 500,
      delay: 0,
      allowDragging: true,
      showEvents: true,
      nodes:null,
      links:null
    })
    .on('update', update
                , render)
    .on('dom'   , dom
                , init
                , resize)
    .on('allow-dragging', allowDragging)
    .on('show-events', showEvents)
    .on('show-route', showRoute)
    .on('type', setType)
    .call(f=>setType.call(f))
)

function allowDragging(flag){
  this.target.data().allowDragging = flag
}

function showEvents(flag){
  this.target.data().showEvents = flag
}

function showRoute(node){
  this.target.data().showRoute = node
  var s = this.emit('get-model').data()
  this.emit('update',s)
}

function update(d){
  var flow = this.target
  var tree = flow.data().tree
  var fd = flow.data()
  fd.nodesByDepth = []
  if (d){
    fd.nodes = tree.nodes(d.root)//.reverse(),
    fd.links = tree.links(fd.nodes);
    fd.nodes.forEach(function(d) {
      if (!fd.nodesByDepth[d.depth]) fd.nodesByDepth[d.depth] = []
      fd.nodesByDepth[d.depth].push(d)
      d.y = d.depth * 50+50;
      d.x+=fd.width/2
      d.x0 = d.x0||(d.parent?d.parent.x0:d.x)
      d.y0 = d.y0||(d.parent?d.parent.y0:d.y)
    });
    fd.nodesByDepth.forEach((nodes,i)=>{
      nodes.reduce((a,b)=>{
        let distance = b.x-a.x
        console.log(i, a.name, distance)
        a.recurring= (a.name==b.name) && distance<a.name.length*18
        return b
      })
    })
  }
  //console.log(d)
}

function dom(dom){
  this.target.data().dom = dom
  this.target.data().isSVG = dom instanceof SVGElement
}

function setType(type='tree'){
  let f = this.target || this
  let d = f.data()
  d.type = type
  if (type=='tree') {
    d.tree = d3.layout.tree()
  }
  if (type=='cluster'){
    d.tree = d3.layout.cluster()
  } 
  d.tree
    .separation((a,b)=>{
         return (a.name == b.name)
          ? .05
          : .5+b.name.length*.1
      })
    .nodeSize([80,50])
    .children((e)=>(
      d.showEvents
        ? e.children
        : e.children&&e.children.filter(e=>!e.isEvent)
      ))
  
}

function init(){
  let d = this.target.data()
  let d3dom = d3.select(d.dom)

  d.d3svg = d3dom.html("")
  if (!d.isSVG) d.d3svg = d3dom.append("svg")

  d.d3g = d.d3svg
    .classed('nflow-vis-tree', true)
    .append('g')
    .classed('drag', true)
  
  d.allowDragging 
    && d.d3g
    .call(d3.behavior.zoom().scaleExtent([.2, 1]).on("zoom", zoom))

  d.d3overlay = d.d3g.append("rect")
    .classed("overlay", true)

    //TODO: move these into their respective nodes
  d.d3contents = d.d3g.append('g')
    .classed('tree', true)
  d.d3links = d.d3contents.append('g')
    .classed('links', true)
  d.d3routes = d.d3contents.append('g')
    .classed('routes', true)
  d.d3nodes = d.d3contents.append('g')
    .classed('nodes', true)

  
  this.target
    .get('links')
    .emit('dom', d.d3links.node())

  function zoom() {
    d.d3contents.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }

}

function render(){
  let d = this.target.data()
  // d.d3links
  //   .selectAll('.link')
  //   .data(d.links)

}

function resize(){
  this.stopPropagation()
  let d = this.target.data()
  let d3dom = d3.select(d.dom)
  d.width = d.isSVG 
    ? parseInt(d3dom.attr('width'))
    : parseInt(d3dom.style('width'))
  d.height = d.isSVG 
    ? parseInt(d3dom.attr('height'))
    : parseInt(d3dom.style('height'))

  //d.tree.size([d.width, d.height])
  console.log(d)
  d.d3svg
    .attr("width", d.width)
    .attr("height", d.height);

  d.d3overlay
    .attr("width", d.width)
    .attr("height", d.height);
}


