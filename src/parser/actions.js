import nFlow from 'nFlow'
var actions  = {}

export default (parent)=>{
  var f = nFlow.create('actions')
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

actions.listenerAdded = 
  actions.listenerRemoved = (s, f, newData, oldData)=>{
    var e = s.nodeMap[f.guid]
    if (!e) return
    e.source = f
  }

actions.start = (s, f, newData, oldData)=>{
  s.root = {
      name: f.name,
      guid: f.guid,
      parent: null,
      children: [],
      isNew: true,
      numInstances:1,
      source: f
    }
  s.nodeMap[s.root.guid]= s.root
}

actions.create = (s, f, newData, oldData)=>{
    var p = s.nodeMap[f.guid]
    if (!p) return;
    p.children = p.children || [];
    var existingNode = p.children.filter(c=>c.name==newData.name).pop()
    s.nodeMap[newData.guid] = {
      name: newData.name,
      guid: newData.guid,
      children: [],
      isNew: true,
      numInstances:1,
      x0: p.x0,
      y0: p.y0,
      source: newData
    }

    // if (existingNode){
    //   removeNode(existingNode,s)
    //   s.nodeMap[newData.guid].numInstances+=existingNode.numInstances
    //   s.nodeMap[newData.guid].isNew= false
    // }
    
    p.children.push(s.nodeMap[newData.guid])
  }

actions.emit = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.source=f
  e.isEvent = true;

}
actions.emitted = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.source=f
  
}

actions.cancel = (s, f, newData, oldData)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.source=f
}

actions.childRemoved = (s, f, oldParent)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.isRemoved = true
}

actions.childAdded = (s, f, newParent, oldParent)=>{
  var e = s.nodeMap[f.guid]
  if (!e) return
  e.isRemoved = newParent==null
  
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
