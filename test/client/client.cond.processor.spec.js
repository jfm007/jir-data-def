const expect = require('chai').expect;
const {
  ConditionProcessor
} = require('./utils');
const jsv = require('../../src/jsv');
const { STRING,  NUMBER, INTEGER, OBJECT } = jsv.JsFieldTypes;

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
      enum: ['ACT', 'NSW', 'NT', 'VIC', 'WA', 'TAS']
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


describe('ConditionProcessor', () => {
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
      expect(result[0]).to.eql({
        isFulFilled: true,
        path: 'weight',
        state: {
          display: true,
          readonly: false
        }
      });
      const result2 = cond1.run({postCode: 2617});
      expect(result2[0]).to.eql({
        path: 'weight',
        state: {
          display: false,
          readonly: true
        },
        value: null
      });
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
      expect(result[0].value).to.eq('Zheng');
      expect(result[0]).to.eql({
        isFulFilled: true,
        path: 'lastName',
        state: {
          display: true,
          readonly: true
        },
        value: 'Zheng'
      });

      const result2 = cond2.run({postCode: 2617});
      expect(result2[0].value).to.eq('Ji');
      expect(result2[0]).to.eql({
        path: 'lastName',
        state: {
          display: true,
          readonly: true
        },
        value: 'Ji'
      });
    });
  });
});
