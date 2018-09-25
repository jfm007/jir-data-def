const expect = require('chai').expect;
const { RunInfo } = require('./processor');
const { getUpdatedInfo } = RunInfo;
describe('RunInfo factory and methods', () => {
  describe('the getUpdatedInfo method', () => {
    let info = RunInfo({data: { data: 'data'}});
    it('should make no change if idx/parentArray is undefined', ()=>{
      expect(getUpdatedInfo(info)({ path: 'path1' }))
        .to.eql({ data: { data: 'data'} , path: 'path1'});
      expect(getUpdatedInfo(info)({ idx: 1, path: 'path1' }))
        .to.eql({ data: { data: 'data' },  path: 'path1' });
      expect(getUpdatedInfo(info)({ parentArray: [2,3], path: 'path1' }))
        .to.eql({ data: { data: 'data' }, path: 'path1' });
    });
    it('should work when the path is nil/empty', ()=>{
      info = getUpdatedInfo(info)({ idx: 0, parentArray: [1, 2]});
      expect(info).to.eql({
        data: { data: 'data'},
        idx: 0,
        parentArray: [1, 2],
        parentArrayItemPaths:['.0'],
        parentArrayPaths: ['.'],
        path: '.0'
      });
    });
    it('should add new paths to the array related properties', ()=>{
      info = getUpdatedInfo(info)({ idx: 2, parentArray: [3,4], path: 'path1'});
      expect(info).to.eql({
        data: { data: 'data'},
        idx: 2,
        parentArray: [3, 4],
        parentArrayItemPaths:['.0', 'path1.2'],
        parentArrayPaths: ['.','path1'],
        path: '.0.path1.2'
      });
    });
  });
});
