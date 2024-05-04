function encodeTiddlyLink(title)
{
	return title.indexOf(" ") == -1 ? title : "[[" + title + "]]";
};

exports.name ="headlist";
exports.run  = function(list,onEmpty) {
	var Items = this._parseStringArray(list);
	var onEmpty = onEmpty||"";
    if (Items.length === 0) return onEmpty;
	return encodeTiddlyLink(Items[0]);
}
