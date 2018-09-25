const stampit = require('@stamp/it');
const R = require('ramda');
const RA = require('ramda-adjunct');
const { Processor, ProcessorTypes } = require('./Processor');
const { ProcessResult } = require('../composables');
const Maybe = require('../maybe');
const { runProcessor } = Processor;

/**
 * Param of condition expected to be like this
 * {
 *   fn: expect to return true/false
 *   params: {}, one and only of the params has the isReport
 *   isReadOnly: default to undefined
 *   failed: default to null;
 *   success: default to null;
 * }
 *
 * 1. When fn return false and failed is null ,
 *    isReadOnly(true) : the field should be clear with value and set to readonly
 *    isReadOnly(false/undefined) : the field should be clear with value and set to not display
 * 2. When fn failed and failed is not null
 *    the field should be clear with value and set to readonly
 * 3. When fn return true and success is null,
 *    Value will stay the same
 * 4. When fn return true and success is not null
 *    Value will be changed if it is not the same as the success
 * the condition processor
 */
const ConditionProcessor = stampit(Processor)
  .init(function () {
    this.type = ProcessorTypes.Condition;
    if (!ConditionProcessor.isOneAndOnlyReport(this.paramInfos)) {
      throw new Error('Condition Processor should have one and only target');
    }
    this.targetParam = ConditionProcessor.getReportTargetParam(this.paramInfos);
  })
  .methods({
    run(data) {
      return ConditionProcessor.runConditionProcessor(this, data);
    }
  })
  .statics({
    /**
    * the params should contains the report target, one and only
    * @param param
    */
    isOneAndOnlyReport(params) {
      return Maybe.of(params)
        .mapS(R.filter(R.propEq('isReport', true)))
        .mapS(R.pipe(R.values, R.length, R.equals(1)))
        .orElse(false).join();
    },
    /**
     * Used to get the report target from the list of the params
     */
    getReportTargetParam(params){
      return Maybe.of(params)
        .mapS(R.pipe(R.filter(R.has('isReport')), R.values, R.head()), )
        .join();
    },
    /**
    * Please refer to the logic specified on the class
    * It expect the fn just return true/false, then it will base on the return
    * to construct the return obj add in the path, value, or state if anything
    * needs to change
    * @param processor
    * @param data
    */
    runConditionProcessor: R.curry((processor, data) => {
      const { targetParam, success, failed } = processor;
      if (RA.isNilOrEmpty(targetParam)) throw new Error('Missing Target Param in Condition Processor');
      const isFulFilled = runProcessor(processor)(data);
      const preTargetData = R.pipe(R.prop('dataPath'), R.split('.'), R.path(R.__, data))(targetParam);
      const value = isFulFilled ? (success || preTargetData) : (failed || null);
      const path = targetParam.dataPath;
      const pRslt = ProcessResult({ path, value, isFulFilled});
      return pRslt;
    })
  });

exports.ConditionProcessor = ConditionProcessor;
