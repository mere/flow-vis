import nflow from 'nflow'

export default (parent)=>(

  nflow.create('model')
    .parent(parent)
    .data({
      root: null,
      nodeMap: {}
    })
    .on('get-model', function(){ 
      this.data(this.target.data())
    })

)