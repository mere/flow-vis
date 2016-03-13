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
export default utils