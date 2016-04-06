var utils = {}

utils.parentCancelled = node=>{
  if (!node) return false
  return node.f.source.status =='CANCELLED' 
    || utils.parentCancelled(node.parent)
}

utils.hasNoRecipients = node=>{
  return node.f.source.recipients &&
    node.f.source.recipients.length==0
}

utils.isRecipient = (node,s)=>{
  if (!node 
    || !s.showRoute 
    || !s.showRoute.f.source.recipients) 
    return false
  
  return s.showRoute.f.source.recipients
    .some(f=>f.flow.guid==node.f.guid)
}

utils.isEmitter = (node,s)=>{
  if (!node 
    || !s.showRoute 
    || !s.showRoute.f.source.recipients) 
    return false
  
  return s.showRoute.f.source.parent.guid==node.f.guid
}

/**
 * the node where the event re-enters into the tree
 * from an event chain
 */
utils.isEntryPoint = (node,s)=>{
  if (!node 
    || !s.showRoute 
    || !s.showRoute.f.source.recipients) 
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
    r = Math.min(r,1)
    d3text
      .style('transform', `scale(${r})`)
    
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

export default utils