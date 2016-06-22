import nflow from 'nflow'
var actions  = {}

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
      actions[name](s, ...data)
      updateProps(s, ...data)
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

function updateProps(s, f, newData, oldData){
  var e = s.nodeMap[f.guid]
  //TODO merge in all props
  if (e) for(let key in f){
    e[key]= f[key]
  }
}


actions.listenerAdded
 = actions.listenerChanged = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  if (!e.listeners) e.listeners = {}
  e.listeners[newData.name] = newData.handlers
  updateHash(e)
}
actions.listenerRemoved = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  delete e.listeners[newData.name]
  updateHash(e)
}

actions.start = (s, f, newData, oldData)=>{
  let e = createNode(newData,s)
  s.root.children.push(e)
  updateHash(s.root)
}

actions.create = (s, f, newData, oldData)=>{
  if (!s.root.children.length) actions.start(s, f, s)

    var p = s.nodeMap[f.guid]
    if (!p) return;
    p.children = p.children || [];
    var existingNode = p.children.filter(c=>c.name==newData.name).pop()
    var e = createNode(newData, s)
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
  updateHash(e)
}

actions.emitted = (s, f, newData, oldData)=>{
  var e = s.nodeMap[newData.guid]
  if (!e) return
  e.recipients = newData.recipients
  updateHash(e)
}

actions.name = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.name = f.name
  updateHash(e)
}

actions.data = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.data = newData
  updateHash(e)
}



actions.cancel = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  updateHash(e)
}

actions.parent = actions.parented = (s, f, newParent, oldParent)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.isRemoved = newParent==null
  updateHash(e)
  
  // remove child from old parent
  var oldP = oldParent && s.nodeMap[oldParent.guid]
  if (oldP && newParent) oldP.children = oldP.children.filter(n=>n.guid!=f.guid)

  // add to new parent
  var newP = newParent && s.nodeMap[newParent.guid]
  if (newP) {
    newP.children = newP.children || [];
    newP.children.push(e)
  }
}

function createNode(f,s){
  var e = s.nodeMap[f.guid] = {
      name: f.name,
      guid: f.guid,
      children: [],
      numInstances:1,
      parent:f.parent,
      data:f.data,
      status:f.status,
      version:f.version
    }
  updateHash(e)
  return e
}

function removeNode(d,s){
  d.childen && d.children.forEach(n=>removeNode(n,s))
  if (d.parent) d.parent.children = d.parent.children.filter(n=>n.guid!=d.guid)
  delete s.nodeMap[d.guid]
  
}

function updateHash(d){
  d.hash = createGuid()
}

function createGuid(){
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    .replace(/[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
}