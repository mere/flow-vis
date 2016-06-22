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

  d.d3dom.select('.name').text(e.f.name)
  d.d3dom.select('.id').text(e.f.guid)
  d.d3dom.select('.status').text(e.f.status)
  
  //data
  d.d3dom.select('.data').text(JSON.stringify(e.f.data,null, '  '))
    .each(function(){
      hl.highlightBlock(this);
    })

  //listeners
  let listeners = d.d3dom.select('.listeners')
      .selectAll('dl')
      .data(Object.keys(e.f.listeners||{}))

  let dl = listeners.enter()
    .append('dl')
  dl.append('dt')
  dl.append('dd')

  listeners.exit().remove()

  listeners.select('dt').text(String)
  listeners.select('dd').text(d=>e.f.listeners[d].join(', '))


  console.log(e.f)  
  
  // recipents
  var recipients = d.d3dom.select('.recipients')
    .selectAll('dl')
    .data(e.f.recipients||[])
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
    .data(e.f.children||[])
  let cdl = childNodes.enter()
    .append('dl')
  
  cdl.append('dt')
  cdl.append('dd')

  childNodes.exit().remove()

  childNodes.select('dt').text(d=>d.name)
  childNodes.select('dd').text(d=>d.status)


}








