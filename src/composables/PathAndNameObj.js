const Stamp = require('@stamp/it');
const R = require('ramda');
const RA = require('ramda-adjunct');
const Maybe = require('../maybe');
const { isNotEmptyOrNull, sanitizePath } = require('../utils');
/**
 * Used to define PropertyDefintion with only path and name
 */
const PathAndNameObj = Stamp({
  init({ path = null, name = null, parentPath = null }) {

    //const obj = { path, name };
    const props = R.cond([
      [R.where({ name: isNotEmptyOrNull, path: isNotEmptyOrNull }), ()=>({name, path})],
      [R.where({ name: isNotEmptyOrNull, path: RA.isNilOrEmpty, parentPath: isNotEmptyOrNull }),
        ()=>({ path:R.join('.', [parentPath, name]), name })],
      [R.propSatisfies(isNotEmptyOrNull, 'name'), (props) => {
        if(R.contains('.', props.name))
          throw new Error('name should not contains "." ');
        return { ...props, path: null };
      }],
      [R.propSatisfies(isNotEmptyOrNull, 'path'), getNameFromPath],
      [R.T, () => { throw new Error('both name and path is null'); }]
    ])({path:sanitizePath(path), name, parentPath:sanitizePath(parentPath)});
    Object.assign(this, props);
  }
});

exports.PathAndNameObj = PathAndNameObj;

const getNameFromPath = ({path}) =>{
  const trimOffDot = R.pipe(R.split('.'), R.filter(isNotEmptyOrNull), R.join('.'));
  const name = Maybe.of(path)
    .mapS(R.pipe(R.split('.'), R.filter(isNotEmptyOrNull), R.last))
    .orElse(null)
    .join();
  if(name) return { name, path: trimOffDot(path)};
  throw new Error('both name and path is null');
};
