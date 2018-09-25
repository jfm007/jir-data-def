const R = require('ramda');
const RA = require('ramda-adjunct');
const Maybe = require('../maybe');
const Stamp = require('@stamp/it');
const { ResultsObj } = require('../composables');
const { ProcessorTypes, Processor } = require('./Processor');
const { ComputationProcessor } = require('./ComputationProcessor');
const { ConditionProcessor } = require('./ConditionProcessor');
const { ValidationProcessor } = require('./ValidationProcessor');
const { Validation, Compute, Condition } = ProcessorTypes;
const { prefixParentPathToRunResults } = ResultsObj;

/**
 * factory to create obj with property : processors
 */
const ProcessorsObj = Stamp({
  init({ processors = null, path = null }) {
    this.processors = processors ? sortProcessors(processors) : [];
    this.path = path;
    this.runAllProcessors = ProcessorsObj.runAllProcessors(this);
  }
})
  .methods({
    getProcessors(type) {
      return Maybe.of(type)
        .mapS((type) => R.filter(R.propEq('type', type), this.processors))
        .orElse(this.processors).join();
    },
    addProcessor(processor) {
      const { processors } = this;
      Maybe.of(processor)
        .mapS(R.ifElse(R.is(Array), R.identity, R.of))
        .mapS(R.pipe(R.concat(processors), sortProcessors))
        .mapS((newProcessors) => this.processors = newProcessors);
      return this;
    }
  })
  .statics({
    /**
     * used to create processor from processor config
     * @param {*} processorConfig
     */
    createProcessor(processorConfig) {
      const typeEq = R.propEq('type');
      return Maybe.of(processorConfig)
        .mapS(R.cond([
          [typeEq(Validation), ValidationProcessor],
          [typeEq(Compute), ComputationProcessor],
          [typeEq(Condition), ConditionProcessor],
          [R.T, Processor]
        ]))
        .orElse(null).join();
    },

    /**
     * used to process the give data with the processors it has
     * @param prcObj as an instance of ProcessorsObj
     * @param input either the raw data to be validate
     * or and results obj with {data, results}, it will check whether the .data exists on input,
     * if yes, then it is resultsObj, not then it is raw data
     */
    runAllProcessors: (prcObj) => {
      return (input, runInfo) => {
        const { processors } = prcObj;
        const { data, result } = ResultsObj(input);
        return ProcessorsObj.runProcessors(processors)(data, null, result, runInfo);
      };
    },
    /**
    * used
    * @param {*} type
    */
    getProcessorByType: (type) => {
      const filterForSingleType = R.filter(R.propEq('type', type));
      const filterForTypeList = R.filter(R.where({ type: R.contains(R.__, type) }));
      return R.ifElse(RA.isNilOrEmpty,
        R.always([]),
        R.cond([
          [() => R.is(Array, type), filterForTypeList],
          [() => R.is(String, type), filterForSingleType],
          [() => RA.isNilOrEmpty(type), R.identity],
          [R.T, R.always([])]
        ])
      );
    },
    /**
     * sort the processors see the sortProcessors method for detail
     */
    sortProcessors: sortProcessors,
    /**
    *
    * @param processors - a string of {} or the shape of the processors,
    * expected them are all being normalized and contains all the information
    * @param parentData only available for
    * @param idx
    */
    runProcessors: (processors) => {
      return (data, path, acc, runInfo) => {
        //const { parentData, idx, rootData } = faRunInfo;
        const runAndAccumResult = accProcessorRunResult(runInfo);
        return Maybe.of(processors)
          .mapS(R.ifElse(R.is(Array), R.identity, R.of))
          .mapS(R.reduce(runAndAccumResult, { data, result: acc ? acc : {} }))
          .mapS(prefixParentPathToRunResults(path))
          .orElse({ data, result: acc })
          .join();
      };
    }
  });

exports.ProcessorsObj = ProcessorsObj;
/**
 * used to sort the processors,
 * validation processor is the last to run,
 * compute processor should be the first to run, unless it dependes on certain condition processor
 * condition processor is the sec to run
 * @param {*} processors
 */
function sortProcessors(processors) {
  return Maybe.of(processors)
    .mapS(processors => {
      const validationProcessors = ProcessorsObj.getProcessorByType(Validation)(processors);
      const compProcessors = ProcessorsObj.getProcessorByType(Compute)(processors);
      const condProcessors = ProcessorsObj.getProcessorByType(Condition)(processors);
      return R.unnest([compProcessors, condProcessors, validationProcessors]);
    })
    .orElse([]).join();
}
/**
 *
 * @param processor
 */
const runIndProcessor = (processor) => {
  return R.curry((data, runInfo) => {
    try {
      let results;
      if (processor.type === 'condition') {
        results = processor.run(data, runInfo);
      } else if (processor.type === 'validation') {
        results = processor.run(data, runInfo);
      } else if (processor.type === 'compute') {
        results = processor.run(data, runInfo);
      }
      return Maybe.of(results)
        .mapS(R.ifElse(R.is(Array), R.identity, R.of))
        .orElse([])
        .join();
    }
    catch (err){
      throw new Error(`${processor.path}:${err.message}`);
    }

  });
  // return R.ifElse(R.is(Array), R.identity, R.of)(results);
};

/**
 *
 * @param acc - the accumlation of the result pass in
 * @param processor - the processor to run
 * @returns an object in shape of {
 *   data: the updated data to pass on
 *   result: the accumulated obj of all the returned result,
 *   the value for each of the properties is the shape of the return result for each processor run,
 *   which is { path, value, state : {errors, display, readonly}}
 *   value, display, readonly: new result overwritten existing value
 *   errors: concat of old and new, unless the exactly same data already existed
 * }
 */
const accProcessorRunResult = (runInfo) => {
  return (acc, processor) => {
    /**
     * Run a processor against the input acc and merge the result to it.
    */
    const runProcessorAndAccResult = (prcr) => {
      const { data } = acc;
      const runCurrentProcessor = runIndProcessor(prcr);
      const { updateResult } = ResultsObj;
      return Maybe.of(data)
        .map(runCurrentProcessor(R.__, runInfo))
        .map(R.ifElse(R.is(Array), R.identity, R.of))
        .map(R.reduce(updateResult, acc))
        .orElse(acc);
    };
    return Maybe.of(processor)
      .chainS(runProcessorAndAccResult)
      .orElse(acc).join();
  };
};
