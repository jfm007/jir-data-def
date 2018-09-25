const stampit = require('@stamp/it');
const R = require('ramda');
const RA = require('ramda-adjunct');
const Maybe = require('../maybe');
const { getLens } = require('../utils');
const { ProcessResult } = require('./ProcessResult');
const { PathObject } = require('./PathObj');
const { prefixPath, prefixPathToPathObj } = PathObject;
const isNotNaN = R.pipe(R.equals(undefined), R.not);

const ResultsObj = stampit({})
  .init(function (props) {
    Maybe.of(props)
      .mapS(props => {
        const data = props.data || props;
        const result = props.data && props.result ? props.result : null;
        return { data, result };
      })
      .orElse({ data: null, result: null })
      .map((obj) => Object.assign(this, obj));
  })
  .statics({
    /**
     * used to check whether the obj is result obj or not
     */
    isResultObj: R.either(R.propSatisfies(isNotNaN, 'data'),
      R.propSatisfies(isNotNaN, 'result')),
    /**
     *
     */
    getResultObj: (props) => {
      return Maybe.of(props)
        .mapS(R.ifElse(ResultsObj.isResultObj, R.identity, ResultsObj))
        .orElse(ResultsObj(props))
        .join();
    },
    /**
     *
     */
    mergeResultObjs: R.curry((target, source) => {
      return Maybe.of(source)
        .mapS(() => target)
        .mapS((target) => {
          const newData = getMergedData(target.data, source.data);
          const newResult = getMergedResult(target.result, source.result);
          return ResultsObj({ data: newData, result: newResult });
        })
        .orElse(target).join();
    }),
    /**
     * used to merge process result to the given results obj
     */
    updateResult: R.curry((resultsObj, processResult) => {
      const result = resultsObj && resultsObj.result ? resultsObj.result : {};
      const data = resultsObj && resultsObj.data ? resultsObj.data : {};
      return Maybe.of(processResult)
        .mapS(R.prop('path'))
        .orElse('.')
        .mapS(path => {
          const newResults = R.over(getLens(path),
            ProcessResult.mergeResult(R.__, processResult), result);
          //const setValueToObj =
          const newData = R.pipe(
            R.prop('value'),
            R.cond([
              [R.equals(undefined), () => data],
              [R.equals(null), () => R.dissocPath(R.split('.', path), data)],
              [R.T, R.assocPath(R.split('.', path), R.__, data)]
            ])
          )(processResult);
          return ResultsObj({
            data: newData,
            result: newResults
          });
        })
        .orElse(resultsObj).join();
    }),

    /**
    *
    * @param parentPath
    * @param data
    */
    prefixDataObjWithParentPath: R.curry((parentPath, data) => {
      return Maybe.of(parentPath)
        .mapS(R.pipe(
          R.split('.'),
          R.reject(RA.isNilOrEmpty)))
        .mapS(R.assocPath(R.__, data, {}))
        .orElse(data)
        .join();
    }),

    /**
    * used to add parent paths to results
    * @param parentPath
    * @returns the function to add the parent path to the processing result
    */
    prefixParentPathToProcessingResults: R.curry((parentPath, result) => {
      const preFixParentPathInResultObj = prefixPathToPathObj(R.__, parentPath);
      return Maybe.of(result)
        .mapS(R.toPairs)
        .mapS(R.map(
          R.pipe(
            R.over(R.lensIndex(0), prefixPath(R.__, parentPath)),
            R.over(R.lensIndex(1), preFixParentPathInResultObj)
          )
        ))
        .mapS(R.fromPairs)
        .orElse(result).join();
    }),

    /**
     * prefix the parent path to the run result
     */
    prefixParentPathToRunResults: R.curry((path, result) => {
      const prefixToData = R.over(getLens('data'), ResultsObj.prefixDataObjWithParentPath(path));
      const prefixToResults = R.over(getLens('result'), ResultsObj.prefixParentPathToProcessingResults(path));
      return Maybe.of(path)
        .mapS(() => R.pipe(
          prefixToData,
          prefixToResults
        )(result))
        .orElse(result).join();
    })
  });
//const setNullValueToObjAsPluckValueOut
exports.ResultsObj = ResultsObj;

/**
 * used to get he merged data from the target and source - to be improved
 * @param {*} target
 * @param {*} source
 */
const getMergedData = (target, source) => {
  return Maybe.of(target)
    .mapS(R.ifElse(
      R.is(Array),
      () => source,
      R.mergeDeepRight(R.__, source))).orElse(source).join();
};
/**
 * used to get merged result to be improved
 */
const getMergedResult = (target, source) => {
  if(target && source){
    const newResult = Maybe.of(source)
      .mapS(R.values)
      .mapS(R.reduce((acc, rslt) => {
        return R.over(
          getLens(rslt.path),
          ProcessResult.mergeResult(R.__, rslt)
        )(acc);
      }, target || {})).orElse(target).join();
    return newResult;
  }
  else {
    return target || source || null;
  }
};
