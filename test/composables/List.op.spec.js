const expect = require('chai').expect;
const { listOperator } = require('../../src/composables');
const { getListToAdd, addToList } = listOperator;
describe('Base ListOp', ()=>{
  describe('getListToAdd', ()=>{
    it('should return the second param, if both params supplied', ()=>{
      let items =getListToAdd([1], [23]);
      expect(items).to.eql([23]);
      expect(getListToAdd([1], 2)).to.eql([2]);
    });
    it('it should return the first param if only one param presents', ()=>{
      expect(getListToAdd([1])).to.eql([1]);
      expect(getListToAdd(1)).to.eql([1]);
    });
  });
  describe('addToList', ()=>{
    it('should add item to the list', ()=>{
      expect(addToList(null, [2])).to.eql([2]);
      expect(addToList(null, 2)).to.eql([2]);
      let rslt = addToList([1], 2);
      expect(rslt).to.eql([1,2]);
    });
  });
});
