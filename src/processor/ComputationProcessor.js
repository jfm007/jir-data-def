const stampit = require('@stamp/it');
const { Processor, ProcessorTypes } = require('./Processor');
/**
 * The processor used for value computation
 * This type of computation should take higher priority compared to conditionProcessor and validationProcessor
 */
const ComputationProcessor = stampit(Processor)
  .init(function(){
    this.type = ProcessorTypes.Compute;
  });

exports.ComputationProcessor = ComputationProcessor;
