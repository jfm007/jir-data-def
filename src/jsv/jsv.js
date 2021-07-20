const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const stamp = require('@stamp/it');
const R = require('ramda');
const RA = require('ramda-adjunct');
const Maybe = require('../maybe');
const { ProcessResult } = require('../composables');
//const ajv = new Ajv({allErrors: true});
const Jsv = stamp()
  .init(function () {
    this.ajv = new Ajv({
      allErrors: true,
      strictSchema: false,
      $data: true,
    });
    addFormats(this.ajv);
    const { validate, errors, processResults, validateForResult } = Jsv;
    this.validate = validate(this);
    this.errors = errors(this);
    this.processResults = processResults(this);
    this.validateForResult = validateForResult(this);
  })
  .statics({
    /**
     * validate a given jsv obj, schema and value
     */
    validate: R.curry((jsv, schema, value) => {
      return Maybe.of(jsv)
        .mapS(R.prop('ajv'))
        .mapS(
          R.ifElse(() => R.and(schema, value),
            (ajv) => ajv.validate(schema, value),
            R.F
          )
        )
        .orElse(false).join();
    }),
    /**
     * used to get the errors of the given jsv
     */
    errors: (jsv) => {
      () => {
        return jsv.ajv.errors;
      };
    },
    /**
     * used to get the process result of the current run (the run that just finished)
     */
    processResults: (jsv) => {
      return () => {
        //const temp = ProcessResult(jsv.ajv.errors[0]);
        const { errors } = jsv.ajv;
        return Maybe.of(errors)
          .mapS(R.map((error) => ProcessResult(error)))
          .mapS(R.reject(RA.isNilOrEmpty))
          .orElse([]).join();
      };
    },
    /**
     * used to validate and return the result
     */
    validateForResult: R.curry((jsv, schema, value) => {
      const { validate, processResults } = Jsv;
      validate(jsv, schema, value);
      return processResults();
    })
  });

exports.Jsv = Jsv;
exports.jsv = Jsv();

