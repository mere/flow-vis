import nflow from 'nflow'

export default (parent)=>(

  nflow.create('model')
    .parent(parent)
    .data({
      root: {
        name: 'nflow-vis-root',
        guid: -1,
        parent: null,
        children: [],
        numInstances:1,
        hidden:true,
        listeners:[],
        isRoot:true
      },
      eventRoot: {
        name: 'nflow-vis-event-root',
        guid: -2,
        parent: null,
        children: [],
        numInstances:1,
        hidden:true,
        listeners:[],
        isRoot:true
      },
      nodeMap: {},
      selectedNode: null
    })
    .on('get-model', function(){ 
      this.data(this.target.data())
    })

)