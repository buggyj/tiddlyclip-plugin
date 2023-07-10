//copy all variables with a given prefix into an object.
exports.name ="addToObject";
exports.run  = function(pack,value,name,type) {
//---------------define function below --------------------
var val, inval = value, json;
if (type == "ref" || type == 'reflist') inval = this._g(value);
if (!inval) return pack;
json = JSON.parse (pack);
if (type == 'list' || type == 'reflist') json[name] = this._parseStringArray(inval);
else json[name] = inval;

return JSON.stringify(json);
}
