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
        listeners:[]
      },
      nodeMap: {}
    })
    .on('get-model', function(){ 
      this.data(this.target.data())
    })

)