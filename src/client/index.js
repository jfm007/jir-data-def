/**
 * all the client logic to be extracted to a indepened lib
 */
module.exports = {
  ... require('./processor'),
  ... require('./dataDef'),
  ... require('./inputDef'),
  ... require('./DefEnums')
};
