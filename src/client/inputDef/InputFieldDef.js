const stampit = require('@stamp/it');
const uuid = require('uuid');
const R = require('ramda');
const RA = require('ramda-adjunct');
const { UiState } = require('./UiState');
const {
  Maybe,
  PathAndNameObj,
  listOperator,
  startCaseUpper,
  notHasProp,
  hasAllProps,
} = require('../utils');
const {
  JsFieldTypes, JsFormatOptions
} = require('../utils');
const { InputValueFormat, InputFieldDataType } = require('../DefEnums');
const { STRING, NUMBER, BOOLEAN } = InputFieldDataType;
/**
 * enum of the control type
 */
const Control = {
  Input: 'input',
  TextArea: 'textArea',
  Select: 'select',
  Toggle: 'toggle',
  Switch: 'switch',
  CheckBox: 'checkbox',
  Radio: 'radio'
};

exports.InputControlType = Control;

const initList = listOperator.getListToAdd;
/**
 * represent a option with a key and val
 */
const InputOption = stampit()
  .init(function (props) {
    const opt = Maybe.of(props)
      .mapS(R.ifElse(R.is(Object),
        R.pick(['key', 'val']),
        (val) => ({ val }))
      )
      .mapS(R.cond([
        [hasAllProps(R.__, ['key','val']), R.identity],
        [notHasProp(R.__, 'key'), (opt)=>{
          return {...opt, key: opt.val};
        }],
        [notHasProp(R.__, 'val'), (opt)=>({...opt, val: opt.key})]
      ]))
      .orElse({}).join();
    Object.assign(this, opt);
  })
  .statics({
    createOptions(options) {
      return R.pipe(initList, R.map(InputOption), R.reject(RA.isNilOrEmpty))(options);
    }
  });

exports.InputOption = InputOption;

/**
 * the logic related to input with options information
 */
const InputOptionsDef = stampit()
  .init(function ({options = [], multiple = false, control}) {
    const opts = InputOption.createOptions(options);
    if (opts.length > 0
      || control === Control.Select
      || control === Control.Radio) {
      this.multiple = multiple;
      this.options = opts;
      this.control = control || (R.isEmpty(this.options) ? undefined : Control.Select);

      if (this.multiple && this.control == Control.Radio)
        this.control = Control.Select;
    }
  });
/**
 * used to create input boolean def control
 */
const InputBooleanDef = stampit()
  .init(function ({ dataType, control = Control.Toggle }) {
    if (dataType === InputFieldDataType.BOOLEAN) {
      this.dataType = InputFieldDataType.BOOLEAN;
      this.control = control;
    }
  });
/**
 * the definition for the input
 */
const InputFieldDef = stampit(PathAndNameObj, InputOptionsDef, InputBooleanDef, UiState)
  .init(function ({ dataType = 'string', format = InputValueFormat.text, control, label,
    nullable = true, placeholder, description, size = 40 }) {
    this.id = uuid.v4();
    this.dataType = dataType;
    this.format = format;
    this.label = label || startCaseUpper(this.name);
    if(nullable)
      this.nullable = nullable;
    this.placeholder = placeholder || this.label;
    this.description = description;
    this.size = size;
    //if(this.dataType === 'boolean'
    if (!control && !this.control) this.control = Control.Input;
  })
  .statics({
    /**
     * used to interpret the given Json Schema type to input type
     * @param {*} type
     */
    getDataTypeFromSchema({type}){
      if(type === JsFieldTypes.STRING) return STRING;
      if(type === JsFieldTypes.NUMBER || type === JsFieldTypes.INTEGER)
        return NUMBER;
      if(type === JsFieldTypes.BOOLEAN)
        return BOOLEAN;
      if(RA.isNilOrEmpty(type) || R.is(Array, type))
        return STRING;
      throw new Error('Object type property is not suitable for input field');
    },
    /**
     *
     * @param {*} format
     */
    getFormatFromSchema({format, type}){
      const { text, date, DTLocal, email, url, boolean, number } = InputValueFormat;
      if(format === JsFormatOptions.EMAIL)
        return email;
      else if(format === JsFormatOptions.DATE)
        return date;
      else if(format === JsFormatOptions.URI)
        return url;
      else if(format === JsFormatOptions.DATETIME)
        return DTLocal;
      if(type === JsFieldTypes.NUMBER
        || type === JsFieldTypes.INTEGER)
        return number;
      else if(type === JsFieldTypes.BOOLEAN)
        return boolean;
      return text;
    },
    /**
     * used to create Input Field def from schema
     * @param {*} schema
     */
    createFromSchema(schema){
      return Maybe.of(schema)
        .mapS(schema=>{
          const { name, description } = schema;
          const { getDataTypeFromSchema, getFormatFromSchema } = InputFieldDef;
          return InputFieldDef({
            name,
            dataType: getDataTypeFromSchema(schema),
            format: getFormatFromSchema(schema),
            options: schema.enums,
            description
          });
        })
        .orElse(null).join();
    },
    /**
     *
     * @param {*} fieldDef (the dataDef )
     * @param {*} uiConfig
     */
    createInputFieldDef(fieldDef, uiConfig){
      return Maybe.of(fieldDef)
        .mapS(InputFieldDef.createFromSchema)
        .mapS(R.ifElse(
          ()=>RA.isNilOrEmpty(uiConfig),
          R.identity,
          R.merge(R.__, uiConfig)
        ))
        .orElse(uiConfig).join();
    }
  });

exports.InputFieldDef = InputFieldDef;
