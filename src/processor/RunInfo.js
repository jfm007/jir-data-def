const stampit = require('@stamp/it');
const Maybe = require('../maybe');
const R = require('ramda');
const RA = require('ramda-adjunct');
const { getLens } = require('../utils');
const { PathObject } = require('../composables');

const { prefixPath } = PathObject;
/**
 * The factory used to contains the run info
 */
const RunInfo = stampit()
  .init(function ({ data, idx, parentArray, parentArrayPaths, parentArrayItemPaths, path }) {
    this.data = data;
    if (idx) this.idx = idx;
    if (parentArray) this.parentArray = parentArray;
    if (parentArrayPaths) this.parentArrayPaths = parentArrayPaths;
    if (parentArrayItemPaths) this.parentArrayPaths = parentArrayItemPaths;
    if (path) this.path = path;
  })
  .statics({
    /**
     * used to get updated runInfo
     * @param {*} runInfo
     */
    getUpdatedInfo(runInfo) {
      return ({ idx, parentArray, path }) => {
        const getEmptyArrayIfNil = R.ifElse(R.isNil,
          () => [],
          R.ifElse(R.is(Array), R.identity, R.of));
        const pathWithIdx = `${path||''}.${idx}`;
        const isFieldArrayUpdate = !R.any(RA.isNilOrEmpty, [idx, parentArray]);
        const updateForFieldArray = () => {
          return Maybe.of(runInfo)
            .mapS(R.ifElse(RA.isNilOrEmpty, R.identity, R.assoc('idx', idx)))
            .mapS(R.ifElse(RA.isNilOrEmpty, R.identity, R.assoc('parentArray', parentArray)))
            .mapS(R.over(getLens('path'), prefixPath(pathWithIdx)))
            .mapS(R.over(getLens('parentArrayPaths'),
              R.pipe(getEmptyArrayIfNil, R.append(RA.isNilOrEmpty(path)?'.':path))))
            .mapS(R.over(getLens('parentArrayItemPaths'),
              R.pipe(getEmptyArrayIfNil, R.append(pathWithIdx))))
            .orElse(runInfo).join();
        };
        const updateForNonFieldArray = () => {
          return Maybe.of(runInfo)
            .mapS(R.assoc('path', RA.isNilOrEmpty(path)?'.':path))
            .join();
        };
        return isFieldArrayUpdate ? updateForFieldArray():updateForNonFieldArray();
      };
    }
  });

exports.RunInfo = RunInfo;
