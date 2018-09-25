const Stamp = require('@stamp/it');
const R = require('ramda');
const Maybe = require('../maybe');
const { allSchemaProps } = require('./schemas');
const { jsv } = require('./jsv');
const { sanitizePath, getPropsInList } = require('../utils');

const getSchemaProps = getPropsInList(allSchemaProps);
const ObjWithSchema = Stamp({
  init({ schema = null, path = null, name, schemaProps }) {
    this.schema = schema || getSchemaProps(schemaProps);
    this.schema.name = name;

    if (!this.path && path)
      this.path = sanitizePath(path);
    this.jsvValidate = ObjWithSchema.jsvValidate(this);
  }
})
  .statics({
    jsvValidate: R.curry((obj, data) => {
      return Maybe.of(obj.schema)
        .mapS((schema) => {
          if (jsv.validate(schema, data)) return [];
          return jsv.processResults();
        })
        .orElse([]).join();
    })
  });

exports.ObjWithSchema = ObjWithSchema;
