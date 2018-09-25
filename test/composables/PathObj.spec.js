const expect = require('chai').expect;
const { PathObject } = require('../../src/composables');

describe('Path Obj', ()=>{
  describe('constructor', ()=>{
    it('should create obj with path', ()=>{
      expect(PathObject().path).to.eq('.');
      const obj1 = PathObject({optional: true, path:'.path.1.2', prop1:'prop2', prop2: 'prop3'});
      expect(obj1.path).to.eq('path.1.2');
      expect(obj1.prop1).to.eq('prop2');
      expect(obj1.prop2).to.eq('prop3');
      const obj2 = PathObject({path: 'addresses[313].something'});
      expect(obj2.path).to.eq('addresses.313.something');
    });
  });
  describe('prefixPathToPathObj', ()=>{
    const obj1 = PathObject({optional: true, path:'.path.1.2', prop1:'prop2', prop2: 'prop3'});
    const obj2 = PathObject.prefixPathToPathObj(obj1, 'parent1.parent2');
    expect(obj2.path).to.eq('parent1.parent2.path.1.2');
    const prefixObj2 = PathObject.prefixPathToPathObj(obj2);
    expect(prefixObj2('').path).to.eq('parent1.parent2.path.1.2');
    expect(prefixObj2(' ').path).to.eq('parent1.parent2.path.1.2');
  });
});
