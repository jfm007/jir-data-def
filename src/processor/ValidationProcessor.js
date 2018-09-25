const R = require('ramda');
const stampit = require('@stamp/it');
const RA = require('ramda-adjunct');
const Maybe = require('../maybe');
const { Processor, ProcessorTypes } = require('./Processor');
const { AlertSeverity, ProcessResult } = require('../composables');
const { runProcessor } = Processor;
const { ERROR } = AlertSeverity;
/**
 * The processor used for logic validations
 * If error happens, it should default to report error to all the involved fields
 * If report target specified, then only report targeted fields
 * If the processor's reportToRoot = true, then add the error message will be reported to
 * the current form/section
 */
const ValidationProcessor = stampit(Processor)
  /**
  *   type = 'validation';
  *  reportToRoot = false;
  * message: string;
  * severity = 'error'; // error, informational, warning
  * @param {*} option
  */
  .init(function ({ severity = ERROR, reportToRoot, message = null }) {
    if (RA.isNilOrEmpty(message)) {
      throw new Error('Message on Validation Processor is null');
    }
    this.type = ProcessorTypes.Validation;
    this.severity = severity;
    this.reportToRoot = reportToRoot;
  })
  .methods({
    run(data) {
      return ValidationProcessor.runValidationProcessor(this, data);
    }
  })
  .statics({
    /**
     *
     * @param processor
     * @param data
     */
    runValidationProcessor: R.curry((processor, data) => {
      const { paramInfos, reportToRoot, message, isFieldArray } = processor;
      const path = processor.path || '.';
      const rslt = runProcessor(processor)(data);
      if (RA.isTrue(rslt) || (RA.isTruthy(rslt) && !isFieldArray)) { return []; }
      const resultObj = { path, alert: [message]};
      if (reportToRoot) { return ProcessResult(resultObj); }
      if (isFieldArray && R.is(Object, rslt)) {
        const { indexes, field } = rslt;
        return Maybe.of(field)
          .mapS(field=>({path: field, alert: [message]}))
          .orElse(()=>ProcessResult(resultObj))
          .chainS((rslt)=> Maybe.of(indexes)
            .mapS(R.map(idx=>({...rslt, path: `${idx}.${rslt.path}`})))
            .orElse([rslt]))
          .join();
      }
      else {
        return Maybe.of(paramInfos)
          .mapS(R.pipe(
            R.toPairs,
            R.map((pairs) => {
              const info = pairs[1];
              const { excludeForReport } = info;
              if (excludeForReport) { return null; }
              return ProcessResult({ ...resultObj, path: info.dataPath });
            })))
          .orElse([]).join();
      }
    })
  });

exports.ValidationProcessor = ValidationProcessor;

