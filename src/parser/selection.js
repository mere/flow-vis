import nflow from 'nflow'
import utils from '../utils/utils'
import {DIRECTION_BITMASK} from '../utils/consts'

/**
 *   - exposes selected nodes on the model
 *   - highlight affected routes to the selected node
 */
export default (parent)=>{
  var f = nflow.create('selection')
    .parent(parent)
    .on('select-node', selectNode)

  return f

  function selectNode(node){
    var s = f.emit('get-model').data()
    if (s.selectedNode === node) return;
    s.selectedNode = node;

    updateRecipients(node, s)

    f.emit('update', s)
  }

}


function updateRecipients(f, s){
  var recipientMap = {}
  Object.keys(s.nodeMap).forEach(guid=>{
    let f = s.nodeMap[guid]
    if (f.recipientInfo !== undefined) utils.updateHash(f)
    if (f.route !== undefined) utils.updateHash(f)
    if (f.isEmitter !== undefined) utils.updateHash(f)
    delete f.recipientInfo
    delete f.route
    delete f.isEmitter
  })
  if (f && f.parent && s.nodeMap[f.parent.guid]) {
    s.nodeMap[f.parent.guid].isEmitter = true
  }
  f && f.recipients
    && f.recipients.forEach(recipient=>{
      let node = s.nodeMap[recipient.flow.guid]
      if (node) {
        node.recipientInfo = recipient
        utils.updateHash(node)
        let prevNode = null
        recipient.route.forEach(f=>{
          let node = s.nodeMap[f.flow.guid]

          if (f.direction=='UPSTREAM' && prevNode) {
            prevNode.route |= DIRECTION_BITMASK[f.direction]
            utils.updateHash(prevNode)
          }
          if (f.direction=='DOWNSTREAM' && node) {
            node.route |= DIRECTION_BITMASK[f.direction]
            utils.updateHash(node)
          }
          prevNode = node          
          
        })
      }

    })
}