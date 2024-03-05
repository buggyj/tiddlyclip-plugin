exports.name ="split";
exports.run  = function(base,match,index) {
	return (base.split(match))[index];
}
