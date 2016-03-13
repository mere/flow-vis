import utils from '../utils/utils'
import {ERRORS} from '../utils/consts'
import Actions from './actions'
import Model from '../model/model'

export default (parent)=>{

  var f = nFlow.create('parser')
    .parent(parent)
    .call(Actions)
    .call(Model)
    .on('track', track)
  

  /**
   *  Tracks a note and treats as the root of the subtree to visualise
   */

  function track(root){
    utils.assert(!root.name.isFlow
         , ERRORS.invalidTrackArgs)
    
    f.emit('action', 'start', utils.toObj(root), null, null)
    initLogger()
  }

  /**
   *  
   */
  function initLogger(){
    if (initLogger.inited) return;
    var model = f.emit('get-model').data()
    initLogger.inited = true;
    nFlow.logger((flow, name, newData, oldData)=>{
      
      // avoid circular tracking
      if (flow.parents.has('nflow-vis')) return
      
      // only track subnodes of the root node
      if (!model.nodeMap[flow.guid()]) {
        console.warn('not tracking:', flow.name())
        return;
      };

      f.emit('action', name, 
        utils.toObj(flow)
        , utils.toObj(newData), utils.toObj(oldData))
    })
  }

  return f

}