const expect = require('chai').expect;
const R = require('ramda');
const { DataDef } = require('../../src/dataDef');
const { ProcessorTypes } = require('../../src/processor');
const { Validation, Compute, Condition } = ProcessorTypes;
const { nestedSchema,
  v1, v2, v3, cond1, cond2,
  simpleNestedSchemaWithProcessors,
  basicFieldArrayDef
} = require('./dataDefinitions');
describe('the DataDef factory', () => {
  const processors = [
    { name: 1, type: Validation, message: 's' },
    { name: 2, type: Compute },
    { name: 3, type: Validation, message: 's' },
    {
      name: 4, type: Condition,
      params: { lastName: { dataPath: '.lastName', isReport: true } }
    },
    {
      name: 5, type: Condition,
      params: { lastName: { dataPath: '.lastName', isReport: true } }
    },
    { name: 6, type: Compute },
    { name: 7, type: Validation, message: 's' },
    { name: 8, type: Compute },
  ];
  describe('constructor', () => {
    it('should have all the behaviors default [] to processor', () => {
      expect(() => DataDef()).to.throw();
      expect(() => DataDef({ path: '.' })).to.throws();
      expect(DataDef({ path: 'path' }).name).to.eql('path');
      expect(DataDef({ name: 'name' }).processors).to.eql([]);
      const obj1 = DataDef({ name: 'name', processors });
      expect(obj1.path).to.eq(null);
      expect(DataDef({ path: 'kk', items: { name: 'a', properties: { a: { type: 'string' } } } }).isFieldArray())
        .to.eq(true);
      expect(DataDef({ path: 'kk', items: [{ name: 'a', properties: { a: { type: 'string' } } }] }).isFieldArray())
        .to.eq(true);
      expect(R.map(R.prop('name'), obj1.processors)).to.eql([2, 6, 8, 4, 5, 1, 3, 7]);
    });
    it('should construct field array object sucessfully', () => {
      const defProps = { ...basicFieldArrayDef, name: 'def' };
      const def = DataDef(defProps);
      expect(def.name).to.eql('def');
      const { diffAddresses, addresses } = def.properties;
      expect(addresses.isFieldArray()).to.eq(true);
      expect(addresses.items[0].name).to.eq('addresses');
      expect(diffAddresses.isFieldArray()).to.eq(true);
      expect(R.map((item) => item.name, diffAddresses.items))
        .to.eql([
          'electronical',
          'telephone',
          'geoAddress'
        ]);
      const geoAddress = diffAddresses.items[2];
      expect(geoAddress.isFieldArray()).to.eq(true);//
      expect(geoAddress.items[0].name).to.eq('geoAddr');
      expect(geoAddress.items.length).to.eq(1);
    });
  });
  describe('validateData', () => {
    it('should return the result of the validation for dataDef build from schema and processors', () => {
      const input = {
        kk: 'asdf',
        address: {
          addressLine1: '8 Dumas'
        },
        other: {
          weight: 180,
          age: 200,
        }
      };
      const def = DataDef({
        name: 'test',
        ...nestedSchema,
        processors: [cond1, cond2, v1, v2, v3]
      });
      const result = def.validateData(input);
      expect(result).to.eql({
        data: {
          address: {
            addressLine1: '8 Dumas'
          },
          kk: 'asdf',
          lastName: 'Zheng',
          other: {
            age: 200,
            weight: 180
          }
        },
        result: {
          firstName: {
            alert: [
              {
                message: 'firstName cannot be null',
                severity: 'error'
              }
            ],
            path: 'firstName',
          },
          kk: {
            alert: [
              {
                message: 'should be integer',
                severity: 'error'
              }
            ],
            path: 'kk',

          },
          lastName: {
            isFulFilled: true,
            path: 'lastName',
            // state: {
            //   display: true,
            //   readonly: true
            // },
            value: 'Zheng'
          },
          'other.age': {
            alert: [
              {
                message: 'should be <= 120',
                severity: 'error'
              }
            ],
            path: 'other.age',

          },
          'other.weight': {
            isFulFilled: true,
            path: 'other.weight',
            // state: {
            //   display: true,
            //   readonly: false
            // }
          }
        }
      });
    });
    it('should return the result of the validation for dataDef build from full def', () => {
      const input = {
        kk: 'asdf',
        notFirstName: 'notFirst',
        lastName: 'lastName',
        some: 2001,
        address: {
          addressLine1: '8 Dumas',
          postCode: '2617',
          some2: 2
        },
        other: {
          weight: 180,
          age: 200,
        }
      };
      const def = DataDef({
        name: 'test',
        ...simpleNestedSchemaWithProcessors
      });
      const rslt = def.validateData(input);
      expect(rslt).to.eql({
        data: {
          kk: 'asdf',
          lastName: 'lastName',
          some: 2001,
          address: {
            addressLine1: '8 Dumas',
            addressLine2: 'Zheng',
            postCode: '2617',
            some2: 2
          },
          other: {
            weight: 180,
            age: 200,
          }
        },
        result: {
          '.': {
            alert: [
              {
                message: 'some is bigger than 2000',
                severity: 'error'
              }
            ],
            path: '.',
          },
          lastName: {
            alert: [
              {
                message: 'lastName cannot be lastName',
                severity: 'error'
              }
            ],
            path: 'lastName',

          },
          kk: {
            alert: [
              {
                message: 'should be integer',
                severity: 'error'
              }
            ],
            path: 'kk',

          },
          notFirstName: {
            path: 'notFirstName',
            // state: {
            //   display: false,
            //   readonly: true
            // },
            value: null
          },
          address: {
            alert: [{ message: 'some2 should <= 1', severity: 'error' }],
            path: 'address',

          },
          'address.addressLine2': {
            isFulFilled: true,
            path: 'address.addressLine2',
            // state: {
            //   display: true,
            //   readonly: true,
            // },
            value: 'Zheng'
          },
          'address.postCode': {
            alert: [
              {
                message: 'postCode cannot be 2617',
                severity: 'error'
              },
              {
                message: 'should be number',
                severity: 'error'
              }
            ],
            path: 'address.postCode',

          },
          'other.age': {
            alert: [
              {
                'message': 'should be <= 120',
                'severity': 'error'
              }
            ],
            path: 'other.age',

          },
        }
      });
    });
  });
});

