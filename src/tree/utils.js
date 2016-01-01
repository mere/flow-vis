var utils = {}

utils.parentCancelled = node=>{
  if (!node) return false
  return node.source.status =='CANCELLED' 
    || utils.parentCancelled(node.parent)
}

utils.hasNoRecipients = node=>{
  return node.source.recipients &&
    node.source.recipients.length==0
}

utils.isRecipient = (node,s)=>{
  if (!node 
    || !s.showRoute 
    || !s.showRoute.source.recipients) 
    return false
  
  return s.showRoute.source.recipients
    .some(f=>f.flow.guid==node.id)
}

export default utils