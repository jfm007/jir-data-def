const expect = require('chai').expect;
const {
  Processor, ProcessorParamType
} = require('../../src/processor/Processor');
const { PARAMS, PARENTDATA, MIXED, DATA } = ProcessorParamType;
const { getNormalizedParam, updateParamWithParentPath, getDataToRun } = Processor;
describe('The base Processor', () => {
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
          },
          p22: {
            properties: {
              p4: {
                title: 'P Four'
              }
            }
          }
        }
      },
    }
  };
  describe('constructor', () => {
    it('should create the procesor', () => {
      const params = {
        p1: { dataPath: '.p1' },
        p3: { dataPath: '.p2.p3' },
        p4: { dataPath: '.p2.p22.p4' }
      };
      const processor = Processor({ schema, params, fn: () => { } });
      expect(processor.paramInfos)
        .to.eql({
          p1: { dataPath: '.p1', schemaPath: '.properties.p1', title: 'P One' },
          p3: { dataPath: '.p2.p3', schemaPath: '.properties.p2.properties.p3', title: 'P Three' },
          p4: {
            dataPath: '.p2.p22.p4', title: 'P Four',
            schemaPath: '.properties.p2.properties.p22.properties.p4'
          }
        });
      expect(processor.paramType).to.eq(PARAMS);
      expect(processor.fn).not.to.eq(undefined);
      expect(processor.parentPath).to.eq(undefined);
      const pr2 = Processor({ schema, path: 'path1.path2'});
      expect(pr2.parentPath).to.eq('path1');
      expect(pr2.paramType).to.eq(DATA);
      const pr3 = Processor({ schema, path: 'path1.path2.path3', paramType: PARENTDATA});
      expect(pr3.parentPath).to.eq('path1.path2');
      expect(pr3.paramType).to.eq(PARENTDATA);
    });
  });
  describe('updateParamWithParentPath', () => {
    const param = { schemaPath: '.properties.p1', dataPath: '.p1' };
    it('should update the parentPath to the param', () => {
      expect(updateParamWithParentPath('.p2', param).join())
        .to.eql({
          schemaPath: '.properties.p2.properties.p1',
          dataPath: '.p2.p1'
        });
    });
  });
  describe('getDataToRun', () => {
    it('should return different part of the data, based on the paramType', () => {
      const data = { a: 'a', b: 'b', c: { d: 'd', e: 'e', f: { h: 'h', q: 'q' } } };
      expect(getDataToRun({ data, parentPath: 'c.f', paramType: PARENTDATA }))
        .to.eql({ h: 'h', q: 'q' });
      expect(
        getDataToRun({
          data,
          paramInfos: { test: { dataPath:'a' }, d: {dataPath: 'c.d'} },
          paramType: PARAMS
        })
      ).to.eql({ test: 'a', d: 'd' });
      expect(getDataToRun({
        data,
        paramInfos: { test: { dataPath:'a' }, d: {dataPath: 'c.d'} },
        parentPath: 'c.f',
        path: 'c.f.h',
        paramType: MIXED
      })).to.eql({
        data: 'h',
        params: { test: 'a', d: 'd' },
        parentData: {h: 'h', q: 'q' },
        rootData: data
      });
      expect(getDataToRun({
        data,
        paramInfos: { test: { dataPath:'a' }, d: {dataPath: 'c.d'} },
        paramType: MIXED
      })).to.eql({
        data: undefined,
        params: { test: 'a', d: 'd' },
        parentData: data,
        rootData: data
      });
    });
  });
  describe('getNormalizedParam', () => {
    //const param = { schemaPath: '.properties.p1' };
    it('should normalize the param if it is ok, otherwise throw error', () => {
      // const tw = () => { throw new Error('Message'); };
      expect(getNormalizedParam(schema, null, { schemaPath: '.properties.p1' }, 'p1'))
        .to.eql({ dataPath: '.p1', schemaPath: '.properties.p1', title: 'P One' });
      expect(getNormalizedParam(schema, '.p2', { schemaPath: '.properties.p1' }, 'p1'))
        .to.eql({ dataPath: '.p2.p1', schemaPath: '.properties.p2.properties.p1', title: 'P One' });
    });
  });

});
