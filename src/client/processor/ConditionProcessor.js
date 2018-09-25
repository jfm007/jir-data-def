const stampit = require('@stamp/it');
const server = require('../../processor');
const { Maybe }= require('../utils');
const R = require('ramda');
/**
 * expected to have additional isReadOnly property from the processor definition,
 * if the isReadOnly is true, then set target fields value to null/failed value
 * and display to be true
 */
const ConditionProcessor = stampit(server.ConditionProcessor)
  .methods({
    run(data) {
      return ConditionProcessor.runConditionProcessor(this,data);
    }
  })
  .statics({
    runConditionProcessor(processor,data){
      const { isReadOnly, success, failed } = processor;
      return Maybe.of(server.ConditionProcessor.runConditionProcessor(processor, data))
        .mapS(R.ifElse(R.is(Array), R.identity, R.of))
        .mapS(R.map((rslt)=>{
          const { isFulFilled } = rslt;
          if(isFulFilled){
            rslt.state = {
              readonly: !!success,
              display: true
            };
          }
          else{
            //const isDisplayFieldAsReadOnly = !!(isReadOnly || failed || false);
            rslt.state = {
              readonly: true,
              display: !!(isReadOnly || failed || false)
            };
          }
          return rslt;
        }))
        .orElse([]).join();
    }
  });

exports.ConditionProcessor = ConditionProcessor;
