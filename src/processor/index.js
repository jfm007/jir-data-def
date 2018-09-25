const baseProcessor = require('./Processor');

//const { runProcessors, sortProcessors } = require('./utils');
module.exports = {
  ... baseProcessor,
  ... require('./ProcessorsObj'),
  ... require('./ComputationProcessor'),
  ... require('./ConditionProcessor'),
  ... require('./ValidationProcessor'),
  ... require('./RunInfo'),
};
