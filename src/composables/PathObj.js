const Stamp = require('@stamp/it');
const R = require('ramda');
const RA = require('ramda-adjunct');
const Maybe = require('../maybe');
const { sanitizePath } = require('../utils');

/**
 * Object factory to create Path obj
 */
const PathObject = Stamp({
  init({ path = null, 
    dataPath = null, 
    instancePath = null, 
    optional =false, ...props}){
    this.path = (path ? sanitizePath(path) 
      : (dataPath?sanitizePath(dataPath)
        :sanitizePath(instancePath)));
    if(RA.isNilOrEmpty(this.path)) this.path = '.';
    if(optional)
      Object.assign(this, props);
  }
}).statics({
  /**
   * used to prefix the path for the given path obj
   */
  prefixPathToPathObj: R.curry((pathObj, parentPath)=>{
    if(!pathObj) return pathObj;
    const { path } = pathObj;
    return Maybe.of(parentPath)
      .mapS(PathObject.prefixPath(path))
      .mapS(R.pipe(sanitizePath, R.assoc('path', R.__, pathObj)))
      .orElse(pathObj).join();
  }),
  /**
 * used to get function to prefix the given parent path to path
 * @param {*} parentPath
 */
  prefixPath: R.curry((path, parentPath) => {
    return Maybe.of(path)
      .chainS((path)=>{
        return Maybe.of(parentPath)
          .mapS(R.pipe(R.of, R.concat(R.__, [path]), R.join('.')))
          .orElse(path);
      })
      .orElse(()=>sanitizePath(parentPath)).join();
  })
});

exports.PathObject = PathObject;
