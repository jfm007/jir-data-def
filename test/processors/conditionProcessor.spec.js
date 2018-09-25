const expect = require('chai').expect;
const {
  ConditionProcessor
} = require('../../src/processor/ConditionProcessor');
const { isOneAndOnlyReport } = ConditionProcessor;
const jsv = require('../../src/jsv');
const { STRING,  NUMBER, INTEGER, OBJECT } = jsv.JsFieldTypes;
//const { EMAIL, DATE } = jsv.FormatOptions;

const flatSchema = {
  type: OBJECT,
  properties: {
    firstName: {
      type: STRING
    },
    lastName: {
      type: STRING
    },
    addressLine1: {
      type: STRING
    },
    addressLine2: {
      type: STRING
    },
    state: {
      enums: ['ACT', 'NSW', 'NT', 'VIC', 'WA', 'TAS']
    },
    postCode: {
      type: NUMBER
    },
    age: {
      type: INTEGER, minimum: 0, maximum: 120
    },
    weight: {
      type: INTEGER, minimum: 0, maximum: 240, title: 'Weight'
    }
  }
};


// const fieldArray = {
//   type: OBJECT,
//   properties: {
//     firstName: {
//       type: STRING
//     },
//     lastName: {
//       type: STRING
//     },
//     address: {
//       type: ARRAY,
//       items: [
//         {
//           type: OBJECT,
//           properties: {
//             addressLine1: {
//               type: STRING
//             },
//             addressLine2: {
//               type: STRING
//             },
//             state: {
//               enums: ['ACT', 'NSW', 'NT', 'VIC', 'WA', 'TAS']
//             },
//           }
//         }
//       ]
//     },
//   }
// };

describe('ConditionProcessor', () => {
  describe('isOneAndOnlyReport', () => {
    it('should report true, if one isReport is set', () => {
      const obj = { p1: { dataPath: '1'}, p2: {}};
      expect(isOneAndOnlyReport({weight: { dataPath: 'weight'}, postCode: { dataPath: 'postCode'}}))
        .to.eql(false);
      expect(isOneAndOnlyReport({ ...obj, p3: {isReport: true}})).to.eql(true);
      expect(isOneAndOnlyReport({ ...obj })).to.eql(false);
      expect(isOneAndOnlyReport({ ...obj, p3: {isReport: true}, p4: {isReport: true}})).to.eql(false);
    });
  });
  describe('constructor', () => {
    it('should create the condition and normalize the information, if everything aligns up', () => {
      const cond1 = ConditionProcessor({
        schema: flatSchema,
        params: { postcode: 'postCode', weight: { dataPath: 'weight', isReport: true}}
      });
      expect(cond1.paramInfos).to.eql({
        postcode: {
          dataPath: '.postCode',
          schemaPath: '.properties.postCode'
        },
        weight: {
          dataPath: '.weight',
          isReport: true,
          schemaPath: '.properties.weight',
          title: 'Weight',
        }
      });
      expect(cond1.targetParam).to.eql({
        dataPath: '.weight',
        isReport: true,
        schemaPath: '.properties.weight',
        title: 'Weight',
      });
    });
    it('should report error, if it is not one and only report', () => {
      //const error = new Error('Condition Processor should have one and only target');
      expect(()=>ConditionProcessor({
        schema: flatSchema,
        params: { postcode: 'postCode', weight: { dataPath: 'weight' }}
      })).to.throw();
      expect(()=>ConditionProcessor({
        schema: flatSchema,
        params: {
          postcode: {dataPath: 'postCode', isReport: true},
          weight: { dataPath: 'weight', isReport: true }
        }
      })).to.throw();
    });
  });
  describe('run', () => {
    it('should run the processor and return the correct state, no success/failed', () => {
      const cond1 = ConditionProcessor({
        schema: flatSchema,
        params: { postCode: 'postCode', weight: { dataPath: '.weight', isReport: true}},
        fn: (params) => { //, paramInfos)
          return !params.postCode;
        }
      });
      const result = cond1.run({});
      expect(result.value).to.eq(undefined);
      expect(result.isFulFilled).to.eq(true);
      // expect(result.state.display).to.eql(true);
      // expect(result.state.readonly).to.eql(false);
      const result2 = cond1.run({postCode: 2617});
      expect(result2.value).to.eql(null);
      expect(result2.isFulFilled).to.eq(undefined);
      // expect(result2.state.display).to.eql(false);
      // expect(result2.state.readonly).to.eql(true);
    });
    it('should run the processor and return the correct state, with success/failed', () => {
      const cond2 = ConditionProcessor({
        schema: flatSchema,
        params: { postCode: 'postCode', lastName: { dataPath: '.lastName', isReport: true}},
        success: 'Zheng',
        failed: 'Ji',
        fn: (params) => { //, paramInfos
          return !params.postCode;
        }
      });
      const result = cond2.run({});
      expect(result.value).to.eql('Zheng');
      // expect(result.state.display).to.eql(true);
      // expect(result.state.readonly).to.eql(true);
      const result2 = cond2.run({postCode: 2617});
      expect(result2.value).to.eql('Ji');
      // expect(result2.state.display).to.eql(true);
      // expect(result2.state.readonly).to.eql(true);
    });
  });
});
