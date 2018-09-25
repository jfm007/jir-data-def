const stampit = require('@stamp/it');
const R = require('ramda');
const Maybe = require('../maybe');
/**
 * UniqueList
 */
const SortedList = stampit({})
  .init(function ({ items = [] }) {
    this.items = items;
  })
  .methods({
    compareId(item) {
      return item;
    },
    // diff(obj1, obj2) {
    //   return 1;
    // }
  })
  .statics({
    /**
     * used to check whether the given 2 obj equal
     * @param {*} uniqList
     * @param {*} obj1
     * @param {*} obj2
     */
    compare(uniqList) {
      return R.curry((obj1, obj2) => {
        return Maybe.of(uniqList)
          .mapS((list) => R.equals(list.itemId(obj1), list.itemId(obj2)))
          .orElse(R.equals(obj1, obj2))
          .join();
      });
    }
  });

exports.SortedList = SortedList;
