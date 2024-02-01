function toObj(arr)
{
var arrobj ={};
for (var i= 0; i < arr.length; i++) arrobj[arr[i]]=null;
return arrobj;
}

exports.name = "toObjectList";
exports.run = function(data) {
var list = toObj(this._parseStringArray(data));
return JSON.stringify(list);
};
