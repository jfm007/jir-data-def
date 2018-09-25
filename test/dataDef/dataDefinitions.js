const { ValidationProcessor, ConditionProcessor, ProcessorTypes, ProcessorParamType } = require('../../src/processor');
const { Validation, Condition } = ProcessorTypes;
const { JsFieldTypes, JsFormatOptions } = require('./utils');
const { STRING, NUMBER, BOOLEAN, INTEGER } = JsFieldTypes;
const { EMAIL, DATE } = JsFormatOptions;
const { PARENTDATA } = ProcessorParamType;

const nestedSchema = {
  properties: {
    firstName: {
      type: STRING,
      // pattern: '(?:^[a-z])(?:\w)*(?:[a-z0-9]$)'
    },
    lastName: {
      type: STRING
    },
    kk: {
      type: INTEGER
    },
    address: {
      properties: {
        addressLine1: {
          type: STRING
        },
        addressLine2: {
          type: STRING
        },
        state: {
          enums: ['ACT', 'NSW', 'NT', 'VIC', 'WA', 'TAS']
        },
        email: {
          type: STRING,
          format: EMAIL
        },
        postCode: {
          type: NUMBER
        },
      }
    },
    other: {
      properties: {
        birthday: {
          format: DATE
        },
        badGuy: {
          type: BOOLEAN
        },
        age: {
          type: INTEGER, minimum: 0, maximum: 120
        },
        weight: {
          type: INTEGER, minimum: 0, maximum: 240
        }
      }
    }
  }
};
exports.nestedSchema = nestedSchema;

const singleFieldArrayDef = {
  name: 'simple',
  items: {
    processors: [
      {
        type: Validation,
        params: { line1: 'addressLine1' },
        message: 'addressLine1 cannot be addressLine1',
        fn: (params) => { //paramInfos
          return params.line1 !== 'addressLine1'; // && params.postCode < 1;
        }
      },
      {
        type: Condition,
        params: {
          addressLine2: 'addressLine2',
          state: { dataPath: '.state', isReport: true }
        },
        fn: (params) => { //
          return !params.addressLine2; // && params.postCode < 1;
        }
      },

    ],
    properties: {
      type: { enum: ['Home', 'Post', 'Work'] },
      addressLine1: { type: STRING },
      addressLine2: { type: STRING },
      state: { enums: ['ACT', 'NSW', 'NT', 'VIC', 'WA', 'TAS'] },
      intTest: { type: INTEGER }
    }
  }
};

const clientAdress = {
  items: {
    properties: {
      type: { enum: ['Primary', 'Alter']},
      addresses: singleFieldArrayDef
    }
  }
};

exports.doubleNestedFieldArraySchema = {
  name: 'doubleNestedFieldArray',
  processors: [
    {
      type: Condition,
      params: {
        firstName: 'firstName',
        notFirstName: { dataPath: '.notFirstName', isReport: true }
      },
      fn: (params) => { //paramInfos
        return !params.firstName; // && params.postCode < 1;
      }
    },
  ],

  properties: {
    some: { type: INTEGER },
    firstName: { type: STRING },
    notFirstName: { type: STRING },
    clientAddresses: clientAdress
  }
};

exports.singleFieldArrayDef = singleFieldArrayDef;

const simpleNestedFieldArrayDef = {
  name: 'simpleNestedFieldArrayDef',
  processors: [
    {
      type: Condition,
      params: {
        firstName: 'firstName',
        notFirstName: { dataPath: '.notFirstName', isReport: true }
      },
      fn: (params) => { //paramInfos
        return !params.firstName; // && params.postCode < 1;
      }
    },
    {
      type: Validation,
      params: { lastName: 'lastName' },
      message: 'lastName cannot be lastName',
      fn: (params) => { //paramInfos
        return params.lastName !== 'lastName'; // && params.postCode < 1;
      }
    },
  ],

  properties: {
    some: { type: INTEGER },
    firstName: { type: STRING },
    lastName: { type: STRING },
    kk: { type: INTEGER },
    notFirstName: { type: STRING },
    addresses: singleFieldArrayDef
  }
};

exports.simpleNestedFieldArrayDef = simpleNestedFieldArrayDef;


