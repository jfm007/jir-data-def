const ValueFormat = {
  text: 'text',
  number: 'number',
  email: 'email',
  url: 'url',
  boolean: 'boolean',
  color: 'color',
  date: 'date',
  time: 'time',
  DTLocal: 'datetime-local',
  password: 'password',
  month: 'month'
};

Object.freeze(ValueFormat);
exports.InputValueFormat = ValueFormat;

const FieldDataType = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean'
};
Object.freeze(FieldDataType);
exports.InputFieldDataType = FieldDataType;
