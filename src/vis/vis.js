import nFlow from 'nFlow'
import Parser from '../parser/parser'
export default (parent)=>(

  nFlow.create('nflow-vis')
    .parent(parent)
    .call(Parser)
    
)