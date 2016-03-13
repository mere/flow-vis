import nFlow from 'nFlow'

export default (parent)=>(

  nFlow.create('model')
    .parent(parent)
    .data({
      root: null,
      nodeMap: {}
    })
    .on('get-model', function(){ 
      this.data(this.target.data())
    })

)