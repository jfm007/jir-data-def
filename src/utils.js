const R = require('ramda');
const RA = require('ramda-adjunct');
const Maybe = require('./maybe');
const traceFn = (arg) => {
  return arg;
};
exports.traceFn = traceFn;
const isPathWithStartingDot = R.pipe(R.take(1), R.equals('.'));
exports.isPathWithStartingDot = isPathWithStartingDot;
exports.takeOfLeadingDot = R.pipe(
  R.ifElse(R.isNil, R.identity, R.ifElse(isPathWithStartingDot, R.drop(1), R.identity)));

/**
 * might not be very efficient for long string, only applicable for short operation
 */
exports.startCaseUpper = R.pipe(R.over(R.lensIndex(0), R.toUpper), R.join(''));

exports.getParentPath = (path) => Maybe.of(path)
  .mapS(sanitizePath)
  .mapS(R.pipe(
    R.split('.'),
    R.ifElse(
      R.pipe(R.length, R.gt(R.__, 1)),
      R.pipe(R.dropLast(1), R.join('.')),
      R.always(null)
    )
  )).orElse(path).join();
/**
 * used to create enum object
 * @param {*} obj
 */
exports.getEnumObj = (obj) => {
  Object.freeze(obj);
  return obj;
};
/**
 * return a function to expect a given path to check wether the value is nil or empty
 * @param {*} obj
 */
const hasProp = R.curry((obj, path) => {
  return Maybe.of(obj)
    .mapS(() => path)
    .mapS(R.pipe(
      R.ifElse(R.contains('.'), R.split('.'), R.of),
      R.reject(R.isEmpty),
      RA.hasPath(R.__, obj)
    ))
    .orElse(false).join();
});

exports.hasProp = hasProp;
/**
 * check whether the obj doesn't have the given prop,
 */
const notHasProp = R.curry((obj, path) => !hasProp(obj, path));
exports.notHasProp = notHasProp;

const notHasAllProps = R.curry((obj, paths) =>
  R.pipe(R.map(hasProp(obj)), R.any(RA.isFalsy))(paths));
exports.notHasAllProps = notHasAllProps;

const hasAllProps = R.curry((obj, path) => !notHasAllProps(obj, path));
exports.hasAllProps = hasAllProps;

/**
 * check if the path is parent path's descendent
 * @param parentPath
 * @param path
 * @param direct boolean
 */
exports.isDescendent = function (parentPath, path, direct) {
  return Maybe.of(parentPath)
    .map(() => path)
    .map(() => {
      const parentPaths = parentPath.split('.');
      const descendentPaths = path.split('.');
      if (descendentPaths.length > parentPaths.length) {
        if (direct && descendentPaths.length > parentPaths.length + 1) {
          return false;
        }
        const heads = R.take(parentPaths.length, descendentPaths);
        return R.equals(heads, parentPaths);
      }
      return false;
    })
    .orElse(false).join();
};

/**
 * check a given value is not null/empty
 */
const isNotEmptyOrNull = R.pipe(RA.isNilOrEmpty, R.not);
exports.isNotEmptyOrNull = isNotEmptyOrNull;

exports.pluckNilValue = R.pipe(R.toPairs, R.reject((item) => R.isNil(item[1])), R.fromPairs);

/**
 *
 * @param {*} path
 */
const sanitizePath = (path) => {
  return Maybe.of(path)
    .mapS(R.replace(/\[|(\].)/g, '.'))
    .mapS(R.pipe(R.split('.'),
      R.map(R.trim),
      R.reject(RA.isNilOrEmpty),
      R.join('.')))
    .orElse(path).join();
};
exports.sanitizePath = sanitizePath;

/**
 * used to get props in list
 * @param {*} propsList -- can be a single string, array of key value pair/ array of string/ array of mixed of string and array / obj as key value pair
 * @param {*} props
 */
exports.getPropsInList = R.curry((propsList, props) => {
  return getObjFromProps(true, propsList, props);
});

/**
 * to used to assign the props default for the given props
 */
const getObjFromProps = R.curry((propsInListOnly, propsList, props) => {
  const parsePropToKeyValuePair
    = R.ifElse(R.is(String), R.prepend(R.__, [null]), R.pipe(R.toPairs, R.unnest));
  const parseThePropList = R.cond([
    [R.is(String), R.prepend(R.__, [null])],
    [R.is(Array), R.map(parsePropToKeyValuePair)],
    [R.is(Object), R.toPairs]
  ]);
  return Maybe.of(propsList)
    .mapS(parseThePropList)
    .mapS((propsList) => {
      const propKeys = R.pipe(R.map(R.head))(propsList);
      const objWithDefaultVals
        = R.pipe(R.reject(R.pipe(R.last, R.isNil)), R.fromPairs)(propsList);
      const getPropsFromList = R.ifElse(() => propsInListOnly,
        R.filter(R.pipe(R.head, R.contains(R.__, propKeys))), R.identity);
      return R.pipe(
        R.toPairs,
        getPropsFromList,
        R.fromPairs,
        R.merge(objWithDefaultVals)
      )(props);
    })
    .orElse(props)
    .join();
});

exports.getObjFromProps = getObjFromProps;
exports.getLens = (path) => R.lens(R.prop(path), R.assoc(path));
