const expect = require('chai').expect;

const { DataDef } = require('./utils');
//const { ProcessorTypes } = require('../../src/processor');
const { nestedSchema,
  simpleNestedSchemaWithProcessors,
} = require('./client.dataDefinitions');
//const { Validation, Compute, Condition } = ProcessorTypes;
describe('the DataDef factory', () => {
  describe('validateData', () => {
    it('should return the result of the validation for dataDef build from schema and processors', () => {
      // const input = {
      //   kk: 'asdf',
      //   address: {
      //     addressLine1: '8 Dumas',
      //     other: {
      //       age: 200,
      //     }
      //   },
      // };
      // const def = DataDef({
      //   name: 'test',
      //   ...nestedSchema,
      //   processors: [cond1, cond2, v1, v2, v3]
      // });
      // const result = def.validateData(input);
      // expect(result).to.eql({
      //   data: {
      //     address: {
      //       addressLine1: '8 Dumas',
      //       other: {
      //         age: 200,
      //       }
      //     },
      //     kk: 'asdf',
      //     lastName: 'Zheng',
      //   },
      //   result: {
      //     firstName: {
      //       alert: [
      //         {
      //           message: 'firstName cannot be null',
      //           severity: 'error'
      //         }
      //       ],
      //       path: 'firstName',
      //     },
      //     kk: {
      //       alert: [
      //         {
      //           message: 'should be integer',
      //           severity: 'error'
      //         }
      //       ],
      //       path: 'kk',

      //     },
      //     lastName: {
      //       isFulFilled: true,
      //       path: 'lastName',
      //       state: {
      //         display: true,
      //         readonly: true
      //       },
      //       value: 'Zheng'
      //     },
      //     'address.other.age': {
      //       alert: [
      //         {
      //           message: 'should be <= 120',
      //           severity: 'error'
      //         }
      //       ],
      //       path: 'address.other.age',

      //     },
      //   }
      // });
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
                message: 'must be integer',
                severity: 'error'
              }
            ],
            path: 'kk',
          },
          notFirstName: {
            path: 'notFirstName',
            state: {
              display: false,
              readonly: true
            },
            value: null
          },
          address: {
            alert: [{ message: 'some2 should <= 1', severity: 'error' }],
            path: 'address',

          },
          'address.addressLine2': {
            isFulFilled: true,
            path: 'address.addressLine2',
            state: {
              display: true,
              readonly: true,
            },
            value: 'Zheng'
          },
          'address.postCode': {
            alert: [
              {
                message: 'postCode cannot be 2617',
                severity: 'error'
              },
              {
                message: 'must be number',
                severity: 'error'
              }
            ],
            path: 'address.postCode',

          },
          'other.age': {
            alert: [
              {
                'message': 'must be <= 120',
                'severity': 'error'
              }
            ],
            path: 'other.age',

          },
        }
      });
    });
  });
  describe('constructor', ()=>{
    it('should construct data def and all its descendents correctly', ()=>{
      const def = DataDef({name: 'name', ...nestedSchema});
      expect(def.properties.address.properties.state.enum).to.eqls([
        'ACT', 'NSW', 'NT', 'VIC', 'WA', 'TAS'
      ]);
      //console.log(JSON.stringify(def.properties.address.properties.state));
    });
  });
  describe('validateData', ()=>{
    it('should validate the input properly', ()=>{
      const data = {
        firstName: 'fakeName',
        kk: 'wrong',
        address: {
          state: 'fakeState',
          email: 'wrongEmail',
          other: {
            date: 'FakeDate',
            badGuy: 'Fa',
            age: -1,
            weight: 300
          }
        },
        
      };
      const def = DataDef({name: 'name', ...nestedSchema});
      var result = def.validateData(data);
      const expected = {
        'data': {
          'address': {
            'email': 'wrongEmail',
            'other': {
              'age': -1,
              'badGuy': 'Fa',
              'date': 'FakeDate',
              'weight': 300
            },
            'state': 'fakeState'
          },
          'firstName': 'fakeName',
          'kk': 'wrong'
        },
        'result': {
          'address.email': {
            'alert': [
              {
                'message': 'must match format "email"',
                'severity': 'error'
              }
            ],
            'path': 'address.email'
          },
          'address.other.age': {
            'alert': [
              {
                'message': 'must be >= 0',
                'severity': 'error'
              }
            ],
            'path': 'address.other.age'
          },
          'address.other.badGuy': {
            'alert': [
              {
                'message': 'must be boolean',
                'severity': 'error'
              }
            ],
            'path': 'address.other.badGuy'
          },
          'address.other.weight': {
            'alert': [
              {
                'message': 'must be <= 240',
                'severity': 'error'
              }
            ],
            'path': 'address.other.weight'
          },
          'address.state': {
            'alert': [
              {
                'message': 'must be equal to one of the allowed values',
                'severity': 'error'
              }
            ],
            'path': 'address.state'
          },
          'kk': {
            'alert': [
              {
                'message': 'must be integer',
                'severity': 'error'
              }
            ],
            'path': 'kk'
          }
        }
      };
      expect(result).to.eqls(expected);
    });
  });
});
