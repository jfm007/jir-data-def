const stampit = require('@stamp/it');
const serverDataDef = require('../dataDef').DataDef;
const { createProcessor } = require('./processor');
/**
 * the factory for data def on the client side
 */
const DataDef = stampit(serverDataDef)
  .methods({
    initDef(props) {
      return DataDef(props);
    },
    createProcessor(processorConfig){
      return createProcessor(processorConfig);
    }
  });

exports.DataDef = DataDef;
