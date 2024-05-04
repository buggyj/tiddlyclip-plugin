exports.name ="StartWithCaps";
exports.run  = function(str) {
	return (str || "").replace(/^\S/, function(c) {return c.toUpperCase();});
}