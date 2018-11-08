const expect = require('chai').expect;
const R = require('ramda');
const { InputOption, InputFieldDef, DataDef } = require('./utils');
const {
  JsFieldTypes
} = require('./utils');
describe('UIFieldDef related functionalities', () => {
  describe('the createInputFieldDef method', () => {
    const { createInputFieldDef } = InputFieldDef;
    it('should create the fieldDef on default if ui is not supplied', () => {
      const defaultObj = {
        control: 'input',
        dataType: 'string',
        description: undefined,
        format: 'text',
        label: 'Name',
        placeholder: 'Name',
        nullable: true
      };
      const fieldDef1 = DataDef({ name: 'name' });
      expect(createInputFieldDef(fieldDef1)).to.include(defaultObj);
    });
  });
  describe('InputOption', () => {
    describe('factory method', () => {
      it('should create InputOption from factory', () => {
        expect(InputOption('sme')).to.eql({ key: 'sme', val: 'sme' });
        expect(InputOption(1)).to.eql({ key: 1, val: 1 });
        expect(InputOption({ val: 'val' })).to.eql({ key: 'val', val: 'val' });
        expect(InputOption({ key: 'val' })).to.eql({ key: 'val', val: 'val' });
      });
    });
    describe('createOptions', () => {
      it('should convert the input to options array', () => {
        expect(InputOption.createOptions(['sme', { val: 'val' }, { key: 'key' }]))
          .to.eql([
            { key: 'sme', val: 'sme' },
            { key: 'val', val: 'val' },
            { key: 'key', val: 'key' }
          ]);
      });
    });
  });
  describe('UIFieldDef', () => {
    describe('the factory method', () => {
      it('should construct the field def, with proper default', () => {
        const sat1st = {
          control: 'input',
          dataType: 'string',
          description: undefined,
          format: 'text',
          label: 'Field1',
          name: 'field1',
          placeholder: 'Field1',
          nullable: true
        };
        //const rslt1 = UIFieldDef({ name: 'field1' });
        expect(R.whereEq(sat1st, InputFieldDef({ name: 'field1' }))).to.eql(true);
        const where2nd = {
          control: 'select',
          dataType: 'string',
          description: undefined,
          multiple: false,
          options: [
            { key: 12, val: 12 }, { key: 23, val: 23 }
          ],
          path: 'pa.p1.path.field1'
        };
        expect(R.whereEq(where2nd,
          InputFieldDef({ name: 'field1', parentPath: 'pa.p1.path', options: [12, 23] })))
          .to.eq(true);

        const where3rd = {
          ...where2nd,
          multiple: true,
        };
        expect(R.whereEq(where3rd,
          InputFieldDef({ name: 'field1', parentPath: 'pa.p1.path', options: [12, 23], multiple: true })
        )).to.eq(true);

        expect(R.whereEq({ ...where2nd, options: [] },
          InputFieldDef({ name: 'field1', parentPath: 'pa.p1.path', control: 'select' })
        )).to.eq(true);

        expect(R.whereEq(where3rd,
          InputFieldDef({
            name: 'field1',
            parentPath: 'pa.p1.path',
            options: [12, 23],
            multiple: true,
            control: 'radio'
          })
        )).to.eq(true);

        expect(R.whereEq({ ...sat1st, control: 'toggle', dataType: 'boolean' },
          InputFieldDef({
            name: 'field1',
            dataType: 'boolean'
          })
        )).to.eql(true);
      });
    });
    describe('getDataTypeFromSchema', ()=>{
      it('should create correct data type from the given schema', ()=>{
        expect(InputFieldDef
          .getDataTypeFromSchema({
            items: [{type: JsFieldTypes.INTEGER}]
          }))
          .to.eql('number');
        expect(InputFieldDef
          .getDataTypeFromSchema({
            items: [{ type: JsFieldTypes.BOOLEAN },
              {type: JsFieldTypes.INTEGER}]
          })).to.eql('boolean');
        expect(InputFieldDef
          .getDataTypeFromSchema({
            type: JsFieldTypes.ARRAY
          })).to.eql('string');
        expect(InputFieldDef
          .getDataTypeFromSchema({
            tems: [
              { type: JsFieldTypes.BOOLEAN },
              {type: JsFieldTypes.STRING}
            ]
          }))
          .to.eql('string');
      });
    });
  });
});
