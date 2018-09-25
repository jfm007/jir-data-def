//const R = require('ramda');
const Maybe = require('../src/maybe');
const expect = require('chai').expect;

describe('Maybe', ()=>{
  describe('Constructor', ()=>{
    it('it should construct the Maybe properly', ()=>{
      const mb = new Maybe('test');
      expect(mb.value).to.equal('test');
      const eMb = new Maybe({});
      expect(eMb.isEmpty).to.equal(true);
      const nullMb = new Maybe(null);
      expect(nullMb.isNothing).to.equal(true);
      const undefinedMb = new Maybe(undefined);
      expect(undefinedMb.isNothing).to.equal(true);
      const emptyArrayMb = new Maybe([]);
      expect(emptyArrayMb.isEmpty).to.equal(true);
    });
  });
  describe('of', ()=>{
    it('should construct as the constructor do', ()=>{
      //const mb = new Maybe('test');
      expect(Maybe.of('test').value).to.eq('test');
      expect({ ... Maybe.of({})}).to.deep.eq({value:{}, isEmpty: true});
      expect(Maybe.of(null).isNothing).to.eq(true);
      expect(Maybe.of(undefined).isNothing).to.eq(true);
    });
  });
  describe('map', ()=>{
    it('should map the value through the transform function', ()=>{
      const result =  Maybe.of(1).map((val) => val * 2).join();
      expect(result).to.eq(2);
      expect(Maybe.of(null).map((val) => val * 2).join()).to.eq(undefined);
    });
  });
  describe('mapS', ()=>{
    it('mapS should check for the empty else well', () => {
      const arry = [1, 2];
      expect(Maybe.of(arry).mapS((data) => data.map(d => d * 2)).join()).to.eql([2, 4]);
      expect(Maybe.of({}).mapS((val) => val.a = 2).join()).to.equal(undefined);
      expect(Maybe.of([]).mapS((data) => data.map(d => d * 2)).join()).to.eq(undefined);
      expect(Maybe.of(2).mapS(val => val * 2).join()).to.eq(4);
      expect(Maybe.of('').mapS(val => val + '1').join()).to.eq(undefined);
    });
  });
  describe('join', ()=>{
    it('join should return the value', () => {
      const result = Maybe.of(1).join();
      expect(result).to.eq(1);
    });
  });
  describe('chain', ()=>{
    it('should chain function return Maybe', () => {
      const addOne = (val) => Maybe.of(val + 1);
      const rslt = Maybe.of(1)
        .chain(addOne)
        .chain(addOne).join();
      expect(rslt).to.eq(3);
      expect(Maybe.of(null).chain(addOne).join()).to.eq(undefined);
    });
  });
  describe('chainS', ()=>{
    it('should chainS function return Maybe', () => {
      const addOne = (val) => Maybe.of(val + 1);
      const rslt = Maybe.of(1)
        .chain(addOne).chain(addOne).join();
      expect(rslt).to.eq(3);
      expect(Maybe.of([])
        .chainS(() => [1, 2])
        .mapS(() => [3, 4]).join()).to.eq(undefined);
    });
  });
  describe('orElse', ()=>{
    it('orElse should return default if value is nothing, return if Value is legit', () => {
      expect(Maybe.of(null).orElse('default').join()).to.eq('default');
      expect(Maybe.of(2).orElse(3).join()).to.eq(2);
      expect(Maybe.of(null).orElse(()=>'something').join()).to.eq('something');
    });
  });
});

