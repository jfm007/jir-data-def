const R = require('ramda');
const Maybe = require('../../maybe');
const { ProcessorsObj, ProcessorTypes } = require('../../processor');
const { ConditionProcessor } = require('./ConditionProcessor');
const { Condition } = ProcessorTypes;
/**
 * used to create a processor on client side processing
 * @param {*} processorConfig
 */
exports.createProcessor = (processorConfig) => {
  const typeEq = R.propEq('type');
  return Maybe.of(processorConfig)
    .mapS(R.cond([
      [typeEq(Condition), ConditionProcessor],
      [R.T, ProcessorsObj.createProcessor ]
    ]))
    .orElse(null).join();
};