const basicFieldArrayDef = {
  properties: {
    firstName: { type: STRING },
    lastName: { type: STRING },
    addresses: {
      items: {
        processors: [
          {
            type: Validation,
            params: { line1: 'addressLine1' },
            message: 'addressLine1 cannot be addressLine1',
            fn: (params) => { //paramInfos
              return params.line1 !== 'addressLine1'; // && params.postCode < 1;
            }
          },
          {
            type: Validation,
            paramType: PARENTDATA,
            message: 'Duplicate Address Type detected',
            // fn: (params) => {

            // }
          }
        ],
        properties: {
          type: { enum: ['Home', 'Post', 'Work'] },
          addressLine1: { type: STRING },
          addressLine2: { type: STRING },
          state: { enums: ['ACT', 'NSW', 'NT', 'VIC', 'WA', 'TAS'] }
        }
      }
    },
    diffAddresses: {
      items: [
        {
          name: 'electronical',
          properties: {
            type: { enum: ['email', 'website'] },
            email: { format: EMAIL },
            website: { format: URL }
          }
        },
        {
          name: 'telephone',
          properties: {
            type: { enum: ['work', 'home', 'mobile', 'alter'] },
            number: { type: STRING }
          }
        },
        {
          name: 'geoAddress',
          items: {
            name: 'geoAddr',
            properties: {
              type: { enum: ['res', 'postal'] },
              addressLine1: { type: STRING },
              addressLine2: { type: STRING },
              state: { enums: ['ACT', 'NSW', 'NT', 'VIC', 'WA', 'TAS'] }
            }
          }
        }
      ]
    }
  }
};
exports.basicFieldArrayDef = basicFieldArrayDef;



exports.simpleNestedSchemaWithProcessors = {
  processors: [
    {
      type: Condition,
      params: {
        firstName: 'firstName',
        notFirstName: { dataPath: '.notFirstName', isReport: true }
      },
      fn: (params) => { //paramInfos
        return params.firstName; // && params.postCode < 1;
      }
    },
    {
      type: Validation,
      params: { lastName: 'lastName' },
      message: 'lastName cannot be lastName',
      fn: (params) => { //paramInfos
        return params.lastName !== 'lastName'; // && params.postCode < 1;
      }
    },
    {
      type: Validation,
      params: { some: 'some' },
      message: 'some is bigger than 2000',
      reportToRoot: true,
      fn: (params) => {
        return params.some && params.some < 2000;
      }
    }
  ],

  properties: {
    some: { type: INTEGER },
    firstName: { type: STRING },
    lastName: { type: STRING },
    kk: { type: INTEGER },
    notFirstName: { type: STRING },
    address: {
      processors: [
        {
          type: Condition,
          params: { addressLine1: 'addressLine1', addressLine2: { dataPath: '.addressLine2', isReport: true } },
          success: 'Zheng',
          failed: 'Ji',
          fn: (params) => { //paramInfos
            return params.addressLine1;
          }
        },
        {
          type: Validation,
          params: { postCode: 'postCode' },
          message: 'postCode cannot be 2617',
          fn: (params) => { //paramInfos
            return params.postCode !== '2617'; // && params.postCode < 1;
          }
        },
        {
          type: Validation,
          params: { some: 'some2' },
          message: 'some2 should <= 1',
          reportToRoot: true,
          fn: (params) => {
            return params.some && params.some <= 1;
          }
        }
      ],
      properties: {
        addressLine1: { type: STRING },
        addressLine2: { type: STRING },
        state: { enums: ['ACT', 'NSW', 'NT', 'VIC', 'WA', 'TAS'] },
        email: { type: STRING, format: EMAIL },
        postCode: { type: NUMBER },
        some2: { type: INTEGER }
      }
    },
    other: {
      properties: {
        birthday: { format: DATE },
        badGuy: { type: BOOLEAN },
        age: { type: INTEGER, minimum: 0, maximum: 120 },
        weight: { type: INTEGER, minimum: 0, maximum: 240 }
      }
    }
  }
};
exports.cond1 = ConditionProcessor({
  schema: nestedSchema,
  params: { addressLine1: 'address.addressLine1', weight: { dataPath: '.other.weight', isReport: true } },
  fn: (params) => { //paramInfos
    return params.addressLine1; // && params.postCode < 1;
  }
});
exports.cond2 = new ConditionProcessor({
  schema: nestedSchema,
  params: { postCode: 'address.postCode', lastName: { dataPath: '.lastName', isReport: true } },
  success: 'Zheng',
  failed: 'Ji',
  fn: (params) => { //paramInfos
    return !params.postCode;
  }
});

exports.v1 = ValidationProcessor({
  schema: nestedSchema,
  message: 'firstName cannot be null',
  params: { firstName: 'firstName' },
  fn: (params) => { //paramInfos
    return params.firstName;
  }
});
exports.v2 = ValidationProcessor({
  schema: nestedSchema,
  message: 'length > 10 and length < 20',
  params: { firstName: 'firstName' },
  fn: (params) => { //paramInfos
    if (params.firstName) {
      return params.firstName.length > 10 && params.firstName.length < 20;
    }
    return true;
  }
});
exports.v3 = ValidationProcessor({
  schema: nestedSchema,
  message: 'firstName cannot includes -',
  params: { firstName: 'firstName' },
  fn: (params) => { //paramInfos
    if (params.firstName) {
      return !params.firstName.includes('-');
    }
    return true;
  }
});
