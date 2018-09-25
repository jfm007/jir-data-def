const stampit = require('@stamp/it');
const R = require('ramda');
const RA = require('ramda-adjunct');
const Maybe = require('../maybe');
const { ObjWithAlert } = require('./ObjWithAlert');
const { PathObject } = require('./PathObj');
const ProcessResult = stampit(PathObject, ObjWithAlert)
  .init(function ({ value, state, isFulFilled }) {
    if(!RA.isNilOrEmpty(state))
      this.state = state;
    if(value !== undefined) this.value = value;
    if(isFulFilled) this.isFulFilled = !!isFulFilled;
    //if(isValid) this.isValid = true;
  })
  .statics({
    mergeResult: R.curry((original, newObj) => {
      if (!original) return newObj;
      if (!newObj) return original;
      let { path, value, alert, state } = newObj;
      if (original.path === path) {
        const result = ObjWithAlert.mergeObjWithAlerts(original, { alert });
        if (value !== undefined) result.value = value;
        Maybe.of(state)
          .mapS(R.merge(original.state))
          .orElse(original.state)
          .mapS(state=>result.state = state);
        return result;
      }
      return original;
    })
  });

exports.ProcessResult = ProcessResult;
