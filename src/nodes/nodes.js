import {RADIUS, CIRCLE, DROP} from '../utils/paths'
import utils from '../utils/utils'

export default (parent)=>(
  nFlow.create('nodes')
    .parent(parent)
    .data({
      dom: null,
      diagonal: d3.svg.diagonal()
    })    
    .on('dom'   , dom)
    .on('update', render)
)

function dom(dom){
  this.target.data().dom = dom
}


 function render(){
  let flow = this.target
  let tree = this.target.parent()
  let d = this.target.data()
  let td = tree.data()
  let d3dom = td.d3nodes
  let nodes = td.nodes.filter(e=>!e.f.hidden)
  
  // Update the nodes
  var node = d3dom.selectAll("g.node")
    .data(nodes, function(d) { return d.f.guid })
  
  var nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + d.x0 + "," + d.y0 + ")"; })
    .on("mouseover", d=>flow.emit('show-route', d))
    .on("mouseout", d=>flow.emit('show-route', null))

  nodeEnter.append('path')
    .attr("transform", "scale(.8)")
    .attr("d", CIRCLE)

  nodeEnter.append('g')
    .classed('listeners', true)

  nodeEnter.append("text")
    .attr("x", RADIUS+4)
    .attr("dy", ".35em")
    .style("fill-opacity", .1);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
    .duration(td.duration)
    .delay(d=>d.f.isNew?td.delay:0)
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .each("end", function(d){
      d.x0 = d.x
      d.y0 = d.y
      delete d.f.isNew
    });

  node
    .select('path')
    .classed('is-flow', d=>d.f.isEvent)
  
  node
    .classed('is-cancelled', d=>d.f.source.status=='CANCELLED')
    .classed('is-parent-cancelled', d=>utils.parentCancelled(d))
    .classed('is-recipient', d=>utils.isRecipient(d,td))
    .classed('has-no-recipients', d=>utils.hasNoRecipients(d))
    .classed('is-emitter', d=>utils.isEntryPoint(d,td))
    .call(listeners)
  
  nodeUpdate
    .select("path")
    .attr('d', d=>d.f.isEvent? DROP : CIRCLE)

  nodeUpdate.select("text")
    .text(d=>d.recurring?'':d.f.name)
    .style("fill-opacity", 1);

  
  //TODO: Transition hidden nodes to the parent's new position.
  var nodeExit = node.exit()
    .remove();

}


function listeners(sel){
  const R = 2;

  var e = sel
    .select('.listeners')
    .selectAll('.listener')
    .data(d=>d.f.source.listeners)

  var l = e.enter()
    .append('g')
    .classed('listener', true)
    .attr("transform", (d,i)=>(
      "translate(" + (RADIUS+R) + "," + (RADIUS+i*(R+.5)*2) + ")")
    )

    //TODO add tooltips
  //l.append('text')
    //.text(String)

  l.append('circle')
    .attr("r", R)
    .attr('title', String)

  e.exit().remove()
}

