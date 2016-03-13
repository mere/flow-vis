import {RADIUS} from '../utils/paths'
import utils from '../utils/utils'

export default (parent)=>(
  nFlow.create('links')
    .parent(parent)
    .data({
      dom: null,
      diagonal: d3.svg.diagonal()
    })    
    .on('dom'  , dom)
    .on('update', render, updateRoutes)
)

function dom(dom){
  this.target.data().dom = dom
}


 function render(){
  
  let tree = this.target.parent()
  let flow = this.target
  let d = flow.data()
  let td = tree.data()
  let d3dom = td.d3links
  let links = td.links.filter(link=>(
      !link.source.f.hidden 
      && !link.target.f.hidden 
    ))
  // Update the links
  var link = d3dom.selectAll("path.link")
    .data(links, function(d) { return d.target.f.guid; });
  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", function(d0) {
    var o = {
        x: d0.source.x0||d0.source.x
      , y: d0.source.y0||d0.source.y
    };
    return d.diagonal({source: o, target: o});
    });

  // Transition links to their new position.
  link.transition()
    .duration(td.duration)
    .delay(d=>d.target.f.isNew?td.delay:0)
    .attr("d", getCoords.bind(flow));

  link
    .classed('is-flow', d=>d.target.f.isEvent)
    .classed('is-removed', d=>d.target.f.isRemoved)
    .classed('is-cancelled', d=>utils.parentCancelled(d.target))
  // Transition exiting nodes to the parent's new position.
  link.exit()
    .remove();
}



function updateRoutes(data){
  let flow = this.target
  let tree = flow.parent()
  let d = flow.data()
  let td = tree.data()
  let d3dom = td.d3nodes
  let nodes = td.nodes
  if (!td.showRoute
    ||! td.showRoute.f.source.recipients) {
    td.d3routes.html('')
    return;
  };
  var line = d3.svg.line()
    .x(d=>d.x)
    .y(d=>d.y)
    .interpolate('linear')

  var paths = td.d3routes
    .selectAll("g.route")
    .data(td.showRoute.f.source.recipients, d=>d.flow.guid);

  paths
    .enter()
    .append('g')
    .classed('route', true)

  var links = paths
    .selectAll('path.link')
    .data(d=>{
      var r = d.route.concat()
      var pairs = []
      while (r.length>1) {
        pairs.push({
          source:td.nodeMap[r[0].guid],
          target:td.nodeMap[r[1].guid]})
        r.shift()
      }
      pairs = pairs
        .filter(pair=>(pair.source && pair.target))
        .filter(pair=>(
          !pair.source.f.hidden 
       && !pair.target.f.hidden))
      return pairs
    })

  links.enter()
    .insert("path", "g")
    .attr("class", "link")

  links.attr("d", getCoords.bind(flow));
}

function getCoords(d){
  return this.data().diagonal({
      source: { x: d.source.x, y:d.source.y }
    , target: { x: d.target.x, y:d.target.y -(d.target.f.isEvent?7:0) }
    })
}