import './tree.scss'
import nflow from 'nflow'
import Nodes from '../nodes/nodes'
import Links from '../links/links'
import utils from '../utils/utils'

export default (parent)=>(
  nflow.create('tree')
    .parent(parent)
    .call(Nodes)
    .call(Links)
    .data({
      tree: null,
      dom: null,
      duration: 200,
      delay: 0,
      dragging: true, //true, false, horizontal
      showEvents: true,
      nodes:null,
      links:null,
      maxBatchLength: 7,
      nodesize:{ width:100, height:80},

      clonedNodes : {}
    })
    .on('update', update
                , render)
    .on('dom'   , dom
                , init
                , resize
                , move)
    .on('dragging', dragging)
    .on('show-events', showEvents)
    //.on('select-node', selectNode)
    .on('type', setType)
    .on('resize', resize, redraw, move)
    .call(f=>setType.call(f))
)

function dragging(flag){
  this.target.data().dragging = flag
}

function showEvents(flag){
  this.target.data().showEvents = flag
}

// function selectNode(node){
//   if (this.target.data().selectedNode == node) return
//   this.target.data().selectedNode = node
//   console.log('selectedNode', this.target.data().selectedNode)
//   var s = this.emit('get-model').data()
//   this.emit('update',s)
// }

function redraw(){
  var s = this.emit('get-model').data()
  this.emit('update',s)
}

function update(d){
  var flow = this.target
  var tree = flow.data().tree
  var fd = flow.data()
  var pd = flow.parent().data()
  fd.nodesByDepth = []
  var i=0
  if (d){
    var rootNode = (pd && pd.eventRoot) || d.root
    if (!rootNode) {
      this.stopPropagation()
      return;
    }

    var root = cloneNode(rootNode,fd)
    fd.nodes = tree.nodes(root)//.reverse(),
    fd.links = tree.links(fd.nodes);
    fd.nodeMap = {}
    let minX = d3.min(fd.nodes, d=>d.x)-40
    let maxX = d3.max(fd.nodes, d=>d.x)+40
    let maxY = d3.max(fd.nodes, d=>d.y)

    fd.width = maxX-minX;
    fd.height = maxY;

    resizeSVG(fd)
    fd.nodes.forEach(function(d) {
      if (!fd.nodesByDepth[d.depth]) fd.nodesByDepth[d.depth] = []

      fd.nodesByDepth[d.depth].push(d)
      fd.nodeMap[d.f.guid]= d
      //d.y = d.depth * (root.hidden?40:fd.nodesize.height)+ (root.hidden?0:fd.nodesize.height);
      d.x-=minX//fd.width/2
      d.y-=fd.nodesize.height>>1

      d.hidden = d.f.hidden
      d.needsUpdate = d.f.hash!=d.f.hash0
        || d.x!=d.x0
        || d.y!=d.y0

      if (d.needsUpdate) d.updateIndex = i++
      d.f.hash0 = d.f.hash

      d.x0 = (d.x0!=null)?d.x:(d.parent&&!d.parent.hidden?d.parent.x:d.x)
      d.y0 = (d.y0!=null)?d.y:(d.parent&&!d.parent.hidden?d.parent.y:d.y)

    });
    fd.nodesByDepth.forEach((nodes,i)=>{
      if (nodes.length==1) {
        let node = nodes[0]
        node.displayName = node.f.name
        node.recurring = false
      }
      nodes.reduce((a,b)=>{
        let distance = b.x-a.x
        a.recurring= (a.f.name==b.f.name) && distance<a.f.name.length*18
        a.displayName = a.recurring?'':a.f.name
        b.displayName = b.f.name
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
      //console.log('sep', a.f.name, b.f.name, a.depth, b)
         return (a.f.name == b.f.name)
          ? .05
          : ((a.f.children.length | b.f.children.length)?1:.8 )
      })
    .nodeSize([d.nodesize.width,d.nodesize.height])
    .children((e)=>(
      d.showEvents
        ? e.f.children
            .map(e=>cloneNode(e,d))
        : e.f.children && e.f.children
            .filter(e=>!e.isEvent)
            .map(e=>cloneNode(e,d))
      ))
}

function cloneNode(e,d){
  if (!d.clonedNodes[e.guid])
    d.clonedNodes[e.guid] = { f:e }
  return d.clonedNodes[e.guid]
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


  d.zoom = d3.behavior.zoom()
    .scaleExtent([.1,2])
    .scale(d.dragging=='horizontal'?.5:1)
    .on("zoom", ()=>moveContents(d));

  d.dragging
    && d.d3g
   .call(d.zoom)

  d.d3overlay = d.d3g.append("rect")
    .classed("overlay", true)
    .on("click", ()=>this.emit('select-node', null))

    //TODO: move these into their respective nodes
  d.d3contents = d.d3g.append('g')
    .classed('tree', true)
  d.d3links = d.d3contents.append('g')
    .classed('links', true)
  d.d3routes = d.d3contents.append('g')
    .classed('routes', true)
  d.d3nodes = d.d3contents.append('g')
    .classed('nodes', true)


  // this.target
  //   .get('links')
  //   .emit.downstream('dom', d.d3links.node())


}


function move() {
  let d = this.target.data()
  moveContents(d)
}

function moveContents(d){
  if (!d.dragging) return
  var t = d3.event? d3.event.translate: d.zoom.translate()
  var s = d3.event? d3.event.scale: d.zoom.scale()

  //zoom.translate(t);
  var maxBounds = d.d3overlay.node().getBBox()
  var bounds = d.d3nodes.node().getBBox()
  // var maxScale = .7 / Math.max(
  //     bounds.width / d.width
  //   , bounds.height / d.height)
  // var minScale = .9 / Math.min(
  //     bounds.width / d.width
  //   , bounds.height / d.height)
  // var offsetX = 0

  if (d.dragging=='horizontal' && bounds.height) {
    //let maxScale = .5*maxBounds.height/(s*bounds.height)
    //console.log(s*bounds.height, bounds.height, d.height, maxBounds.height, maxScale)
    //s = Math.max(s,maxScale)
    t[1] = Math.max((1-s)*bounds.height, t[1])
    t[1] = Math.min(0, t[1])

  }

  d.zoom.translate(t);
  d.zoom.scale(s);

  d.d3contents
    .attr("transform", "translate(" + t + ")scale(" + s + ")");
}

function fitContents(){}

function render(){
  let d = this.target.data()
  setTimeout(()=>{
    this.emit('updated')
  }, d.duration + 1)
  // d.d3links
  //   .selectAll('.link')
  //   .data(d.links)
}

function resizeSVG(d){
  d.d3svg
    .attr("width", d.width)
    .attr("height", d.height);

  d.d3overlay
    .attr("width", d.width)
    .attr("height", d.height);
}

function resize(){
  let d = this.target.data()
  let d3dom = d3.select(d.dom)
  let w = d.isSVG
    ? parseInt(d3dom.attr('width'))
    : parseInt(d3dom.style('width'))
  let h = d.isSVG
    ? parseInt(d3dom.attr('height'))
    : parseInt(d3dom.style('height'))
  w = w^0
  h = h^0
  if (d.width === w && d.height === h ) {
    this.stopPropagation()
    return
  }
  d.width = w;
  d.height = h;

  resizeSVG(d)
}
