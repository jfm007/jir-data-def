const stampit = require('@stamp/it');
const R = require('ramda');
const RA = require('ramda-adjunct');
const Maybe = require('../maybe');
const { Alert } = require('./Alert');

const { normalizeAlert } = Alert;

/**
 * Used to create obj with optional alert
 */
const ObjWithAlert = stampit({
  init({ message = null, alert = null }) {
    Maybe.of(alert)
      .mapS(R.ifElse(R.is(Array), R.map(normalizeAlert), R.pipe(normalizeAlert, R.of)))
      .mapS(R.reject(RA.isNilOrEmpty))
      .mapS((alert) => { this.alert = alert; });
    if (this.alert) return;
    Maybe.of(message)
      .mapS(() => { this.alert = [Alert({ message })]; });
  }
})
  .statics({
    /**
     * used to get error message
     * @return a array of error messages
     */
    getErrorMessges: (alerts) => ObjWithAlert.getAlertMessages(alerts)('error'),
    /**
     * used to get alert messages from the given alerts array
     * @return a array of messages
     */
    getAlertMessages: (alerts) => (severity) => {
      return ObjWithAlert.getAlert(alerts)(severity)
        .mapS(R.map(R.prop('message'))).join();
    },
    /**
     * @return the maybe of the result
     */
    getAlert: (alerts) => (sev) => {
      return Maybe.of(alerts)
        .mapS(R.ifElse(R.is(Array), R.identity, R.pipe(R.prop('alert'))))
        .chainS((alerts) => {
          return Maybe.of(sev)
            .mapS((sev) => R.filter(R.propEq('severity', sev), alerts))
            .orElse(alerts);
        });
    },
    /**
       * used to merge result with other obj of alerts
       * @param {*} obj
       */
    mergeObjWithAlerts: R.curry((target, source) => {
      if (!target) return source;
      if (!source) return target;
      const { alert, message } = source;
      const existingAlerts = target.alert || [];
      const existingMsgs = R.map(R.prop('message'), existingAlerts);
      const isAlertExisted = R.propSatisfies(
        R.contains(R.__, existingMsgs), 'message');

      const result = Maybe.of(alert)
        .orElse(message)
        .mapS(R.ifElse(R.is(Array),
          R.map(normalizeAlert),
          R.pipe(normalizeAlert, R.of)))
        .mapS(R.pipe(R.reject(RA.isNilOrEmpty), R.reject(isAlertExisted)))
        .mapS(R.concat(existingAlerts))
        .mapS(R.assoc('alert', R.__, target))
        .orElse(target).join();
      return result;
    })
  });

exports.ObjWithAlert = ObjWithAlert;


