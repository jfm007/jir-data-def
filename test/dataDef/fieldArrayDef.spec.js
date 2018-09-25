const expect = require('chai').expect;
const {
  FieldArrayDef,
  DataDef,
  DataDefType
} = require('../../src/dataDef');
const {
  singleFieldArrayDef,
  simpleNestedFieldArrayDef, doubleNestedFieldArraySchema
} = require('./dataDefinitions');

const { findDefForItem } = FieldArrayDef;

describe('the FieldArray related functionality', () => {
  describe('findDefForItem', () => {
    it('should give the obj if the items is an obj/give the only item in list if the itemDefs is size one array', () => {
      expect(findDefForItem({ k: 1, r: 2 }, {})).to.eql({ k: 1, r: 2 });
      expect(findDefForItem([{ k: 1, r: 2 }], {})).to.eql({ k: 1, r: 2 });
    });
    it('should find the def if the items is array >= 2', () => {
      const itemDefs = [
        { name: '1', k: 1, r: 2 },
        { name: '2', k: 2, r: 3 },
        { name: 3, k: 2, r: 3 }
      ];
      expect(findDefForItem(itemDefs, {})).to.eq(undefined);
      expect(findDefForItem(itemDefs, { typeId: '1' })).to.eql({ name: '1', k: 1, r: 2 });
      expect(findDefForItem(itemDefs, { typeId: 3 })).to.eql({ name: 3, k: 2, r: 3 });
      expect(findDefForItem(itemDefs, { typeId: '4' })).to.eql(undefined);
    });
  });
  describe('runFieldArrayDefProcessors', () => {
    it('should process simple single field array for correct input and return result - to add more scenario',
      () => {
        const faDef = DataDef(singleFieldArrayDef);
        expect(faDef.isFieldArray()).to.eq(true);
        expect(faDef.items.length).to.eq(1);
        const result = faDef.validateData([
          { type: 'Post', addressLine1: 'addressLine1' },
          { type: 'Home', intTest: '1' },
          { type: 'Post', addressLine1: 'addressLine1' },
          { type: 'BadType', addressLine2: 's', state: 'ACT' }
        ]);
        expect(result).to.eql({
          data: [
            { type: 'Post', addressLine1: 'addressLine1' },
            { type: 'Home', intTest: '1' },
            { type: 'Post', addressLine1: 'addressLine1' },
            { type: 'BadType', addressLine2: 's' }
          ],
          result: {
            '0.addressLine1': {
              alert: [{
                message: 'addressLine1 cannot be addressLine1',
                severity: 'error'
              }],
              path: '0.addressLine1',

            },
            '0.state': {
              path: '0.state',
              isFulFilled: true
            },
            '1.intTest': {
              alert: [
                { message: 'should be integer', severity: 'error' }
              ],
              path: '1.intTest',

            },
            '1.state': {
              path: '1.state',
              isFulFilled: true
            },
            '2.addressLine1': {
              alert: [
                { message: 'addressLine1 cannot be addressLine1', severity: 'error' },
              ],
              path: '2.addressLine1',

            },
            '2.state': {
              path: '2.state',
              isFulFilled: true
            },
            '3.state': {
              path: '3.state',
              value: null
            },
            '3.type': {
              alert: [
                {
                  message: 'should be equal to one of the allowed values',
                  severity: 'error'
                }
              ],
              path: '3.type',

            },
          }
        });
      });
    it('should work for simple nested field array', () => {
      const faDef = DataDef(simpleNestedFieldArrayDef);
      expect(faDef.defType).to.eq(DataDefType.SECTION);
      expect(faDef.properties.addresses.isFieldArray()).to.eq(true);
      const input = {
        some: 4000,
        lastName: 'lastName',
        firstName: 'first',
        notFirstName: 'some',
        addresses: [
          { type: 'Post', addressLine1: 'addressLine1' },
          { type: 'Home', intTest: '1' },
          { type: 'Post', addressLine1: 'addressLine1' },
          { type: 'BadType', addressLine2: 'sfa', state: 'ACT' }
        ]
      };
      const result1 = faDef.validateData(input);
      expect(result1).to.eql({
        data: {
          some: 4000,
          lastName: 'lastName',
          firstName: 'first',
          // notFirstName: 'some',
          addresses: [
            { type: 'Post', addressLine1: 'addressLine1' },
            { type: 'Home', intTest: '1' },
            { type: 'Post', addressLine1: 'addressLine1' },
            { type: 'BadType', addressLine2: 'sfa' }
          ]
        },
        result: {
          'addresses.0.addressLine1': {
            alert: [{
              message: 'addressLine1 cannot be addressLine1',
              severity: 'error'
            }],
            path: 'addresses.0.addressLine1',

          },
          'addresses.0.state': {
            path: 'addresses.0.state',
            isFulFilled: true
            //state: { display: true, readonly: false }
          },
          'addresses.1.state': {
            path: 'addresses.1.state',
            isFulFilled: true
            //state: { display: true, readonly: false }
          },
          'addresses.2.state': {
            path: 'addresses.2.state',
            isFulFilled: true
            //state: { display: true, readonly: false }
          },
          'addresses.3.state': {
            path: 'addresses.3.state',
            //state: { display: false, readonly: true },
            value: null
          },
          'addresses.1.intTest': {
            alert: [
              { message: 'should be integer', severity: 'error' }
            ],
            path: 'addresses.1.intTest',

          },
          'addresses.2.addressLine1': {
            alert: [
              { message: 'addressLine1 cannot be addressLine1', severity: 'error' },
            ],
            path: 'addresses.2.addressLine1',

          },
          'addresses.3.type': {
            alert: [
              {
                message: 'should be equal to one of the allowed values',
                severity: 'error'
              }
            ],
            path: 'addresses.3.type',

          },
          lastName: {
            alert: [{ severity: 'error', message: 'lastName cannot be lastName' }],
            path: 'lastName',

          },
          notFirstName: {
            path: 'notFirstName',
            //state: { display: false, readonly: true },
            value: null
          }
        }
      });
    });
    it('should work for nested double embeded field array', ()=>{
      const faDef = DataDef(doubleNestedFieldArraySchema);
      const input = {
        some: 1,
        clientAddresses: [
          { type: 'wrong' },
          {
            type: 'Primary',
            addresses: [{
              type: 'wrong',
              addressLine1: 'addressLine1'
            }]
          }
        ]
      };
      const rslt = faDef.validateData(input);
      expect(rslt).to.eql({
        data: {
          some: 1,
          clientAddresses: [
            { type: 'wrong' },
            {
              type: 'Primary',
              addresses: [{
                type: 'wrong',
                addressLine1: 'addressLine1'
              }]
            }
          ]
        },
        result: {
          'clientAddresses.0.type':{
            alert: [
              {
                message: 'should be equal to one of the allowed values',
                severity: 'error'
              }
            ],
            path: 'clientAddresses.0.type'
          },
          'clientAddresses.1.addresses.0.addressLine1':{
            alert: [{
              message: 'addressLine1 cannot be addressLine1',
              severity: 'error'
            }],
            path: 'clientAddresses.1.addresses.0.addressLine1'
          },
          'clientAddresses.1.addresses.0.state':{
            isFulFilled: true,
            path:'clientAddresses.1.addresses.0.state'
          },
          'clientAddresses.1.addresses.0.type':{
            alert: [{
              message: 'should be equal to one of the allowed values',
              severity: 'error',
            }],
            path: 'clientAddresses.1.addresses.0.type'
          },
          notFirstName: {
            isFulFilled: true,
            path: 'notFirstName'
          }
        },
      });
    });
  });
});
