const R = require('ramda');
const stampit = require('@stamp/it');
const PureValueObj = stampit({
  methods:{
    value(){
      return R.reject(R.is(Function), this);
    }
  }
});
exports.PureValueObj = PureValueObj;
const getValueOnly = R.reject(R.is(Function));
exports.getValueOnly = getValueOnly;
