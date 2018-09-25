const R = require('ramda');
/**
 *
 * @param {*} value
 * @constructor
 */
const Maybe = function(value){
  const maybe = R.ifElse(
    R.isNil,
    ()=>({ isNothing: true }),
    (val)=> ({ value: val, isEmpty: R.isEmpty(val) }))(value);
  Object.assign(this, {...maybe});
};

/**
 * static method used to create Maybe object
 * @param {*} value
 */
Maybe.of = function(value){
  return new Maybe(value);
};

/**
 * used to map the transform function
 * @param {*} transform
 */
Maybe.prototype.map = function(transform) {
  if (typeof transform !== 'function') throw new Error('transform must be a function');
  if (this.isNothing) {
    return this;
  }
  return Maybe.of(transform(this.value));
};

/**
 *
 * @param {*} transform
 */
Maybe.prototype.mapS = function(transform){
  if(this.isEmpty) return new Maybe(undefined);
  return this.map(transform);
};
/**
 * Get the monad's value
 * @example const maybe1 = Maybe.of(123);
 * const maybe2 = Maybe.of(null);
 *
 * maybe1.join();   // 123
 * maybe2.join();   // null
 * @returns {*} Returns the value of the monad
 */
Maybe.prototype.join = function () {
  return this.value;
};

/**
 * Chain to the end of <code>prop</code>, <code>props</code>, or <code>path</code> as the
 * default value to return if the <code>isNothing()</code> is true
 * @param defaultValue {string} Return this value when <code>join()</code> is called and <code>isNothing()</code> is true
 * @example const maybe1 = Maybe.of(null);
 *
 * maybe1.orElse('N/A');
 * maybe1.join();   // 'N/A'
 * @returns {Maybe} A monad containing the default value
 */
Maybe.prototype.orElse = function (defaultValue) {
  if (this.isNothing) {
    if (typeof defaultValue === 'function')
      return Maybe.of(defaultValue());
    return Maybe.of(defaultValue);
  }
  return this;
};

/**
 * Chain together functions that return Maybe monads
 * @param fn {function} Function that is passed the value of the calling monad, and returns a monad.
 * @example function addOne (val) {
 *   return Maybe.of(val + 1);
 * }
 *
 * const three = Maybe.of(1)
 *  .chain(addOne)
 *  .chain(addOne)
 *  .join();
 * @returns {Maybe} A monad created from the result of the transformation
 */
Maybe.prototype.chain = function (fn) {
  if (this.isNothing) { return Maybe.of(undefined); }
  return this.map(fn).join();
};

/**
 * ignore the transform fn if the given value is nil/empty
 * @param {*} fn
 */
Maybe.prototype.chainS = function(fn) {
  if (this.isEmpty || this.isNothing) { return Maybe.of(undefined); }
  return this.mapS(fn).join();
};

module.exports = Maybe;
