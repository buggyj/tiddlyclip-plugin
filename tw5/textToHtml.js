
exports.name ="textoHTML";
exports.run  = function(text,mode) {
var getValueAsHtmlWikified = function(text,mode) {
	return $tw.wiki.renderText("text/html","text/vnd.tiddlywiki",text,{
		parseAsInline: mode !== "block",
		parentWidget: tiddlyclip.caller
	});
};
return getValueAsHtmlWikified(text,mode)
}