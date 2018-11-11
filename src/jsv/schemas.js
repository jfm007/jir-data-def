//const Maybe = require('../maybe');
const R = require('ramda');

exports.JsKeywords = {
  TYPE: 'type',
  PROPERTIES: 'properties',
  ITEMS: 'items',
  ENUM: 'enum'
};

exports.JsFieldTypes = {
  NUMBER: 'number',
  INTEGER: 'integer',
  STRING: 'string',
  BOOLEAN: 'boolean',
  ARRAY: 'array',
  OBJECT: 'object',
  NULL: 'null',
};

exports.JsFormatOptions = {
  DATE: 'date',
  DATETIME: 'date-time',
  URI: 'uri',
  EMAIL: 'email',
  HOSTNAME: 'hostname',
  IPV4: 'ipv4',
  IPV6: 'ipv6',
  REGEX: 'regex',
};

exports.JsErrorKeywords = {
  DATA_Path: 'dataPath',
  SCHEMA_PATH: 'schemaPath',
  MESSAGE: 'message',
};

exports.JsCustomKeywards = {
  TITLE: 'title',
  Description: 'description'
};

//const getPropsInList = require('../utils').getPropsInList;
const commonProps =
  ['enum', 'const', 'not', 'oneOf', 'anyOf', 'allOf', 'if', 'then', 'else', 'type'];

const valueProps =
  [
    //number related
    'maximum',
    'minimum',
    'exclusiveMaximum',
    'exclusiveMinimum',
    'multipleOf',
    //string specific properties
    'maxLength',
    'minLength',
    'pattern',
    'format',
    //// needs ajv-keywords
    'formatMaximum ',
    'formatMinimum',
    'formatExclusiveMaximum',
    'formatExclusiveMinimum',
  ];

const objTypeProps = [
  'maxProperties',
  'minProperties',
  'required',
  'properties',
  'patternProperties',
  'additionalProperties',
  'propertyNames',
  'patternRequired',
];

const arrayTypeProps = [
  'maxItems',
  'minItems',
  'uniqueItems',
  'items',
  'additionalItems',
  'contains',
];
const allSchemaProps
  = R.pipe(
    R.concat(valueProps),
    R.concat(objTypeProps),
    R.concat(arrayTypeProps)
  )(commonProps);
exports.allSchemaProps = allSchemaProps;

// const getFieldPropsInList = getPropsInList(commonProps);
// /**
//  *   enum: any[]; // value or {display, value}
//   const: any;
//   not: object;
//   oneOf: object;
//   anyOf: object;
//   allOf: object;
//   if: object;
//   then: object;
//   else: object;
//   type = 'string';
//  */
// class SchemaField {

//   constructor(props) {
//     Maybe.of(props)
//       .mapS(getFieldPropsInList)
//       .mapS(props => Object.assign(this, props));
//   }
// }

// exports.SchemaField = SchemaField;





