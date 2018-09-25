const expect = require('chai').expect;
const R = require('ramda');
const { JsonSchema } = require('./jsv');
const pureValue = R.reject(R.is(Function));
describe('JsonSchema factory', ()=>{
  describe('constructor', ()=>{
    it('should create the object with only the schema related properties', ()=>{
      const rslt = JsonSchema({ properties: { kk: {}, dd:{}}, seomthi: 1});
      expect(pureValue(rslt))
        .to.eql({
          properties: { kk: {}, dd:{}},
          type: 'object'
        });
      expect(pureValue(JsonSchema({}))).to.eql({
        type: 'string'
      });
      expect(pureValue(JsonSchema({items: {type: 'string'}})))
        .to.eql({
          items:{ type: 'string'},
          type: 'array'
        });
    });
  });
});
