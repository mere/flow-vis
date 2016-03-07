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
  this.stopPropagation()
}


 function render(){
  
  let tree = this.target.parent()
  let flow = this.target
  let d = flow.data()
  let td = tree.data()
  let d3dom = td.d3links
  let links = td.links
  // Update the links
  var link = d3dom.selectAll("path.link")
    .data(links, function(d) { return d.target.guid; });
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
    .delay(d=>d.target.isNew?td.delay:0)
    .attr("d", getCoords.bind(flow));

  link
    .classed('is-flow', d=>d.target.isEvent)
    .classed('is-removed', d=>d.target.isRemoved)
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
    ||! td.showRoute.source.recipients) {
    td.d3routes.html('')
    return;
  };
  var line = d3.svg.line()
    .x(d=>d.x)
    .y(d=>d.y)
    .interpolate('linear')

  var paths = td.d3routes
    .selectAll("g.route")
    .data(td.showRoute.source.recipients, d=>d.flow.guid);

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
          source:data.nodeMap[r[0].guid],
          target:data.nodeMap[r[1].guid]})
        r.shift()
      }
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
    , target: { x: d.target.x, y:d.target.y -(d.target.isEvent?7:0) }
    })
}