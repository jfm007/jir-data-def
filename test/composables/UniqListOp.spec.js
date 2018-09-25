const expect = require('chai').expect;
const { uniqListOperator, UniqListOpByProp } = require('../../src/composables');

describe('uniqListOperator', ()=>{
  const { itemId, getListToAdd, areEqual, isItemInList, addToList } = uniqListOperator;
  describe('itemId', ()=>{
    it('should return the obj itself', ()=>{
      const obj = { a: ''};
      expect(itemId(obj)).to.eq(obj);
      expect(itemId(2)).to.eq(2);
    });
  });
  describe('areEqual', ()=>{
    it('should check the equal based on the obj itself', ()=>{
      expect(areEqual({a:'a'}, {a:'a'})).to.eq(true);
      expect(areEqual({a:'a'}, {a:'b'})).to.eq(false);
      expect(areEqual(1, 1)).to.eq(true);
      expect(areEqual(2, 1)).to.eq(false);
    });
  });
  describe('isItemInList', ()=>{
    it('should check whether the item is in the list', ()=>{
      const list = [1, {a:'a'}];
      expect(isItemInList(list, 1)).to.eq(true);
      expect(isItemInList(list, 2)).to.eq(false);
      expect(isItemInList(list, {a:'a'})).to.eq(true);
      expect(isItemInList(list, {a:'a1'})).to.eq(false);
    });
  });
  describe('getListToAdd', ()=>{
    it('should get the item to add to the uniqList', ()=>{
      const list = [1, {a:'a'}];
      expect(getListToAdd(list, 1)).to.eql([]);
      expect(getListToAdd(list, [1])).to.eql([]);
      expect(getListToAdd(list, [1, 2, 2])).to.eql([2]);
      expect(getListToAdd(list, [1, 2, 2, {}, {a:'a1'}, null, undefined])).to.eql([2, {a:'a1'}]);
    });
  });
  describe('addToList', ()=>{
    it('should concat the items to list, if anything added, return the new list', ()=>{
      const list = [1, {a:'a'}];
      expect(addToList(list, 1)).to.eq(list);
      expect(addToList(list, 2)).to.eql([1, {a:'a'}, 2]);
      expect(addToList(list, [2])).to.eql([1, {a:'a'}, 2]);
      expect(addToList(list, [1, 2, 2, {}, {a:'a'}, {a:'a1'}, null, undefined]))
        .to.eql([1, {a:'a'}, 2, {a:'a1'}]);
    });
  });
});

describe('UniqListOpByProp', ()=>{
  const opByName = UniqListOpByProp({prop:'name'});
  const { itemId, areEqual, isItemInList } = opByName;
  describe('itemId', ()=>{
    it('should return the obj itself', ()=>{
      const obj = { name: 'b'};
      expect(itemId(obj)).to.eq('b');
      expect(itemId(2)).to.eq(undefined);
    });
  });
  describe('areEqual', ()=>{
    it('should check the equal based on the obj itself', ()=>{
      expect(areEqual({name:'a'}, {name:'a'})).to.eq(true);
      expect(areEqual({name:'a'}, {name:'b'})).to.eq(false);
      expect(areEqual(1, 1)).to.eq(true);
      expect(areEqual({name:'a'}, {name1:'a'})).to.eq(false);
    });
  });
  describe('isItemInList', ()=>{
    it('should check whether the item is in the list', ()=>{
      const list = [{name:'b'}, {name:'a'}];
      expect(isItemInList(list, 1)).to.eq(false);
      expect(isItemInList(list, null)).to.eq(false);
      expect(isItemInList(list, {k: 'a'})).to.eq(false);
      expect(isItemInList(list, {name:'b'})).to.eq(true);
      expect(isItemInList(list, {name:'a1'})).to.eq(false);
    });
  });
});
