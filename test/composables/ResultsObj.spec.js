const expect = require('chai').expect;
const R = require('ramda');
const { ResultsObj, ProcessResult, ObjWithAlert, AlertSeverity } = require('./composables');
const { updateResult, isResultObj, getResultObj} = ResultsObj;
const { INFO, ERROR } = AlertSeverity;
const { getLens } = require('../../src/utils');
const { prefixParentPathToProcessingResults } = ResultsObj;

describe('ResultsObj factory and methods', ()=>{
  describe('static methods', ()=>{
    describe('prefixParentPathToProcessingResults', () => {
      it('should add the path to the result, if the path is not null', () => {
        const result = {
          'a.b.c': { path: 'a.b.c' },
          'd': { path: 'd' },
          'e': { path: 'e' }
        };
        const rslt = prefixParentPathToProcessingResults('h.q.t', result);
        expect(rslt)
          .to.eql({
            'h.q.t.a.b.c': { path: 'h.q.t.a.b.c' },
            'h.q.t.d': { path: 'h.q.t.d' },
            'h.q.t.e': { path: 'h.q.t.e' }
          });
        const workWithLenOver = R.over(
          getLens('result'),
          prefixParentPathToProcessingResults('h.q.t'));
        expect(workWithLenOver({ result }))
          .to.eql({
            result: {
              'h.q.t.a.b.c': { path: 'h.q.t.a.b.c' },
              'h.q.t.d': { path: 'h.q.t.d' },
              'h.q.t.e': { path: 'h.q.t.e' }
            }
          });
      });
      it('should return the original result obj, if the path is empty/null', () => {
        const result = {
          'a.b.c': { path: 'a.b.c' },
          'd': { path: 'd' },
          'e': { path: 'e' }
        };
        expect(prefixParentPathToProcessingResults(null, result))
          .to.eql({
            'a.b.c': { path: 'a.b.c' },
            'd': { path: 'd' },
            'e': { path: 'e' }
          });
      });
    });
    describe('isResultObj', ()=>{
      it('should return true, if either data/result is not undefined', ()=>{
        expect(isResultObj({})).to.eq(false);
        expect(isResultObj({ data: {} })).to.eq(true);
        expect(isResultObj({ result: {}})).to.eq(true);
        expect(isResultObj({ data: null })).to.eq(true);
        expect(isResultObj({ result: null})).to.eq(true);
      });
    });
    describe('getResultObj', ()=>{
      it('should create result obj, if not a result obj (use the input as data)', ()=>{
        expect(getResultObj({something: 1})).to.eql({ data: {something: 1}, result: null});
        expect(getResultObj({ data: {s: 1}})).to.eql({ data: {s: 1}});
      });
    });
    describe('updateResult', ()=>{
      it('should merge the result, properly', ()=>{
        const result1 = ResultsObj({});
        const obj1 = updateResult(result1, ProcessResult({ path: 'path2', state: { readonly: true}}));
        expect(obj1).to.eql({
          data: {},
          result: {
            'path2':{
              path: 'path2', state: { readonly: true}
            }
          }
        });
        const obj2 = updateResult(obj1, ProcessResult({ path: 'path2', value: 'something' }));
        expect(obj2).to.eql({
          data: { path2: 'something' },
          result: {
            'path2':{
              path: 'path2', value: 'something', state: { readonly: true}
            }
          }
        });
        const obj3 = updateResult(obj2, ProcessResult({ path: 'path1.path3', value: 'deeppath'}));
        expect(obj3).to.eql({
          data: { path2: 'something', path1: { path3 : 'deeppath' } },
          result: {
            'path2':{
              path: 'path2', value: 'something', state: { readonly: true}
            },
            'path1.path3': {
              path: 'path1.path3', value: 'deeppath',
            }
          }
        });
        const newResult = ProcessResult({ path: 'path2', state: { kk: 'dd', readonly: false}});
        const objAlerts = ObjWithAlert({ alert: ['alert1', 'alert2', {message: 'alert3', severity:INFO}]});
        newResult.alert = objAlerts.alert;
        const obj4 = updateResult(obj3, newResult);
        expect(obj4).to.eql({
          data: { path2: 'something', path1: { path3: 'deeppath' }},
          result: {
            path2:{
              path: 'path2', value: 'something', state: { readonly: false, kk: 'dd'},
              alert: [
                { message: 'alert1', severity: ERROR},
                { message: 'alert2', severity: ERROR},
                { message: 'alert3', severity: INFO}
              ]
            },
            'path1.path3': {
              path: 'path1.path3', value: 'deeppath',
            }
          }
        });
      });
    });
  });
});
