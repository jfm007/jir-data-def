const expect = require('chai').expect;
const stampit = require('@stamp/it');
const { Alert, AlertSeverity, ObjWithAlert } = require('../../src/composables');

const { WARNING, ERROR, INFO } = AlertSeverity;
const { PureValueObj } = require('../utils');
const NewObjWithAlert = stampit(ObjWithAlert, PureValueObj);
describe('Alert composable', () => {
  it('should contruct alert with both message and alert or just message', () => {
    expect(Alert({ message: 'message1' })).to.eql({ message: 'message1', severity: ERROR });
    expect(Alert({ message: 'message1', severity: WARNING })).to.eql({ message: 'message1', severity: WARNING });
    expect(Alert({ message: 'seomthing', severity: 'somethig' }))
      .to.eql({ message: 'seomthing', severity: ERROR });
    expect(Alert({ severity: 'asdf' })).to.eql({});
    expect(Alert('alert1')).to.eql({ message: 'alert1', severity: ERROR });
  });
});

describe('ObjWithAlert', () => {
  describe('constructor factory method', () => {
    it('should construct the obj with alert if message presents in alert', () => {
      expect(NewObjWithAlert({ message: 'sfa' }).value()).to.eql({ alert: [{ message: 'sfa', severity: ERROR }] });
      expect(NewObjWithAlert({ alert: { message: 'sd', severity: INFO } }).value())
        .to.eql({ alert: [{ message: 'sd', severity: INFO }] });
      expect(NewObjWithAlert({ alert: { message: 'sd', severity: 'sef' } }).value())
        .to.eql({ alert: [{ message: 'sd', severity: ERROR }] });
      expect(NewObjWithAlert({ alert: { severity: ERROR } }).value())
        .to.eql({});
      const arrayAlerts = ['alert1', 'alert2', { message: 'alert3', severity: INFO }];
      const obj1 = NewObjWithAlert({ alert: arrayAlerts });
      expect(obj1.value()).to.eql({
        alert: [
          { message: 'alert1', severity: ERROR },
          { message: 'alert2', severity: ERROR },
          { message: 'alert3', severity: INFO },
        ]
      });
    });
    it('should be able to merge other obj with alerts into this one', () => {
      const obj = ObjWithAlert({ message: 'alert1' });
      const obj2 = ObjWithAlert.mergeObjWithAlerts(obj, ({ message: 'alert2' }));
      const obj3 = ObjWithAlert.mergeObjWithAlerts(obj2, { alert: 'alert3' });
      const obj4 = ObjWithAlert.mergeObjWithAlerts(obj3, {
        alert: [
          'alert4', { message: 'alert5' }, 'alert1', 'alert2', 'alert3', 'alert6'
        ]
      });
      const newObj = ObjWithAlert.mergeObjWithAlerts(obj4, { message: 'alert6' });
      expect(newObj).to.eql({
        alert: [
          { message: 'alert1', severity: ERROR },
          { message: 'alert2', severity: ERROR },
          { message: 'alert3', severity: ERROR },
          { message: 'alert4', severity: ERROR },
          { message: 'alert5', severity: ERROR },
          { message: 'alert6', severity: ERROR },
        ]
      });
    });
  });
  describe('getAlertMessages', ()=>{
    const { getAlertMessages } = ObjWithAlert;
    const arrayAlerts = ['alert1', 'alert2', { message: 'alert3', severity: INFO },
      { message: 'alert4', severity: INFO }, { message: 'alert5', severity: WARNING },
      { message: 'alert6', severity: WARNING }
    ];
    const alertsObj = ObjWithAlert({ alert: arrayAlerts });
    it('should get all messages if no severity is given for array input of alerts/object with alert prop', ()=>{
      expect(getAlertMessages(alertsObj.alert)()).to.eql([
        'alert1', 'alert2', 'alert3', 'alert4', 'alert5', 'alert6'
      ]);
      expect(getAlertMessages(alertsObj)()).to.eql([
        'alert1', 'alert2', 'alert3', 'alert4', 'alert5', 'alert6'
      ]);
    });
    it('should get given message of given type for array input of alerts/object with alert prop', ()=>{
      expect(getAlertMessages(alertsObj.alert)(INFO)).to.eql([
        'alert3', 'alert4',
      ]);
      expect(getAlertMessages(alertsObj)(INFO)).to.eql([
        'alert3', 'alert4',
      ]);
    });
  });
});
