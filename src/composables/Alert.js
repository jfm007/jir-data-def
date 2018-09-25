const stampit = require('@stamp/it');
const R = require('ramda');
const { isNilOrEmpty } = require('ramda-adjunct');
const Maybe = require('../maybe');
//const { getLens } = require('../utils');
/**
 * The message type
 */
const AlertSeverity = {
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

Object.freeze(AlertSeverity);

exports.AlertSeverity = AlertSeverity;

const alertTypeValues = R.values(AlertSeverity);
const isSeverityCorrect = R.contains(R.__, alertTypeValues);
/**
 * Used to normalize the given alert severity
 */
const normalizeAlertSeverity = R.cond([
  [isNilOrEmpty, R.always(AlertSeverity.ERROR)],
  [isSeverityCorrect, R.identity],
  [R.T, R.always(AlertSeverity.ERROR)],
]);

const isAlertCorrect = R.where({ message: R.is(String), severity: isSeverityCorrect });
/**
 * used to normalize alert obj
 */
const normalizeAlert = (alert) => Maybe.of(alert)
  .mapS(R.ifElse(R.is(String), (message)=>({message}), R.identity))
  .mapS(R.ifElse(isAlertCorrect, R.identity, Alert))
  .join();

/**
 * The alert factory
 */
const Alert = stampit({
  init(props) {
    Maybe.of(props)
      .mapS(R.ifElse(R.is(String), (message)=>({message}), R.identity))
      .mapS(initObj=>{
        let { message, severity } = initObj;
        Maybe.of(message)
          .mapS(() => {
            this.message = message;
            this.severity = normalizeAlertSeverity(severity);
          });
      });

  },
})
  .statics({
    normalizeAlert: normalizeAlert,
    normalizeAlertSeverity: normalizeAlertSeverity
  });

exports.Alert = Alert;




