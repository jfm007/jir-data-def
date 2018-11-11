const Stampit = require('@stamp/it');
const R = require('ramda');
const RA = require('ramda-adjunct');
const {
  Maybe,
} = require('../utils');

const isNotNilorEmpty = R.pipe(RA.isNilOrEmpty, R.not);
const { Def } = require('./def');
const { FieldArrayDef } = require('./fieldArrayDef');
const { ObjectDef } = require('./objectDef');

/**
 * Factory to create obj for DataDef
 */
const DataDef = Stampit(Def)
  // uiConfig = null,
  .init(function ({ isFieldArrayItemDef = false }) {
    this.isFieldArrayItemDef = isFieldArrayItemDef;
    this.runAllProcessors = DataDef.runAllProcessors(this);
    ObjectDef.init(this);
    FieldArrayDef.init(this);
  })
  .methods({
    initDef(props) {
      return DataDef(props);
    }
  })
  .statics({
    /**
     *
     * @param {*} dataDef
     * @param {*} pName
     * @param {*} def
     */
    addProperty: R.curry((dataDef, pName, defToAdd) => {
      if (R.all(isNotNilorEmpty, [dataDef, pName])) {
        return Maybe.of(defToAdd)
          .mapS(R.assoc('name', pName))
          .orElse({ name: pName })
          .chainS(def => {
            return Maybe.of(dataDef.properties)
              .mapS(R.prop(pName))
              .mapS(R.merge(R.__, def))
              .orElse(def)
              .mapS(R.pipe(
                R.assocPath(['properties', pName], R.__, {}),
                R.merge({ type: 'object', defType: 'section' })
              ))
              .mapS();
          })
          .join();
      }
      return dataDef;
    }),

    /**
     * used to run all the data def processors include the descendents's ones
     * @param {*} dataDef
     * @param {*} data
     * @param {*} types - to be done, to indicate, what type of processor to run
     */
    runAllProcessors(dataDef) {
      return (input, runInfo) => {
        if (dataDef.isFieldArray()) {
          return FieldArrayDef.runAllProcessors(dataDef)(input, runInfo);
        }
        else {
          return ObjectDef.runAllProcessors(dataDef)(input, runInfo);
        }
      };
    }
  });
exports.DataDef = DataDef;
