const R = require('ramda');
const RA = require('ramda-adjunct');
const stampit = require('@stamp/it');
const Maybe = require('../maybe');
const jsv = require('../jsv');
const jsvUtils = jsv.utils;
const { getEnumObj, getParentPath } = require('../utils');
/**
 * The message type
 */
const ProcessorTypes = getEnumObj({
  Condition: 'condition',
  Compute: 'compute',
  Validation: 'validation',
  OptionRange: 'options'
});

exports.ProcessorTypes = ProcessorTypes;

/**
 * the type of param
 */
const ProcessorParamType = getEnumObj({
  DATA: 'data',
  PARAMS: 'params',
  PARENTDATA: 'parentData',
  ROOTDATA: 'rootData',
  MIXED: 'mixed'
});

exports.ProcessorParamType = ProcessorParamType;

const { PARAMS, PARENTDATA, MIXED, DATA } = ProcessorParamType;

/**
 * Used to create processor
 * current this only process the data against the data within the current context,
 * to be extended to passin parent and root data,
 * also to be extend to accept external service/fn call
 */
const Processor = stampit()
  .init(function ({ schema, params, fn, path, paramType = DATA, ...props }) {
    Maybe.of(params)
      .mapS(R.mapObjIndexed(Processor.getNormalizedParam(schema, path)))
      .mapS((paramInfos) => ({ ...props, fn, path, paramType, paramInfos }))
      .orElse({ ...props, fn, path, paramType })
      .mapS((props) => Object.assign(this, { ...props }));
    if (paramType === DATA && this.paramInfos) {
      this.paramType = PARAMS;
    }
    Maybe.of(this.path)
      .mapS(getParentPath)
      .mapS((parentPath)=>this.parentPath = parentPath);
    //this.parentPath = getParentPath(this.path);
  })
  .methods({

  })
  .statics({
    /**
     * used to set up param from the given param and key
     * @param schema
     * @param param
     * @param key
     */
    getNormalizedParam: R.curry((schema, parentPath, param, key) => {
      const normalizeParamWithGivenSchema = jsv.utils.normalizeParam(schema);
      const getParamJSON = R.ifElse(RA.isNilOrEmpty,
        R.always('empty/null/undefined'),
        R.toString);
      return Maybe.of(param)
        .chainS(normalizeParamWithGivenSchema)
        .mapS(R.ifElse(jsvUtils.areBothSchemaDataPathExists,
          R.identity,
          R.always(null)))
        .chainS(Processor.updateParamWithParentPath(parentPath))
        .orElse(() => {
          throw new Error(`Failed to normalize param ${key}, given param: ${getParamJSON(param)}`);
        }).join();
    }),
    /**
     * used to update param path with parent path
     * @param parentPath
     * @param param
    */
    updateParamWithParentPath: R.curry((parentPath, param) => {
      return Maybe.of(parentPath)
        .mapS(() => {
          const { schemaPath, dataPath } = param;
          const nSchemaPath = jsvUtils.createSchemaPathFromDataPath(parentPath) + schemaPath;
          const nDataPath = jsvUtils.createDataPathFromSchemaPath(parentPath) + dataPath;
          return { ...param, schemaPath: nSchemaPath, dataPath: nDataPath };
        })
        .orElse(param);
    }),
    /**
     * used to get the data to run
     * @param {object} obj the object consist of the following 4 params
     * @param {*} data: the root data
     * @param {*} paramInfos: the information about to load the param value from the root data
     * @param {*} parentPath: path of the parent of the processor,
     * @param {*} paramType: the type of param
     *
     */
    getDataToRun(obj, runInfo) {
      if (!obj) return null;
      const { data, paramInfos, parentPath, paramType, path } = obj;
      //To determine the right root full set data, to be improved.
      const rootData = runInfo && runInfo.data && runInfo.parentArray ? runInfo.data : data;
      const currentData = ()=>Maybe.of(path)
        .mapS(R.split('.')).mapS(R.reject(RA.isNilOrEmpty))
        .mapS(R.path(R.__, data))
        .orElse(null).join();
      const getParamValue = () => jsv.utils.getParamValueFromData(data, paramInfos).join();
      const getParentData = () =>
        R.ifElse(RA.isNilOrEmpty,
          () => obj.data,
          R.pipe(R.split('.'), R.path(R.__, obj.data))
        )(parentPath);
      const getMixModeParams = () => ({
        data: currentData(),
        params: getParamValue(obj),
        parentData: getParentData(obj),
        rootData: rootData
      });
      return R.cond([
        [R.equals(DATA), currentData],
        [R.equals(PARAMS), getParamValue],
        [R.equals(PARENTDATA), getParentData],
        [R.equals(MIXED), getMixModeParams],
        [R.T, () => rootData],
      ])(paramType);
    },
    /**
    * used to run processor
    * it get the current data from the given data and run it use fn
    * @param propcessor
    * @param data
    */
    runProcessor(processor) {
      return (data, runInfo) => {
        const { fn, paramInfos, parentPath, paramType } = processor;
        const dataToRun = Processor
          .getDataToRun({ data, paramInfos, parentPath, paramType});
        return fn(dataToRun, runInfo);
      };
    }
  });

exports.Processor = Processor;



