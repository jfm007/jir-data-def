const R = require('ramda');
const RA = require('ramda-adjunct');
const Maybe = require('../maybe');
const jsv = require('./jsv');
const { isNotEmptyOrNull, isPathWithStartingDot } = require('../utils');
const { JsKeywords, JsErrorKeywords, JsCustomKeywards } = require('./schemas');
const { PROPERTIES } = JsKeywords;
const { SCHEMA_PATH, DATA_Path } = JsErrorKeywords;
const { TITLE } = JsCustomKeywards;

/**
 *
 * @param schema
 * @param validators
 * @param val
 * @param isForceValidators
 */
exports.validateAgainstSchema = R.curry((schema, value) => {
  return Maybe.of(value)
    .mapS((val) => {
      // If schema presents then validate the schema
      return Maybe.of(schema)
        .mapS((jSchema) => {
          //const v = val;
          const v_val = Maybe.of(jSchema.type)
            .map((type) => type === 'integer' || type === 'number' ? Number(val) : val)
            .orElse(val).join();
          if (jsv.validate(jSchema, v_val)) { return []; }
          return jsv.getErrors().map(err => err.message);
        })
        .orElse([]).join();
    })
    // filter out empty errors
    .mapS((errors) => errors.filter(isNotEmptyOrNull))
    .orElse([]).join();
});

/**
 * create schema path from data path
 * @param {*} dataPath
 */
const createSchemaPathFromDataPath = (dataPath) => {
  return Maybe.of(dataPath)
    .map(R.ifElse(isPathWithStartingDot, R.identity, R.concat('.')))
    .mapS(R.ifElse(R.contains(`${PROPERTIES}.`), R.empty, R.identity))
    .mapS(R.replace(/\./g, `.${PROPERTIES}.`))
    .orElse(dataPath)
    .map(R.ifElse(isPathWithStartingDot, R.identity, R.concat('.'))).join();
};

exports.createSchemaPathFromDataPath = createSchemaPathFromDataPath;

/**
 * create data path from schema path
 * @param schemaPath
 */
const createDataPathFromSchemaPath = (schemaPath) => {
  return Maybe.of(schemaPath)
    .map(R.ifElse(isPathWithStartingDot, R.identity, R.concat('.')))
    .map(R.ifElse(R.contains(`${PROPERTIES}.`), R.identity, R.always(null)))
    .map(R.replace(/properties\./g, ''))
    .orElse(schemaPath)
    .map(R.ifElse(isPathWithStartingDot, R.identity, R.concat('.')))
    .join();
};
exports.createDataPathFromSchemaPath = createDataPathFromSchemaPath;

/**
 * used to normalize title for the param
 * @param schema
 * @param param
 */
const normalizeTitleForParam = R.curry((schema, param) => {
  const getTitleFromSchema
    = R.pipe(R.split('.'), R.reject(RA.isNilOrEmpty), R.append(TITLE), R.path(R.__, schema));
  const setUpTitle = (pa) => {
    return Maybe.of(pa)
      .map(R.path([SCHEMA_PATH]))
      .mapS(getTitleFromSchema)
      .mapS(R.assoc(TITLE, R.__, pa))
      .orElse(pa)
      .join();
  };
  return R.ifElse(R.has(TITLE), R.identity, setUpTitle)(param);
});
exports.normalizeTitleForParam = normalizeTitleForParam;

const areBothSchemaDataPathExists = R.either(R.has(SCHEMA_PATH), R.has(DATA_Path));
exports.areBothSchemaDataPathExists = areBothSchemaDataPathExists;
/**
 * used to normalize the param
 * expect the param
 * @param schema - the json schema
 * @param param the param is either
 *   an object of { .dataPath, .schemaPath, title and ...other}
 * or
 *   a string represent the path
 */
exports.normalizeParam = R.curry((schema, param) => {

  const noNeedToSetUpPath = R.both(R.has(SCHEMA_PATH), R.has(DATA_Path));
  const convertStringParamToObj = (path) => {
    return {
      dataPath: createDataPathFromSchemaPath(path),
      schemaPath: createSchemaPathFromDataPath(path)
    };
  };
  return Maybe.of(param)
    .map(R.ifElse(R.is(String), convertStringParamToObj, R.identity))
    .map(paramObj => {
      return Maybe.of(paramObj)
        .mapS(R.ifElse(noNeedToSetUpPath, R.empty, R.identity))
        .mapS(R.ifElse(areBothSchemaDataPathExists, R.identity, R.empty))
        .mapS((pa) => {
          const { schemaPath, dataPath } = pa;
          if (RA.isNilOrEmpty(schemaPath)) {
            return {
              ...pa,
              dataPath: createDataPathFromSchemaPath(dataPath),
              schemaPath: createSchemaPathFromDataPath(dataPath)
            };
          }
          return {
            ...pa,
            schemaPath: createSchemaPathFromDataPath(schemaPath),
            dataPath: createDataPathFromSchemaPath(schemaPath)
          };
        })
        .orElse(paramObj)
        .mapS(normalizeTitleForParam(schema))
        .orElse(paramObj).join();
    });
});

/**
 * used to get value from data for params
 */
exports.getParamValueFromData = R.curry((data, params) => {
  const getValueForParam = (param) => {
    return Maybe.of(param)
      .mapS(R.prop(DATA_Path))
      .mapS(R.pipe(R.split('.'), R.reject(RA.isNilOrEmpty)))
      .mapS(R.path(R.__, data))
      .join();
  };
  return Maybe.of(params)
    .mapS(R.map(getValueForParam));
});
