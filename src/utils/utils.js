var utils = {}

utils.parentCancelled = node=>{
  if (!node) return false
  return node.f.status =='CANCELLED' 
    || utils.parentCancelled(node.parent)
}

utils.hasNoRecipients = node=>{
  return node.f.recipients &&
    node.f.recipients.length==0
}

utils.isRecipient = (node,s)=>{
  if (!node 
    || !s.showRoute 
    || !s.showRoute.f.recipients) 
    return false
  
  return s.showRoute.f.recipients
    .some(f=>f.flow.guid==node.f.guid)
}

utils.isEmitter = (node,s)=>{
  if (!node 
    || !s.showRoute 
    || !s.showRoute.f.recipients) 
    return false
  
  return s.showRoute.f.parent.guid==node.f.guid
}

/**
 * the node where the event re-enters into the tree
 * from an event chain
 */
utils.isEntryPoint = (node,s)=>{
  if (!node 
    || !s.showRoute 
    || !s.showRoute.f.recipients) 
    return false

  let entryPoint = s.showRoute
  while (entryPoint && entryPoint.f.isEvent){
    entryPoint = entryPoint.parent
  }
  return entryPoint.f.guid==node.f.guid
}

utils.assert = (condition, error, val)=>{
  if (condition) {
    throw new Error(error
      .replace("%s", val))
  }
  return condition
}

utils.toObj = (d)=>{
  return d && d.name && d.name.isFlow
    ? d.toObj()
    : d
}

//TODO check maxHeight as well
utils.fitText = function(maxWidth){
  return function(d){
    var d3text = d3.select(this)
    var bb = d3text.node().getBBox();
    var r = maxWidth / bb.width;
    var fontSize = parseFloat(d3text.style("font-size"))
    r = Math.min(r,1)
    d3text
      .style('font-size', (r*fontSize)+'px')
    
  }
}
utils.wrapText = function(maxWidth) {
  return function(d){

    var d3text = d3.select(this),
      words = d.displayName
        .replace(/(-|\.|\s)/g,'$&{SEP}')
        .split('{SEP}')
        .reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = .5, // ems
      x = d3text.attr("x"),
      y = d3text.attr("y"),
      dy = parseFloat(d3text.attr("dy")),
      tspan = d3text.text(null)
         .append("tspan")
         .attr("x", x)
         .attr("y", y)
         .attr("dy", dy + "em");
  
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(""));
      if (tspan.node().getComputedTextLength() > maxWidth && line.length>1) {
        line.pop();
        tspan.text(line.join(""));
        line = [word];
        tspan = d3text
          .append("tspan")
          .attr("x", x)
          .attr("y", y)
          .attr("dy", lineHeight + dy + "em")
          .text(word);
      }
    }
  }
}


utils.updateHash = (d)=>{
  d.hash = createGuid()
}

function createGuid(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
}

export default utils