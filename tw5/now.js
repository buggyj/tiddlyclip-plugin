exports.name = "now";
exports.run = function(format) {
	return $tw.utils.formatDateString(new Date(),format || "0hh:0mm, DDth MMM YYYY");
};