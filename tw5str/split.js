exports.name ="split";
exports.run  = function(base,match,index) {
	var items;
	if (index < 0) return "";
	items = base.split(match);
	if (items.length < index) return "";
	return items[index];
}
