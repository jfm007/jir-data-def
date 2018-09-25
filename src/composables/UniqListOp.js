const stampit = require('@stamp/it');
const R = require('ramda');
const RA = require('ramda-adjunct');
const { ListOp, listOperator } = require('./ListOp');
const Maybe = require('../maybe');
/**
 * UniqueList
 */
const UniqListOp = stampit(ListOp)
  .init(function () {
    this.itemId = UniqListOp.itemId;
    this.areEqual = UniqListOp.areItemsEqual(this);
    this.isItemInList = UniqListOp.isItemInList(this);
    this.getListToAdd = UniqListOp.getListToAdd(this);
  })
  .statics({
    /**
     * to be override for different scenario
     * @param {*} item
     */
    itemId(item) {
      return item;
    },
    /**
     * used to check whether the given 2 obj equal
     * @param {*} uniqList
     * @param {*} obj1
     * @param {*} obj2
     */
    areItemsEqual(uniqOp) {
      return R.curry((obj1, obj2) => {
        return Maybe.of(uniqOp)
          .mapS(uniqOp => {
            const { itemId } = uniqOp;
            const getItemId = itemId || UniqListOp.itemId;
            return R.equals(getItemId(obj1), getItemId(obj2));
          })
          .orElse(false).join();
      });
    },
    /**
     * is item in the list
     * @param {*} uniqList
     * @param {*} item
     */
    isItemInList(op) {
      return R.curry((uniqList, item) => {
        const areEqual = op && op.areEqual ? op.areEqual : UniqListOp.areItemsEqual(null);
        return Maybe.of(uniqList)
          .mapS(R.pipe(R.findIndex(areEqual(item)), R.gte(R.__, 0)))
          .orElse(false).join();
      });
    },
    /**
     * used to get list
     */
    getListToAdd(uniqOp) {
      return (uniqList, items) => {
        /**
         * assume the op is not nil/empty
         * then used to get the qualified items for the given op
         * @param {*} op
         */
        const getQualifiedListToAdd = (op) => {
          const initList = R.curry(listOperator.getListToAdd);
          const { itemId, isItemInList } = op;
          const getItemId = itemId || UniqListOp.itemId;
          const isInList = isItemInList || UniqListOp.isItemInList;
          const getUniqList = R.uniqBy(getItemId);
          return Maybe.of(items)
            .mapS(initList(uniqList, R.__))
            .mapS(R.pipe(
              R.reject(R.pipe(getItemId, RA.isNilOrEmpty)),
              getUniqList,
              R.reject(RA.isNilOrEmpty),
              R.reject(isInList(uniqList))
            ))
            .orElse([]);
        };
        return Maybe.of(uniqOp)
          .chainS(getQualifiedListToAdd)
          .orElse(uniqList).join();
      };
    },
  });

exports.UniqListOp = UniqListOp;
exports.uniqListOperator = UniqListOp();

const UniqListOpByProp = stampit(UniqListOp)
  .init(function({prop}){
    this.itemId = (obj)=>obj && obj[prop];
  });
exports.UniqListOpByProp = UniqListOpByProp;
