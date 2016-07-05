import './inspector.scss'

import nflow from 'nflow'
import tpl from 'raw!./inspector.tpl'
import hl from 'highlight.js'
import Nodes from '../nodes/nodes'

export default (parent)=>(
  nflow.create('inspector')
    .parent(parent)
    .data({
      d3dom:null,
      selectedNode:null
    })
    //.call(Nodes)
    .on('dom', dom)
    .on('update', update)
    .on('select-node', selectNode)
)

function selectNode(node){
  if (this.target.data().selectedNode == node) return
  
  //console.log('selectedNode', this.target.data().selectedNode)
  var s = this.emit('get-model').data()
  s.selectedNode = node
  this.emit('update',s)
}


function dom(dom){
  this.stopPropagation() //downstream
  var flow = this.target
  var d = flow.data()
  d.d3dom = d3.select(dom).html(tpl)
    .select('.inspector-pane')
  
  //flow.get('nodes')
  //  .emit.downstream('dom', d.d3dom.select('.child-nodes').node())

}

function update(s){
  //this.stopPropagation() //downstream
  let e = s.selectedNode
  let d = this.target.data()
  //console.log('selected', e)
  d.d3dom
    .classed('is-hidden', !e)

  if (!e) return;

  d.d3dom.select('.name').text(e.name)
  d.d3dom.select('.id').text(e.guid)
  d.d3dom.select('.status').text(e.status)
  d.d3dom.select('.version').text(e.version)
  d.d3dom.select('.parent').text((!e.isUnparented && e.parent && e.parent.name!=null)?e.parent.name: 'DETACHED')
    
  //data
  let payload = e.data
  if (typeof(e.data)=='string') payload = JSON.parse(e.data)
  let datum = e.data!=null?JSON.stringify(payload, null, '  '):''
  d.d3dom.select('.data').text(datum)
    .each(function(){
      hl.highlightBlock(this);
    })

  //listeners
  let listeners = d.d3dom.select('.listeners')
      .selectAll('dl')
      .data(Object.keys(e.listeners||{}))

  let dl = listeners.enter()
    .append('dl')
  dl.append('dt')
  dl.append('dd')

  listeners.exit().remove()

  listeners.select('dt').text(String)
  listeners.select('dd').text(d=>e.listeners[d].join(', '))


  
  // recipents
  var recipients = d.d3dom.select('.recipients')
    .selectAll('dl')
    .data(e.recipients||[])
  let rdl = recipients.enter()
    .append('dl')
  
  rdl.append('dt')
  rdl.append('dd')

  recipients.exit().remove()

  recipients.select('dt').text(d=>d.flow.name)
  
  let cdll = recipients.select('dd')
    .selectAll('div')
    .data(d=>d.listeners)

  cdll.enter().append('div')
  cdll.exit().remove()

  cdll
    .text(d=>d.name)
    .attr('data-status',d=>d.status)


  // child nodes
  var childNodes = d.d3dom.select('.child-nodes')
    .selectAll('dl')
    .data(e.children||[])
  let cdl = childNodes.enter()
    .append('dl')
  
  cdl.append('dt')
  cdl.append('dd')

  childNodes.exit().remove()

  childNodes.select('dt').text(d=>d.name)
  childNodes.select('dd').text(d=>d.status)
  childNodes.classed('is-unparented',d=>d.isUnparented)

  // history
  var history = d.d3dom.select('.history')
    .selectAll('dl')
    .data(e.history||[])
  let hdl = history.enter()
    .append('dl')
  
  hdl.append('dt')
  hdl.append('dd')

  history.exit().remove()

  history.select('dt').text(d=>d.name)
  history.select('dd').text(d=>d.status)
  history.classed('is-unparented',d=>d.isUnparented)


}








