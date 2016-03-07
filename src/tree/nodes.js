import {CIRCLE, DROP, RADIUS} from './paths'
import utils from '../utils/utils'

export default function renderNodes(s){
  // Update the nodes…
  var node = s.d3nodes.selectAll("g.node")
    .data(s.nodes, function(d) { return d.id })
  
  var nodeEnter = node.enter().append("g")
    .attr("class", "node")
    .attr("transform", function(d) {
      return "translate(" + d.x0 + "," + d.y0 + ")"; })
    .on("mouseover", d=>mouseover(s,d))
    .on("mouseout", d=>mouseout(s,d))

  nodeEnter.append('path')
    .attr("transform", "scale(.8)")
    .attr("d", CIRCLE)

  nodeEnter.append('g')
    .classed('listeners', true)

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

  node
    .select('path')
    .classed('is-flow', d=>d.isFlow)
  
  node
    .classed('is-cancelled', d=>d.source.status=='CANCELLED')
    .classed('is-parent-cancelled', d=>utils.parentCancelled(d))
    .classed('is-recipient', d=>utils.isRecipient(d,s))
    .classed('has-no-recipients', d=>utils.hasNoRecipients(d))

  node.call(listeners)
  
  nodeUpdate
    .select("path")
    .attr('d', d=>d.isFlow? DROP : CIRCLE)

  nodeUpdate.select("text")
    .text(function(d) { return (d.numInstances>1?d.numInstances+'x ':'')+d.name; })
    .style("fill-opacity", 1);

  // Transition exiting nodes to the parent's new position.
  var nodeExit = node.exit()
    .remove();

  showRoute(s)
}

function listeners(sel){
  const R = 2;

  var e = sel
    .select('.listeners')
    .selectAll('.listener')
    .data(d=>d.source.listeners)

  e.enter()
    .append('circle')
    .classed('listener', true)
    .attr("cx", RADIUS+R)
    .attr("cy", (d,i)=>RADIUS+i*(R+.5)*2)
    .attr("r", R)
    .attr('title', String)


}

function mouseover(s, d){
  s.showRoute = d
  s.render()
}

function mouseout(s, d){
  s.showRoute = null
  s.render()
}

function showRoute(s){
  if (!s.showRoute
    ||! s.showRoute.source.recipients) {
    s.d3routes.html('')
    return;
  };
  var line = d3.svg.line()
    .x(d=>d.x)
    .y(d=>d.y)
    .interpolate('linear')

  var paths = s.d3routes
    .selectAll("g.route")
    .data(s.showRoute.source.recipients, d=>d.flow.guid);

  paths
    .enter()
    .append('g')
    .classed('route', true)

  //paths.attr("transform", (d,i)=>
  //  "translate(" + (i*3) + ",0)");

  var links = paths
    .selectAll('path.link')
    .data(d=>{
      var r = d.route.concat()
      var pairs = []
      while (r.length>1) {

        pairs.push({
          source:s.nodeMap[r[0].guid],
          target:s.nodeMap[r[1].guid]})
        r.shift()
      }
      return pairs
    })

  links.enter()
    .insert("path", "g")
    .attr("class", "link")

  links.attr("d", function(d) {
    var upstream = d.source.y>d.target.y
    
    return s.diagonal({
      source: { x: d.source.x, y:d.source.y }
    , target: { x: d.target.x, y:d.target.y}
    });
  });
}
