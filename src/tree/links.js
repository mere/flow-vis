import {RADIUS} from './paths'

export default function renderLinks(s){
  // Update the links
  var link = s.svgg.selectAll("path.link")
    .data(s.links, function(d) { return d.target.id; });
  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", function(d) {
    var o = {x: d.source.x0, y: d.source.y0};
    return s.diagonal({source: o, target: o});
    });

  // Transition links to their new position.
  link.transition()
    .duration(s.duration)
    .delay(d=>d.target.isNew?s.delay:0)
    .attr("d", function(d) {
      
      return s.diagonal({
        source: { x: d.source.x, y:d.source.y }
      , target: { x: d.target.x, y:d.target.y-RADIUS+1 }
      });
    });

  link.classed('is-flow', d=>d.target.isFlow)
  link.classed('is-removed', d=>d.target.isRemoved)
  // Transition exiting nodes to the parent's new position.
  link.exit()
    .remove();
}
