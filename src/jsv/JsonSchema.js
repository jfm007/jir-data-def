const stampit = require('@stamp/it');
const R = require('ramda');
const RA = require('ramda-adjunct');
const Maybe = require('../maybe');
const { getPropsInList } = require('../utils');
const { allSchemaProps, JsFieldTypes } = require('./schemas');
const getSchemaProps = getPropsInList(allSchemaProps);
const { jsv } = require('./jsv');
const isNotNilOrEmpty = R.pipe(RA.isNilOrEmpty, R.not);
/**
 * factory for JsonSchema object, to be further improved later on
 */
const JsonSchema = stampit({})
  .init(function(props){
    const schema = R.pipe(getSchemaProps, setUpDefaultType)(props);
    Object.assign(this, { ... schema });
    this.jsvValidate = JsonSchema.jsvValidate(this);
  })
  .statics({
    jsvValidate: R.curry((obj, data) => {
      return Maybe.of(obj)
        .mapS((schema) => {
          if (jsv.validate(schema, data)) return [];
          return jsv.processResults();
        })
        .orElse([]).join();
    })
  });
exports.JsonSchema = JsonSchema;
/**
 * used to set up the default type for the given schema
 */
const setUpDefaultType = R.ifElse(
  R.propSatisfies(RA.isNilOrEmpty, 'type'),
  R.cond([
    [R.propSatisfies(isNotNilOrEmpty, 'properties'), R.assoc('type', JsFieldTypes.OBJECT)],
    [R.propSatisfies(isNotNilOrEmpty, 'items'), R.assoc('type', JsFieldTypes.ARRAY)],
    [R.T, R.assoc('type', JsFieldTypes.STRING)]
  ]),
  R.identity
);

