const expect = require('chai').expect;
const {
  ProcessorTypes,
  ProcessorsObj,
  ValidationProcessor,
  ConditionProcessor
} = require('../../src/processor');
const { runProcessors, sortProcessors, getProcessorByType  } = ProcessorsObj;
const { Validation, Compute, Condition } = ProcessorTypes;

describe('the ProcessorsObj factory', ()=>{
  const processors = [
    { name: 1, type: Validation },
    { name: 2, type: Compute },
    { name: 3, type: Validation },
    { name: 4, type: Condition },
    { name: 5, type: Condition },
    { name: 6, type: Compute },
    { name: 7, type: Validation },
    { name: 8, type: Compute },
  ];
  const sortedProcessors = [
    { name: 2, type: Compute },
    { name: 6, type: Compute },
    { name: 8, type: Compute },
    { name: 4, type: Condition },
    { name: 5, type: Condition },
    { name: 1, type: Validation },
    { name: 3, type: Validation },
    { name: 7, type: Validation }
  ];
  describe('create with processor in it', ()=>{
    it('should assign default [] to processor', ()=>{
      expect(ProcessorsObj().processors).to.eql([]);
      expect(ProcessorsObj({ processors: undefined }).processors)
        .to.eql([]);
    });
    it('should sort the processor', ()=>{
      expect(ProcessorsObj({processors}).processors)
        .to.eql(sortedProcessors);
    });
  });
  describe('it can add new processor to it and reordering the processors if required', ()=>{
    it('should add the new processor to it and sort the processors', ()=>{
      const user = ProcessorsObj();
      user.addProcessor({ name: 1, type: Validation });
      expect(user.processors).to.eql([{ name: 1, type: Validation }]);
      user.addProcessor({ name: 2, type: Compute });
      expect(user.processors).to.eql([
        { name: 2, type: Compute },
        { name: 1, type: Validation }
      ]);
      user.addProcessor({ name: 4, type: Condition });
      expect(user.processors).to.eql([
        { name: 2, type: Compute },
        { name: 4, type: Condition },
        { name: 1, type: Validation }
      ]);
      user.addProcessor({ name: 5, type: Compute });
      expect(user.processors).to.eql([
        { name: 2, type: Compute },
        { name: 5, type: Compute },
        { name: 4, type: Condition },
        { name: 1, type: Validation }
      ]);
    });
    it('should have accessor to get the processors by type', ()=>{
      const user = ProcessorsObj({processors});
      //const allProcessors = user.getProcessors();
      expect(user.getProcessors()).to.eql(sortedProcessors);
      expect(user.getProcessors(Compute)).to.eql([
        { name: 2, type: Compute },
        { name: 6, type: Compute },
        { name: 8, type: Compute }
      ]);
      expect(user.getProcessors(Validation)).to.eql([
        { name: 1, type: Validation },
        { name: 3, type: Validation },
        { name: 7, type: Validation }
      ]);
    });
  });
  describe('static methods', ()=>{
    describe('getProcessorsByType', () => {
      it('should return a function to filter the processors according to type', () => {
        const processors = [
          { name: 1, type: Validation },
          { name: 2, type: Compute },
          { name: 3, type: Validation },
          { name: 4, type: Condition },
          { name: 5, type: Condition },
          { name: 6, type: Compute },
          { name: 7, type: Validation },
          { name: 8, type: Compute },
        ];

        const getValidationProcessors = getProcessorByType(Validation);
        const getComputeAndCondition = getProcessorByType([Compute, Condition]);
        expect(getValidationProcessors(processors)).to.eql(
          [
            { name: 1, type: Validation },
            { name: 3, type: Validation },
            { name: 7, type: Validation },
          ]
        );
        expect(getValidationProcessors(null)).to.eql([]);
        expect(getComputeAndCondition(processors)).to.eql([
          { name: 2, type: Compute },
          { name: 4, type: Condition },
          { name: 5, type: Condition },
          { name: 6, type: Compute },
          { name: 8, type: Compute },
        ]);
        expect(getProcessorByType()(processors)).to.eql([
          { name: 1, type: Validation },
          { name: 2, type: Compute },
          { name: 3, type: Validation },
          { name: 4, type: Condition },
          { name: 5, type: Condition },
          { name: 6, type: Compute },
          { name: 7, type: Validation },
          { name: 8, type: Compute },
        ]);
        expect(getProcessorByType('sdaf')(processors)).to.eql([]);
      });
    });
    describe('sortProcessors', ()=>{
      it('should sort the processor according to compute, cond, val for now', ()=>{
        const processors = [
          { name: 1, type: Validation },
          { name: 2, type: Compute },
          { name: 3, type: Validation },
          { name: 4, type: Condition },
          { name: 5, type: Condition },
          { name: 6, type: Compute },
          { name: 7, type: Validation },
          { name: 8, type: Compute },
        ];
        expect(sortProcessors(processors)).to.eql([
          { name: 2, type: Compute },
          { name: 6, type: Compute },
          { name: 8, type: Compute },
          { name: 4, type: Condition },
          { name: 5, type: Condition },
          { name: 1, type: Validation },
          { name: 3, type: Validation },
          { name: 7, type: Validation },
        ]);
      });
    });
    describe('runProcessors', () => {
      const OBJECT = 'object';
      const STRING = 'string';
      const EMAIL = 'email';
      const NUMBER = 'number';
      const DATE = 'date';
      const BOOLEAN = 'boolean';
      const INTEGER = 'integer';
      const nestedSchema = {
        type: OBJECT,
        properties: {
          firstName: {
            type: STRING,
            // pattern: '(?:^[a-z])(?:\w)*(?:[a-z0-9]$)'
          },
          lastName: {
            type: STRING
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
                enum: ['ACT', 'NSW', 'NT', 'VIC', 'WA', 'TAS']
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
              areYouABadGuy: {
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
      const cond1 = ConditionProcessor({
        schema: nestedSchema,
        params: { addressLine1: 'address.addressLine1', weight: { dataPath: '.other.weight', isReport: true } },
        fn: (params) => { //paramInfos
          return params.addressLine1; // && params.postCode < 1;
        }
      });
      const cond2 = new ConditionProcessor({
        schema: nestedSchema,
        params: { postCode: 'address.postCode', lastName: { dataPath: '.lastName', isReport: true } },
        success: 'Zheng',
        failed: 'Ji',
        fn: (params) => { //paramInfos
          return !params.postCode;
        }
      });
      // const cond3 = new ConditionProcessor({
      //   schema: nestedSchema,
      //   params: { firstName: 'firstName', address: { dataPath: '.address', isReport: true } },
      //   fn: (params) => { //paramInfos
      //     return !params.firstName;
      //   }
      // });
      const v1 = ValidationProcessor({
        schema: nestedSchema,
        message: 'firstName cannot be null',
        params: { firstName: 'firstName' },
        fn: (params) => { //paramInfos
          return params.firstName;
        }
      });
      const v2 = ValidationProcessor({
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
      const v3 = ValidationProcessor({
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
      it('should run single processor', () => {
        const input = {
          address: {
            addressLine1: '8 Dumas'
          },
          other: {
            weight: 180
          }
        };
        const result1 = runProcessors(cond1)(input, null, null);
        expect(result1.data.address.addressLine1).to.eql('8 Dumas');
        expect(result1.data.other.weight).to.eql(180);
        expect(result1.result).to.eql(
          {
            'other.weight': {
              path: 'other.weight',
              isFulFilled: true,
              // state: {
              //   display: true,
              //   readonly: false
              // }
            }
          }
        );
        const result2 = runProcessors(cond1)({ other: { weight: 180 } }, null, null);
        expect(result2.data.other.weight).to.eq(undefined);
        // expect(result2.result['other.weight'].state.display).to.eq(false);
        // expect(result2.result['other.weight'].state.readOnly).to.eq(undefined);
      });
      it('should run multiple processor', () => {
        const input = {
          address: {
            addressLine1: '8 Dumas'
          },
          other: {
            weight: 180
          }
        };
        const result1 = runProcessors([cond1, cond2, v1, v2, v3])(input, null, null);//, { test: {value: 'value'}});
        expect(result1.data.lastName).to.eq('Zheng');
        //expect(result1.result.test.value).to.eq('value');
        expect(result1.result.lastName.value).to.eq('Zheng');
        // expect(result1.result.lastName.state.display).to.eq(true);
        // expect(result1.result.lastName.state.readonly).to.eq(true);
        expect(result1.result.firstName.alert[0].message).to.eql('firstName cannot be null');
      });
      it('should prefix parentPath, if the path is given', () => {
        const input = {
          address: {
            addressLine1: '8 Dumas'
          },
          other: {
            weight: 180
          }
        };
        const result1 = runProcessors([cond1, cond2, v1, v2, v3])(input, 'parentPath', null);
        expect(result1.data.parentPath.lastName).to.eq('Zheng');
        expect(result1.result['parentPath.lastName'].value).to.eq('Zheng');
        // expect(result1.result['parentPath.lastName'].state.display).to.eq(true);
        // expect(result1.result['parentPath.lastName'].state.readonly).to.eq(true);
        expect(result1.result['parentPath.firstName'].alert[0].message).to.eql('firstName cannot be null');
        const result2 = runProcessors([cond1, cond2, v1, v2, v3])(input, 'p1.p2', null);
        expect(result2.data.p1.p2.lastName).to.eq('Zheng');
        expect(result2.result['p1.p2.lastName'].value).to.eq('Zheng');
        // expect(result2.result['p1.p2.lastName'].state.display).to.eq(true);
        // expect(result2.result['p1.p2.lastName'].state.readonly).to.eq(true);
        expect(result2.result['p1.p2.firstName'].alert[0].message).to.eql('firstName cannot be null');
      });
    });
  });
});
