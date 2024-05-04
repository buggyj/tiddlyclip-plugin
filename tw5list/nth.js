function encodeTiddlyLink(title)
{
	return title.indexOf(" ") == -1 ? title : "[[" + title + "]]";
};

exports.name = "nth";
exports.run = function(data,n,onEmpty) {
var onEmpty = onEmpty||"",items;
if (n < 0) return onEmpty;
items = this._parseStringArray(data,true);//allow duplicates
if (items.length < n ) return onEmpty;
return encodeTiddlyLink(items[n]);
};
