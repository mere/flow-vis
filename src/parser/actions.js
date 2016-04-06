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
      //console.log(name, data)
      actions[name](s, ...data)
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
      //console.log('update', s)
      f.emit('update', s)
    }, 200)
  }
}

actions.listenerAdded = 
  actions.listenerRemoved = (s, f, newData, oldData)=>{
    var e = s.nodeMap[f.guid]
    if (!e) return
    e.source = f
    updateHash(e)
  }

actions.start = (s, f, newData, oldData)=>{
  console.log('starting', s, f)
  s.root = {
      name: f.name,
      guid: f.guid,
      parent: null,
      children: [],
      numInstances:1,
      source: f
    }
  updateHash(s.root)
  s.nodeMap[s.root.guid]= s.root
}

actions.create = (s, f, newData, oldData)=>{
  if (!s.root) actions.start(s, f, newData, oldData)

    var p = s.nodeMap[f.guid]
    if (!p) return;
    p.children = p.children || [];
    var existingNode = p.children.filter(c=>c.name==newData.name).pop()
    var e = s.nodeMap[newData.guid] = {
      name: newData.name,
      guid: newData.guid,
      children: [],
      numInstances:1,
      x0: p.x0,
      y0: p.y0,
      source: newData
    }
    updateHash(e)
    // if (existingNode){
    //   removeNode(existingNode,s)
    //   s.nodeMap[newData.guid].numInstances+=existingNode.numInstances
    //   s.nodeMap[newData.guid].isNew= false
    // }
    
    p.children.push(e)
  }

actions.emit = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.source=f
  e.isEvent = true;
  updateHash(e)
}

actions.name = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.source=f
  e.name = f.name
  updateHash(e)
}

actions.data = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.data = newData
  //updateHash(e)
}
actions.emitted = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.source=f
  updateHash(e)
}

actions.cancel = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.source=f
  updateHash(e)
}

actions.childRemoved = (s, f, oldParent)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.isRemoved = true
  updateHash(e)
}

actions.childAdded = (s, f, newParent, oldParent)=>{
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