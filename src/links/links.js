import {RADIUS} from '../utils/paths'
import utils from '../utils/utils'
import './links.scss'

export default (parent)=>(
  nflow.create('links')
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
      !link.source.hidden
      && !link.target.hidden
    ))
  // Update the links
  var link = d3dom.selectAll("path.link")
    .data(links, function(d) { return d.target.f.guid; });
  // Enter any new links at the parent's previous position.
  link.enter().insert("path", "g")
    .attr("class", "link")
    .attr("d", function(d0) {
    var o = {
        x: d0.source.x
      , y: d0.source.y
    };
    return d.diagonal({source: o, target: o});
    });

  var changedLinks = link
    .filter(d=>{
      return d.source.needsUpdate || d.target.needsUpdate
    })
  // Transition links to their new position.
  changedLinks.transition()
    .duration(td.duration)
    .delay(d=>d.target.updateIndex*td.delay)
    .attr("d", getCoords.bind(flow));

  changedLinks
    .classed('is-flow', d=>d.target.f.isEvent)
    .classed('is-removed', d=>d.target.f.isUnparented)
    .classed('is-disposed', d=>d.target.f.isDisposed)
    .classed('is-cancelled', d=>utils.parentCancelled(d.target))
  // Transition exiting nodes to the parent's new position.
  link.exit()
    .remove();
}

function updateRoutes(){

  let tree = this.target.parent()
  let flow = this.target
  let d = flow.data()
  let td = tree.data()
  let d3dom = td.d3routes
  let links = td.links.filter(link=>(
      !link.source.hidden
      && !link.target.hidden
      && link.target.f.route
    ))

  var link = d3dom.selectAll(".routes")
    .data(links, function(d) { return d.target.f.guid; });

  let enter = link.enter()
    .append('g')
    .classed('routes', true)

  enter.append('path')
    .classed("link", true)
    .classed("link-up", true)
    .attr("d", getCoords.bind(flow))
    .classed('is-route', true)

  enter.append('path')
    .classed("link", true)
    .classed("link-down", true)
    .attr("d", getCoords.bind(flow))
    .classed('is-route', true)

  link.attr('data-direction', d=>d.target.f.route)
  link.exit()
    .remove();
}

function selectNode(d){
  console.log('selected', d)
  let flow = this.target

}

// function updateRoutes(data){
//   let flow = this.target
//   let tree = flow.parent()
//   let d = flow.data()
//   let td = tree.data()
//   let d3dom = td.d3nodes
//   let nodes = td.nodes

//   if (!td.showRoute
//     ||! td.showRoute.f.source.recipients) {
//     td.d3routes.html('')
//     return;
//   };
//   var line = d3.svg.line()
//     .x(d=>d.x)
//     .y(d=>d.y)
//     .interpolate('linear')

//   var paths = td.d3routes
//     .selectAll("g.route")
//     .data(td.showRoute.f.source.recipients, d=>d.flow.guid);

//   paths
//     .enter()
//     .append('g')
//     .classed('route', true)

//   var links = paths
//     .selectAll('path.link')
//     .data(d=>{
//       var r = d.route.concat()
//       var pairs = []
//       while (r.length>1) {
//         pairs.push({
//           source:td.nodeMap[r[0].guid],
//           target:td.nodeMap[r[1].guid]})
//         r.shift()
//       }
//       pairs = pairs
//         .filter(pair=>(pair.source && pair.target))
//         .filter(pair=>(
//           !pair.source.hidden
//        && !pair.target.hidden))
//       return pairs
//     })

//   links.enter()
//     .insert("path", "g")
//     .attr("class", "link")

//   links.attr("d", getCoords.bind(flow));
// }

function getCoords(d){
  return this.data().diagonal({
      source: { x: d.source.x, y:d.source.y }
    , target: { x: d.target.x, y:d.target.y -(d.target.f.isEvent?7:0) }
    })
}
