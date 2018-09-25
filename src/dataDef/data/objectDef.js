const stampit = require('@stamp/it');
const R = require('ramda');
const RA = require('ramda-adjunct');
const { DataDefType } = require('./enums');
const { Maybe, JsFieldTypes, ResultsObj, ProcessorsObj } = require('../utils');
/**
 * not to us by itself, section to define all the field array related functionalities
 */
const ObjectDef = stampit()
  .init(function () {
  })
  .statics({
    /**
     *
     */
    init(objDef) {
      const { properties, path, initDef, required} = objDef;
      const isPropertyRequired = (name) => R.ifElse(RA.isNilOrEmpty, R.always(false), R.contains(name))(required);
      Maybe.of(properties)
        .mapS(properties => {
          objDef.defType = DataDefType.SECTION;

          objDef.properties = R.mapObjIndexed((propDef, name) =>
            initDef({
              ...propDef,
              name,
              isMandatory: isPropertyRequired(name),
              path: path ? `${path}.${name}` : name
            }))(properties);
          objDef.type = JsFieldTypes.OBJECT;
        });
    },
    /**
     * used to run obj def processors
     * @param {*} dataDef
     * @param {*} data
     * @param {*} runInfo
     */
    runAllProcessors: (dataDef) => (input, runInfo) => {
      const { properties } = dataDef;
      const { runAllProcessors } = ProcessorsObj;
      const resultObj = ResultsObj.getResultObj(input);
      return Maybe.of(properties)
        .mapS(R.values)
        .mapS(R.reduce(
          (pre, c) => {
            const rslt = c.runAllProcessors(pre, runInfo);
            return rslt;
          },
          resultObj))
        .orElse(resultObj)
        .mapS((rslt) => runAllProcessors(dataDef)(rslt, runInfo)).join();
    },
  });

exports.ObjectDef = ObjectDef;
