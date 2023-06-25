

exports.name ="textoHTML";
exports.run  = function(text,mode) {
var result;
var getValueAsHtmlWikified = function(text,mode) {
	return $tw.wiki.renderText("text/html","text/vnd.tiddlywiki",text,{
		parseAsInline: mode !== "block",
		parentWidget: tiddlyclip.caller
	});
};
tiddlyclip.disabled = true;
try {
	result = getValueAsHtmlWikified(text,mode);
} catch(e) {
	console.log(e);
}
tiddlyclip.disabled = false;
return result;
}