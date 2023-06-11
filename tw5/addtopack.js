//copy all variables with a given prefix into an object.
exports.name ="addToPack";
exports.run  = function(pack,value,name,type) {
//---------------define function below --------------------
var val, inval = this._g(value), json;
if (!inval) return pack;
json = JSON.parse (pack);
if (type == 'list') json[name] = this._parseStringArray(inval);
else json[name] = inval;

return JSON.stringify(json);
}
