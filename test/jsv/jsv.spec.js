const expect = require('chai').expect;

const { jsv } = require('./jsv');

describe('jsv', () => {
  const numberSchema = { type: 'number' };
  const stringSchema = { type: ['string', 'null'] };
  const simpleObjSchema = {
    properties: {
      smaller: {
        type: 'number',
        enum: [2, 4, 6],
        maximum: { $data: '1/larger' }
      },
      larger: { type: 'number' },
      else: { type: 'string' }
    }
  };
  const { validate, processResults } = jsv;
  describe('validate', () => {
    it('should validate schema', () => {
      expect(validate(numberSchema, 1)).to.eq(true);
      expect(validate(numberSchema, 1.5)).to.eq(true);
      expect(validate(simpleObjSchema, { smaller: 2, larger: 6 })).to.eq(true);
      expect(validate(simpleObjSchema, { smaller: 7, larger: 6 })).to.eq(false);
    });
  });
  describe('processResult', () => {
    it('should return the error in an array of process result', () => {
      expect(validate(numberSchema, 'sdf')).to.eq(false);
      expect(validate(stringSchema, undefined)).to.eq(false);
      expect(processResults()).to.eql([{
        alert: [{ message: 'should be number', severity: 'error' }],
        path: '.',

      }]);
      validate(simpleObjSchema, { smaller: 7, larger: 6, else: 1 });
      expect(processResults()).to.eql([
        {
          alert: [{ message: 'should be <= 6', severity: 'error' }],
          path: 'smaller',
        },
        {
          alert:[
            {
              message: 'should be equal to one of the allowed values',
              severity: 'error'
            }
          ],
          path: 'smaller'
        },
        {
          alert: [{ message: 'should be string', severity: 'error' }],
          path: 'else',
        },
      ]);
    });
  });
});
