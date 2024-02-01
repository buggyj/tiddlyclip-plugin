function toObj(arr)
{
var arrobj ={};
for (var i= 0; i < arr.length; i++) arrobj[arr[i]]=null;
return arrobj;
}

exports.name = "toDoubleList";
exports.run = function(data) {
var lists = $tw.utils.parseFields(data);
for (var i in lists) {
   if (lists[i]) lists[i] = toObj(this._parseStringArray(lists[i]));
}
return JSON.stringify(lists);
};
