const expect = require('chai').expect;
const utils = require('../src/utils');

describe('root utils tool methods', ()=>{
  describe('sanitizePath', ()=>{
    it('should sanitize the path to rid of the empty spaces for each of the node on the path', ()=>{
      expect(utils.sanitizePath('path.paht')).to.eq('path.paht');
      expect(utils.sanitizePath(' path.path ')).to.eq('path.path');
      expect(utils.sanitizePath(' path .  path1. asdf .sd')).to.eq('path.path1.asdf.sd');
    });
  });
  describe('pluckNilValue', ()=>{
    it('should pluck nil value out of the object', ()=>{
      expect(utils.pluckNilValue({a:'a', b: undefined, c:undefined})).to.eql({a:'a'});
    });
  });
  describe('hasProp/notHasProp', ()=>{
    const { hasProp, notHasProp } = utils;
    it('should check whether prop exists/not', ()=>{
      expect(hasProp({a:{c:{d:1}}}, 'a.c.d')).to.eq(true);
      expect(notHasProp({a:{c:{d:1}}}, 'a.c.d')).to.eq(false);
      expect(hasProp({a:{c:{d:1}}}, 'a.c.e')).to.eq(false);
      expect(notHasProp({a:{c:{d:1}}}, 'a.c.e')).to.eq(true);
      expect(hasProp(null, 'a.c.e')).to.eq(false);
      expect(notHasProp(null, 'a.c.e')).to.eq(true);
    });
  });
  describe('hasAllProps/notHasAllProps', ()=>{
    const { hasAllProps, notHasAllProps } = utils;
    it('should check whether prop exists/not', ()=>{
      const obj = {a:{c:{d:1}}, c:'b'};
      expect(hasAllProps(obj, ['a.c.d', 'c', 'a.c'])).to.eq(true);
      expect(notHasAllProps(obj, ['a.c.d', 'c', 'a.c.e'])).to.eq(true);
      expect(hasAllProps(obj, ['a.c.d', 'c', 'a.c.e'])).to.eq(false);
      expect(notHasAllProps(obj, ['a.c.d', 'c', 'a.c'])).to.eq(false);
    });
  });
  describe('getPropsInList', ()=>{
    it('should filter the props from the given list', ()=>{
      expect(utils.getPropsInList(['a', 'b', {c:5}, {d:2}], {a:1, b:2, c:'d', e:5}))
        .to.eql({a:1,b:2,c:'d', d:2});
      expect(utils.getPropsInList(null, {a:1, b:2, c:'d'})).to.eql({a:1,b:2, c:'d'});
    });
  });
  describe('getObjFromProps', ()=>{
    it('should filter the props from the given list if the the flag is true', ()=>{
      expect(utils.getObjFromProps(true, ['a', 'b', {c:5}, {d:2}], {a:1, b:2, c:'d', e:5}))
        .to.eql({a:1,b:2,c:'d', d:2});
      expect(utils.getObjFromProps(true, null, {a:1, b:2, c:'d'})).to.eql({a:1,b:2, c:'d'});
    });
    it('should keep all the props if the flag is off', ()=>{
      expect(utils.getObjFromProps(false, ['a', 'b', {c:5}, {d:2}], {a:1, b:2, c:'d', e:5}))
        .to.eql({a:1,b:2,c:'d', d:2, e:5});
    });
  });
});
