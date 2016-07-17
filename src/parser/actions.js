import nflow from 'nflow'
import utils from '../utils/utils'

var actions  = {}
let noop = ()=>{}
export default (parent)=>{
  var f = nflow.create('actions')
    .parent(parent)
    .on('action', parseAction)

  /**
   *  Parses a new action(eg. flow emitted action),
   *  and stores the new tree state in the model
   */
  function parseAction(name, ...data){
    var s = f.emit('get-model').data()
    if (actions[name]) {
      createParent(s, name, ...data)
      actions[name](s, ...data)
      updateProps(s, name, ...data)
      throttledUpdate()
    }
    else {
      console.warn('no parser found for "'+name+'"', data)
    }
  }

  function throttledUpdate(){
    if (throttledUpdate.timer) return;

    throttledUpdate.timer = setTimeout(()=>{
      delete throttledUpdate.timer;
      var s = f.emit('get-model').data()
      f.emit('update', s)
    }, 200)
  }
}

function createParent(s, name, f, newData, oldData){
  var e = s.nodeMap[f.guid]
  if (!e){
    let e = createNode(f,s)
    utils.updateHash(s.root)
  }
}

function updateProps(s, name, f, newData, oldData){
  var e = s.nodeMap[f.guid]
  //TODO merge in all props
  if (e) for(let key in f){
    e[key]= f[key]
  }
  e.history.push({f, d:newData, d0:oldData})
}


actions.listenerAdded
 = actions.listenerChanged = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  if (!e.listeners) e.listeners = {}
  //console.log(newData, newData.name)
  if (typeof newData == 'string') newData = JSON.parse(newData)
  e.listeners[newData.name] = newData.handlers
  utils.updateHash(e)
}
actions.listenerRemoved = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  delete e.listeners[newData.name]
  utils.updateHash(e)
}

actions.start = (s, f, newData, oldData)=>{
  let e = createNode(newData,s)
  s.root.children.push(e)
  e.parent = s.root
  utils.updateHash(s.root)
}

actions.create = (s, f, newData, oldData)=>{
  if (!s.root.children.length) actions.start(s, f, s)

    var p = s.nodeMap[f.guid]
    if (!p) return;
    p.children = p.children || [];
    var existingNode = p.children.filter(c=>c.name==newData.name).pop()
    var e = createNode(newData, s)
    e.parent = p
    // if (existingNode){
    //   removeNode(existingNode,s)
    //   s.nodeMap[newData.guid].numInstances+=existingNode.numInstances
    //   s.nodeMap[newData.guid].isNew= false
    // }
    p.children.push(e)
  }

actions.emit = (s, f, newData, oldData)=>{
  var e = s.nodeMap[newData.guid]
  if (!e) return;
  e.isEvent = true;
  e.isUnparented = true
  utils.updateHash(e)
}

actions.emitted = (s, f, newData, oldData)=>{
  var e = s.nodeMap[newData.guid]
  if (!e) return
  e.recipients = newData.recipients
  utils.updateHash(e)
}

actions.name = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.name = f.name
  utils.updateHash(e)
}

actions.data = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.data = newData
  utils.updateHash(e)
}



actions.cancel = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  e.status = 'CANCELLED'
  utils.updateHash(e)
}

actions.parented =noop;

actions.parent = (s, f, newParent, oldParent)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  utils.updateHash(e)
  // remove child from old parent
  var oldP = e.parent
  var newP = newParent && s.nodeMap[newParent.guid]

  if (oldP) {
    // move ownership
    if (newP) {
      oldP.children = oldP.children.filter(n=>n.guid!=f.guid)
    }
    utils.updateHash(oldP)
  }

  // add to new parent
  if (newP) {
    newP.children = newP.children || [];
    newP.children.push(e)
    e.parent = newP
    utils.updateHash(newP)
  }
  e.isUnparented = !newP
}

function createNode(f,s){
  var e = s.nodeMap[f.guid] = {
      name: f.name,
      guid: f.guid,
      children: [],
      numInstances:1,
      data:f.data,
      status:f.status,
      version:f.version,
      history:[]
    }
  utils.updateHash(e)
  return e
}

function removeNode(d,s){
  d.childen && d.children.forEach(n=>removeNode(n,s))
  if (d.parent) d.parent.children = d.parent.children.filter(n=>n.guid!=d.guid)
  delete s.nodeMap[d.guid]

}
