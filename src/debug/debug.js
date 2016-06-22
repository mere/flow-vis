import './debug.scss'

import nflow from 'nflow'
import Parser from '../parser/parser'
import Tree from '../tree/tree'
import Timeline from '../timeline/timeline'
import Inspector from '../inspector/inspector'
import split from 'split.js'
import tpl from 'raw!./debug.tpl'

export default (parent)=>(
  nflow.create('flow-vis-debug')
    .parent(parent)
    .data({
      d3dom:null
    })
    .call(Parser)
    .call(Inspector)
    .call(Tree)
    .call(Timeline)
    .on('dom', dom
             , reset
             , resize
             , stop)
)

function dom(dom){

  var flow = this.target
  var d = flow.data()
  d.d3dom = d3.select(dom)
    .html(tpl)
  
  d.d3tree = d.d3dom.select('.nflow-tree')
  d.d3timeline = d.d3dom.select('.nflow-timeline')
  d.d3inspector = d.d3dom.select('.nflow-inspector')
  
  var tree =  flow.get('tree')
  tree.emit.downstream('dom', d.d3tree.node())
  tree.emit.downstream('show-events', false)
 
  flow.get('timeline')
    .emit.downstream('dom', d.d3timeline.node())
  
  flow.get('inspector')
    .emit.downstream('dom', d.d3inspector.node())
  
}

function stop(){
  this.stopPropagation()
}

function resize(){
  var flow = this.target
  var d = flow.data()
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

function reset(){
  //d3.select('.content').html(tpl)
  split(['.nodes', '.nflow-inspector'], {
      direction: 'horizontal',
      sizes: [75, 25],
      minSize: [10, 10],
      gutterSize: 8,
      cursor: 'column-resize',
      snapOffset: 10,
      onDrag:()=>this.emit('resize')
    })
  

  split(['.nflow-tree', '.nflow-timeline'], {
      direction: 'vertical',
      sizes: [75, 25],
      minSize: [10, 10],
      snapOffset: 10,
      gutterSize: 8,
      cursor: 'row-resize',
      onDrag:()=>this.emit('resize')
    })
  // var d3timeline = d3.select('.nflow-timeline')
  // var d3tree = d3.select('.nflow-tree')
  
  // vis && vis.dispose()
  // vis = nflowVis.Vis()
  // d3.select(window).on('resize.tree', ()=>vis.emit('resize'))


  // tree = nflowVis.Tree(vis)
  // tree.emit.downstream('dom', d3tree.node())
  // tree.emit.downstream('show-events', false)
  
  // timeline = nflowVis.Timeline(vis)
  // timeline.emit.downstream('dom', d3timeline.node())

}