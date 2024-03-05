exports.name ="escaperegx";
exports.run  = function(string) {
  return string.replace(/[\]\\.*+?^${}()|[]/g, "\\$&");
}