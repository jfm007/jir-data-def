const stampit = require('@stamp/it');
const R = require('ramda');
const RA = require('ramda-adjunct');
const {
  PathAndNameObj,
  ProcessorsObj,
  JsonSchema,
  Maybe,
  getParentPath,
  ResultsObj,
  RunInfo
} = require('../utils');
//const { createProcessor } = ProcessorsObj;
const { DataDefType } = require('./enums');
const isNotNilorEmpty = R.pipe(RA.isNilOrEmpty, R.not);
/**
 * basic factory for the def
 */
const Def = stampit(JsonSchema, ProcessorsObj, PathAndNameObj)
  .init(function ({ defType = DataDefType.FIELD, isFieldArrayItemDef = false }) {
    this.defType = defType;
    this.validateData = Def.validateData(this);
    if (isFieldArrayItemDef) this.isFieldArrayItemDef = isFieldArrayItemDef;
    //const { processors } = this;
    const schema = this;
    Maybe.of(this.processors)
      .mapS(
        R.map(R.merge(R.__, {
          schema,
          path: this.path,
          parentPath: getParentPath(this.path),
          isFieldArray: this.isFieldArray()
        }))
      )
      .mapS(R.map(this.createProcessor))
      .mapS((processors) => this.processors = processors);
  })
  .methods({
    initDef(props) {
      return Def(props);
    },
    isFieldArray() {
      return Def.isFieldArray(this);
    },
    createProcessor(processorConfig){
      return ProcessorsObj.createProcessor(processorConfig);
    }
  })
  .statics({
    /**
     * used to check whether is a fa
     * @param {*} objDef
     */
    isFieldArray(objDef) {
      return Maybe.of(objDef)
        .mapS(R.prop('items'))
        .mapS(R.ifElse(R.is(Array), R.identity, R.of))
        .mapS(R.all(
          R.either(
            R.propSatisfies(isNotNilorEmpty, 'properties'),
            R.all(Def.isFieldArray)
          )
        ))
        .orElse(false).join();
    },
    /**
     * currently when the validate data is called, it will run all the processors of the all
     * the included properties (nested), but will only run the schema on the top level,
     * because the top level has the schema definition for all,
     * subject to change if new requirements appears
     * @param def: the data definition of
     * @param data: the data to validate
     */
    validateData: (def) => (data, runInfo) => {
      const { jsvValidate } = def;
      const { updateResult } = ResultsObj;
      const { runAllProcessors } = def;
      const info = runInfo || RunInfo({ data });
      const results = runAllProcessors(data, info);
      const validateResults = jsvValidate(results.data);
      return Maybe.of(validateResults)
        .mapS(R.reduce(updateResult, results))
        .orElse(results).join();
    },
  });

exports.Def = Def;

