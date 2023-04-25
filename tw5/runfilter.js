exports.name ="runfilter";
exports.run = function(filter) 
{
return this._encodeTiddlyLinkList($tw.wiki.filterTiddlers(filter));
};