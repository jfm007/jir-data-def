const expect = require('chai').expect;
const utils = require('../../src/jsv/utils');
// const jsv = require('../../')
// const { validateAgainstSchema } = utils;
//const
describe('jsv utils', () => {
  // describe('validateAgainstSchema', ()=>{
  //   const schema1 = { type: }
  //   validateAgainstSchema()
  // });
  describe('createSchemaPathFromDataPath', () => {
    it('should create schema path from data path', () => {
      expect(utils.createSchemaPathFromDataPath('.p1.p2')).to.eq('.properties.p1.properties.p2');
      expect(utils.createSchemaPathFromDataPath('.properties.p1.properties.p2')).to.eq('.properties.p1.properties.p2');
      expect(utils.createSchemaPathFromDataPath('p1.p2')).to.eq('.properties.p1.properties.p2');
    });
  });

  describe('createDataPathFromSchemaPath', () => {
    it('should create data path from schema path', () => {
      expect(utils.createDataPathFromSchemaPath('.properties.p1.properties.p2')).to.eq('.p1.p2');
    });
  });
  describe('param methods', () => {
    const schema = {
      properties: {
        p1: {
          title: 'P One'
        },
        p2: {
          title: 'P Two',
          properties: {
            p3: {
              title: 'P Three'
            }
          }
        }
      }
    };
    const param = { schemaPath: '.properties.p1' };
    describe('normalizeTitleForParam', () => {
      it('should add find the title for the param if, it not existed', () => {
        expect(utils.normalizeTitleForParam(schema, { ...param, title: 'p 1' }))
          .to.eql({ schemaPath: '.properties.p1', title: 'p 1' });
        expect(utils.normalizeTitleForParam(schema, param))
          .to.eql({ schemaPath: '.properties.p1', title: 'P One' });
        expect(utils.normalizeTitleForParam(schema, {title: 'P1'}))
          .to.eql({ title: 'P1' });
        expect(utils.normalizeTitleForParam(schema, {}))
          .to.eql({});
        expect(utils.normalizeTitleForParam({}, { ...param, title: 'p 1' }))
          .to.eql({ schemaPath: '.properties.p1', title: 'p 1' });
      });
    });
    describe('normalizeParam', () => {
      it('should normalize schemaPath/dataPath for it', () => {

        const param2 = { dataPath: '.p1' };
        expect(utils.normalizeParam(schema, 'p1').join())
          .to.eql({ schemaPath: '.properties.p1', title: 'P One', dataPath: '.p1'});
        expect(utils.normalizeParam(schema, '.properties.p1').join())
          .to.eql({ schemaPath: '.properties.p1', title: 'P One', dataPath: '.p1'});
        expect(utils.normalizeParam(schema, param).join())
          .to.eql({ schemaPath: '.properties.p1', title: 'P One', dataPath: '.p1'});
        expect(utils.normalizeParam(schema, param2).join())
          .to.eql({ schemaPath: '.properties.p1', title: 'P One', dataPath: '.p1'});
        const testRslt = utils.normalizeParam(null, param2).join();
        expect(testRslt)
          .to.eql({ schemaPath: '.properties.p1', dataPath: '.p1'});
        expect(utils.normalizeParam(schema, {}).join())
          .to.eql({});
      });
    });
    describe('getParamValueFromData', () => {
      const data = { p1: {p2: {p3: 'p3'}, p22: 'p22'}, p11: 'p11'};
      const param3 = { p3: { dataPath: 'p1.p2.p3'}, p22: { dataPath: 'p1.p22'}, p11: { dataPath: 'p11'}};
      it('should get data from object for the given param', () => {
        expect(utils.getParamValueFromData(data, param3).join())
          .to.eql({p3: 'p3', p22: 'p22', p11: 'p11'});
      });
    });
  });
});
