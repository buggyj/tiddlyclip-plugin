function encodeTiddlyLink(title)
{
	return title.indexOf(" ") == -1 ? title : "[[" + title + "]]";
};

exports.name = "nth";
exports.run = function(data,n) {
var item = (this._parseStringArray(data,true))[n];//allow duplicates
return encodeTiddlyLink(item);
};
