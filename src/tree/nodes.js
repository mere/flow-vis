import {CIRCLE, DROP, RADIUS} from './paths'

export default function renderNodes(s){
  // Update the nodes…
  var node = s.svgg.selectAll("g.node")
    .data(s.nodes, function(d) { return d.id })
  
  var nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + d.x0 + "," + d.y0 + ")"; })
    .on("click", nodeClicked);

  nodeEnter.append('path')
    .attr("transform", "scale(.8)")
    .attr("d", CIRCLE)

  nodeEnter.append("text")
    .attr("x", RADIUS+4)
    .attr("dy", ".35em")
    .attr("text-anchor", function(d) { return d.children || d._children ? "end" : "start"; })
    .style("fill-opacity", .1);

  // Transition nodes to their new position.
  var nodeUpdate = node.transition()
    .duration(s.duration)
    .delay(d=>d.isNew?s.delay:0)
    .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
    .each("end", function(d){
      d.x0 = d.x
      d.y0 = d.y
      delete d.isNew
    });

  node.select('path')
    .classed('is-flow', d=>d.isFlow)
  
  nodeUpdate
    .select("path")
    .attr('d', d=>d.isFlow? DROP : CIRCLE)

  nodeUpdate.select("text")
    .text(function(d) { return (d.numInstances>1?d.numInstances+'x ':'')+d.name; })
    .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit()
    .remove();

}

function nodeClicked(d){
  console.log('clicked', d)
}

