const stampit = require('@stamp/it');
const { ObjWithAlert } = require('../utils');

/**
 * factory to generated obj to contains the state of the control in form
 */
const UiState = stampit(ObjWithAlert)
  .init(function(display = true, readonly = false,
    hasFocus = false, focused = false, dirty = false){
    this.display = display;
    this.readonly = readonly;
    this.hasFocus = hasFocus;
    this.focused = focused;
    this.dirty = dirty;
  });

exports.UiState = UiState;
