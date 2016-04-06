import nflow from 'nflow'
import Parser from '../parser/parser'
import Tree from '../tree/tree'
import Timeline from '../timeline/timeline'

export default (parent)=>(
  nflow.create('flow-vis-debug')
    .parent(parent)
    .data({
      d3dom:null,
      selectedNode:null
    })
    .call(Parser)
    .on('dom', dom)
    .on('select-node', selectNode)
)

function dom(dom){
  console.log(dom)
  var flow = this.target
  var d = flow.data()
  var isSVG = dom instanceof SVGElement
  d.d3dom = d3.select(dom)
  
  if (!isSVG) d.d3dom=d.d3dom.append('svg')
    .attr('width', '100%')
    .attr('height', '100%')

  d.d3dom
    .classed('flow-vis-debug', true)

  d.d3tree = d.d3dom
    .append('g')
    .classed('tree', true)

  
  d.d3timeline = d.d3dom
    .append('g')
    .classed('timeline', true)

  resize(d)
  var tree =  Tree(flow)
  tree.emit.downstream('dom', d.d3tree.node())
  tree.emit.downstream('show-events', false)
 
  var timeline = nflowVis.Timeline(flow)   
  timeline.emit.downstream('dom', d.d3timeline.node())
    
}

function resize(d){
  var w = parseInt(d.d3dom.style('width'))
  var h = parseInt(d.d3dom.style('height'))
  const TIMELINE_HEIGHT = 200
  d.d3tree
    .attr('width', w)
    .attr('height', h)
  
  d.d3timeline
    .attr('width', w)
    .attr('height', TIMELINE_HEIGHT)
    .attr('transform', `translate(0,${h-TIMELINE_HEIGHT})`)

}

function selectNode(node){
  if (this.target.data().selectedNode == node) return
  this.target.data().selectedNode = node
  console.log('selectedNode', this.target.data().selectedNode)
  var s = this.emit('get-model').data()
  this.emit('update',s)
}
