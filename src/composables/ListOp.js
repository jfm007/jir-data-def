const stampit = require('@stamp/it');
const R = require('ramda');
const Maybe = require('../maybe');
const RA = require('ramda-adjunct');
/**
 * contains operation on arrays
 */
const ListOp = stampit({})
  .init(function(){
    this.getListToAdd = ListOp.getListToAdd(this);
    this.addToList = ListOp.addToList(this);
  })
  .statics({
    /**
     * used to get the list to add
     * @param {*} op
     */
    getListToAdd(op){
      return (target, items)=>{
        return Maybe.of(op)
          .mapS(()=>items||target)
          .mapS(R.ifElse(R.is(Array), R.identity, R.of))
          .mapS(R.reject(RA.isNilOrEmpty))
          .orElse([]).join();
      };
    },
    /**
     * used to add item/items to the list, return a new list
     */
    addToList: R.curry((op, list, item)=>{
      const getItemsToAdd = op && op.getListToAdd ? op.getListToAdd : ListOp.getListToAdd(op);
      const concatList = (items) => R.pipe(
        R.ifElse(RA.isNilOrEmpty, R.always([]), R.identity),
        R.concat(R.__, items)
      )(list);
      return Maybe.of(item)
        .mapS((items)=>getItemsToAdd(list, items))
        .mapS(concatList)
        .orElse(list).join();
    })
  });

exports.ListOp = ListOp;

exports.listOperator = ListOp();
