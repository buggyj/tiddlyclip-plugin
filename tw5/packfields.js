//copy all variables with a given prefix into an object.
exports.name ="packFields";
exports.run  = function() {
var _vars=this._gAll();
//---------------define function below --------------------
var pack = {}
if (! _vars['$']) return '{}';
for (var i in  _vars['$'] ) {
     pack[i] = _vars['$'][i]
}
if (pack.tags) pack.tags=this._parseStringArray(pack.tags);
return JSON.stringify(pack);
}
