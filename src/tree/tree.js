import './tree.css'
import d3 from "d3"
import renderNodes from './nodes'
import renderLinks from './links'

var actions = {}

export default tree

function tree(){
  
  var instance = {}
    , state = {}

  instance.dom = dom=>(state.dom=dom, instance)
  instance.flow = flow=>(state.flow=flow, track(flow,state), instance)
  instance.render = (...data)=>render(...data, state)

  return instance
}

function track(f,s){
  render(s, 'start', toObj(f), null, null)
  flow.logger((flow, name, newData, oldData)=>{
    render(s, name, toObj(flow), toObj(newData), toObj(oldData))
  })
}

function toObj(d){
  return d && d.name && d.name.isFlow
    ? d.toObj()
    : d
}

function render(s, name, ...data){
  if (!s.d3dom) init(s);
  console.log('action', name, data)
  actions[name] && actions[name](s, ...data)
  resizeSvg(s)

  s.nodes = s.tree.nodes(s.root).reverse(),
  s.links = s.tree.links(s.nodes);
  
  //Normalize for fixed-depth.
  s.nodes.forEach(function(d) { d.y = d.depth * 60; });
  
  renderNodes(s)
  renderLinks(s)
}

function init(s){
  s.nodeMap = {}
  s.tree = d3.layout.tree()
  s.diagonal = d3.svg.diagonal()
  s.d3dom = d3.select(s.dom)
  s.width = parseInt(s.d3dom.style('width'))
  s.height = parseInt(s.d3dom.style('height'))
  s.svg = s.d3dom
    .html("")
    .append("svg")
  s.svgg = s.svg.append("g")
  s.margin = {top: 20, right: 40, bottom: 20, left: 20}
  s.delay = 0
  s.duration = 600
  s.nodes = []
  s.links = []
  
  s.svgg
      .attr("transform"
        , "translate(" + s.margin.left + "," + s.margin.top + ")");

  s.diagonal
    .projection(function(d) { return [d.x, d.y]; });
}

actions.start = (s, f, newData, oldData)=>{
  s.root = {
      name: f.name,
      id: f.guid,
      parent: null,
      children: [],
      isNew: true,
      numInstances:1
    }
  s.nodeMap[s.root.id]= s.root
}

actions.create = (s, f, newData, oldData)=>{
    var p = s.nodeMap[f.guid]
    if (!p) return;
    p.children = p.children || [];
    var existingNode = p.children.filter(c=>c.name==newData.name).pop()
    
    s.nodeMap[newData.guid] = {
      name: newData.name,
      id: newData.guid,
      children: [],
      isNew: true,
      numInstances:1,
      x0: p.x0,
      y0: p.y0
    }

    if (existingNode){
      removeNode(existingNode,s)
      s.nodeMap[newData.guid].numInstances+=existingNode.numInstances
      s.nodeMap[newData.guid].isNew= false
    }
    
    p.children.push(s.nodeMap[newData.guid])
  }

actions.emit = (s, f, newData, oldData)=>{
  var e = s.nodeMap[newData.guid]
  if (!e) return
  e.isFlow = true;
}

actions.childRemoved = (s, f, oldParent)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.isRemoved = true
}

actions.childAdded = (s, f, newParent, oldParent)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.isRemoved = newParent==null
  
  // remove child from old parent
  var oldP = oldParent && s.nodeMap[oldParent.guid]
  if (oldP && newParent) oldP.children = oldP.children.filter(n=>n.id!=f.guid)

  // add to new parent
  var newP = newParent && s.nodeMap[newParent.guid]
  if (newP) {
    newP.children = newP.children || [];
    newP.children.push(e)
  }
}



function removeNode(d,s){
  d.childen && d.children.forEach(n=>removeNode(n,s))
  if (d.parent) d.parent.children = d.parent.children.filter(n=>n.id!=d.id)
  delete s.nodeMap[d.id]
}


function resizeSvg(s){
  var width = s.width - s.margin.right - s.margin.left
    , height = s.height - s.margin.top - s.margin.bottom;
  s.tree.size([width, height]);
  s.root.x0 = s.root.x = width / 2 + s.margin.left;
  s.root.y0 = s.root.y = 0;   

  s.svg
    .attr("width", s.width)
    .attr("height", s.height)
  
}
