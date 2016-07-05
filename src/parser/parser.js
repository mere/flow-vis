import utils from '../utils/utils'
import {ERRORS} from '../utils/consts'
import Actions from './actions'
import Selection from './selection'
import Model from '../model/model'
import nflow from 'nflow'

export default (parent)=>{

  var f = nflow.create('parser')
    .parent(parent)
    .call(Model)
    .call(Actions)
    .call(Selection)
    .on('track', track
               , initLogger)
  

  /**
   *  Tracks a note and treats as the root of the subtree to visualise
   */

  function track(root){
    utils.assert(!root.name.isFlow
         , ERRORS.invalidTrackArgs)
    
    f.emit('action', 'start', root.toObj('name', 'guid'), root.toObj('name', 'guid'), null)
  }

  /**
   *  
   */
  function initLogger(){
    if (initLogger.inited) return;
    var model = f.emit('get-model').data()
    initLogger.inited = true;
    nflow.logger((flow, name, newData, oldData)=>{
      
      // avoid circular tracking
      if (flow.parents.has(f.parent())) return
      
      // only track subnodes of the root node
      if (!model.nodeMap[flow.guid()]) {
        //console.warn('not tracking:', flow.name())
        return;
      };

      f.emit('action', name, 
        flow.toObj('name','guid')
        , utils.toObj(newData), utils.toObj(oldData))
    })
  }

  return f

}