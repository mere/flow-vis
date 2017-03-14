import {RADIUS, CIRCLE, DROP} from '../utils/paths'
import utils from '../utils/utils'
import nflow from 'nflow'

export default (parent)=>(
  nflow.create('node')
    .parent(parent)
    .data({
      dom: null,
    })
    .on('dom'   , dom)
    .on('update', render)
)

function dom(dom){
  this.target.data().dom = dom
}


{

var nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .style("opacity", 0)
    .attr("transform", function(d) {
      return "translate(" + d.x0 + "," + d.y0 + ")"; })
    .on("mouseover", d=>flow.emit('select-node', d))
    .on("mouseout", d=>flow.emit('select-node', null))

  nodeEnter.append('path')
    .attr("transform", "scale(.8)")
    .attr("d", CIRCLE)

  nodeEnter.append('g')
    .classed('listeners', true)

  nodeEnter
    .append('g')
    .attr("transform", `translate(${RADIUS+4},0)`)
    .append("text")
    .attr("x", 0)
    .attr("dy", ".35em")
    .style("fill-opacity", .1);

  var changedNodes = node
    .filter(d=>{
      return d.needsUpdate
    })

  //console.log('changedNodes', changedNodes.size())
  var nodeUpdate = changedNodes
    .transition()
    .delay(d=>d.updateIndex*td.delay)
    .style("opacity", 1)
    .duration(td.duration)
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .each("end", function(d){
      d3.select(this)
        .select("text")
        .text(d=>d.displayName)
        .style("fill-opacity", 1)
        .each(utils.wrapText(120))
        .each(utils.fitText(70))
    });

  changedNodes
    .select('path')
    .classed('is-flow', d=>d.f.isEvent)

  changedNodes
    .classed('is-cancelled', d=>d.f.status=='CANCELLED')
    .classed('is-parent-cancelled', d=>utils.parentCancelled(d))
    .classed('is-recipient', d=>utils.isRecipient(d,td))
    .classed('has-no-recipients', d=>utils.hasNoRecipients(d))
    .classed('is-emitter', d=>utils.isEntryPoint(d,td))
    .call(listeners)

  nodeUpdate
    .select("path")
    .attr('d', d=>d.f.isEvent? DROP : CIRCLE)

  var nodeExit = node.exit()
    .remove();
}


function listeners(sel){
  const R = 2;

  var e = sel
    .select('.listeners')
    .selectAll('.listener')
    .data(d=>Object.keys(d.f.listeners||{}))

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
