exports.name ="headlist";
exports.run  = function(list,onEmpty) {
	var Items = this._parseStringArray(list);
    if (Items.length === 0) return onEmpty;
	return Items[0];
}
