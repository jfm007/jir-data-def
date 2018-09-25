const expect = require('chai').expect;
const { ProcessResult, AlertSeverity, ObjWithAlert } = require('../../src/composables');
const { mergeResult } = ProcessResult;
const { ERROR, INFO } = AlertSeverity;
describe('ProcessResult Factory', () => {
  describe('merge result method', () => {
    it('should merge the result correctly', () => {
      const result = ProcessResult({path: 'path1'});
      const original = ProcessResult({ path: 'path1' });
      expect(original).to.eql({ path: 'path1'});
      const obj1 = mergeResult(original, ProcessResult({path: 'path1', value: 'something'}));
      expect(obj1).to.eql({ path: 'path1', value: 'something' });
      const obj2 = mergeResult(obj1, ProcessResult({path: 'path1', message: 'alert1'}));
      expect(obj2).to.eql({ path: 'path1', value: 'something',
        alert: [{ message: 'alert1', severity: ERROR}]});
      const objAlerts = ObjWithAlert({ alert: ['alert1', 'alert2', {message: 'alert3', severity:INFO}]});
      result.alert = objAlerts.alert;
      const obj3 = mergeResult(obj2, result);
      expect(obj3).to.eql({
        path: 'path1', value: 'something',
        alert: [
          { message: 'alert1', severity: ERROR},
          { message: 'alert2', severity: ERROR},
          { message: 'alert3', severity: INFO}
        ]
      });
      const obj4 = mergeResult(obj3, ProcessResult({ path: 'path2', state: { readonly: true}}));
      expect(obj4).to.eql({
        path: 'path1', value: 'something',
        alert: [
          { message: 'alert1', severity: ERROR},
          { message: 'alert2', severity: ERROR},
          { message: 'alert3', severity: INFO}
        ]
      });
      const obj5 = mergeResult(obj3, ProcessResult({ path: 'path1', state: { readonly: true}}));
      expect(obj5).to.eql({
        path: 'path1', value: 'something', state: { readonly: true},
        alert: [
          { message: 'alert1', severity: ERROR},
          { message: 'alert2', severity: ERROR},
          { message: 'alert3', severity: INFO}
        ]
      });
      const obj6 = mergeResult(obj5, ProcessResult({ path: 'path1', state: { readonly: 'kk', d: 'd'}}));
      expect(obj6).to.eql({
        path: 'path1', value: 'something', state: { readonly: 'kk', d: 'd'},
        alert: [
          { message: 'alert1', severity: ERROR},
          { message: 'alert2', severity: ERROR},
          { message: 'alert3', severity: INFO}
        ]
      });
    });
  });
});
