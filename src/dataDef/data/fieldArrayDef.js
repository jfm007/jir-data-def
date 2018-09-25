const stampit = require('@stamp/it');
const R = require('ramda');
//const RA = require('ramda-adjunct');
const { Maybe, RunInfo, ResultsObj, ProcessorsObj} = require('../utils');
const { prefixParentPathToRunResults } = ResultsObj;
/**
 * not to us by itself, section to define all the field array related functionalities
 */
const FieldArrayDef = stampit()
  .statics({
    /**
     * used to update the fa
     * @param {} faDef
     */
    init(faDef) {
      const { initDef, name } = faDef;
      const createDef = (itemDef) =>
        initDef({ name, ...itemDef, isFieldArrayItemDef: true });
      if (faDef.isFieldArray()) {
        faDef.items = Maybe.of(faDef.items)
          .mapS(R.ifElse(R.is(Array),
            R.map(createDef),
            R.pipe(createDef, R.of)))
          .orElse(null).join();
      }
    },
    /**
     * used to get the item definitions from the faDef
     * @param {*} faDef
     */
    getItemDefs(faDef) {
      return Maybe.of(faDef)
        .mapS(R.prop('items'))
        .mapS(R.ifElse(R.is(Array), R.identity, R.of))
        .orElse([]).join();
    },
    /**
     * @param { object/array } itemDefs if the itemDefs is obj,
     * then means it is a single type defined for itemDef, return the itemDefs itself
     * if length 1, array, then return the only idx = 0
     * if length >= 2 then look up the list and return
     * @param { object } item is required to have typeId if the itemDefs is array length than 2
     */
    findDefForItem: R.curry((itemDefs, item) => {
      const isSingleArray = R.pipe(R.length, R.equals(1));
      const getDefForItem = R.curry((type, itemDefs) => R.find(R.propEq('name', type), itemDefs));
      return Maybe.of(itemDefs)
        .mapS(R.ifElse(R.both(R.is(Array), isSingleArray), R.last, R.identity))
        .mapS(R.ifElse(R.is(Array),
          (defs) => {
            return Maybe.of(item).mapS(R.prop('typeId'))
              .mapS(getDefForItem(R.__, defs))
              .orElse(null)
              .join();
          },
          R.identity))
        .orElse(null).join();
    }),
    /**
     * used to run a processor for a fieldArrayDef
     * @param {*} faDef
     * @param {*} processor
     * @param {*} data
     * @param {*} runInfo
     */
    runAllProcessors: (faDef) => (input, runInfo) => {
      const resultObj = ResultsObj.getResultObj(input);
      if (faDef && faDef.isFieldArray() && input) {
        const { runAllProcessors } = ProcessorsObj;
        const getDefForItem = FieldArrayDef.findDefForItem(faDef.items);
        const parentArray = getFieldArrayData(faDef.path, resultObj.data);
        const resultsFromArrayProcessor = Maybe.of(parentArray)
          .mapS(mapIndexed((dataItem, idx) => {
            return Maybe.of(dataItem)
              .mapS(getDefForItem)
              .mapS((def)=>processDataItem(def, runInfo, dataItem, idx, faDef.path, parentArray))
              .orElse({}).join();
          }))
          .mapS(reduceIndexed(mergeArrayProcessResult, { data: parentArray }))
          .mapS(prefixParentPathToRunResults(faDef.path))
          .orElse(resultObj).join();
        return Maybe.of(faDef.processors)
          .mapS(()=>runAllProcessors(resultObj, runInfo))
          .mapS(R.mergeDeepRight(resultsFromArrayProcessor))
          .orElse(resultsFromArrayProcessor)
          .mapS(ResultsObj.mergeResultObjs(resultObj))
          .orElse(resultObj).join();
      }
      return resultObj;
    }
  });

exports.FieldArrayDef = FieldArrayDef;

const mapIndexed = R.addIndex(R.map);
const reduceIndexed = R.addIndex(R.reduce);
const mergeArrayProcessResult = (acc, resultsObjItem) => {
  const { data, idx, result } = resultsObjItem;
  const accData = [...acc.data] || [];
  accData[idx] = data;
  const accResults = acc.result || {};
  const resultsToMerge = ResultsObj.prefixParentPathToProcessingResults(idx, result);
  return {
    data: accData,
    result: R.mergeDeepRight(accResults, resultsToMerge)
  };
};
/**
 *
 * @param {*} def
 * @param {*} path
 * @param {*} parentArray
 * @param {*} idx
 * @returns return the result with relative paths
 */
const processDataItem = (def, runInfo, dataItem, idx, path, parentArray) => {
  const info = RunInfo.getUpdatedInfo(runInfo)({
    idx,
    path,
    parentArray,
  });
  const results = def.validateData(dataItem, info);
  return Maybe.of(results)
    .mapS(R.assoc('idx', idx))
    .join();
};


/**
 * used to get field array data
 * @param {*} path
 * @param {*} data
 */
const getFieldArrayData = (path, data) => {
  return Maybe.of(path)//assume the path is sanitized
    //used to get the array from the path for the given data
    .mapS(R.pipe(R.split('.'), R.path(R.__, data)))
    .orElse(data)
    .mapS(R.ifElse(R.is(Array), R.identity, () => undefined)).join();
};
