exports.name ="mkjsontids";
exports.run = function(filter) 
{
    var tids=[], tiddlers = $tw.wiki.filterTiddlers(filter);
    for(var t=0;t<tiddlers.length; t++) {
        var tiddler = $tw.wiki.getTiddler(tiddlers[t]);
        if(tiddler) {
            var fields = new Object();
            for(var field in tiddler.fields) {
                fields[field] = tiddler.getFieldString(field);
            }
            tids.push(fields);
        }
    }
    return JSON.stringify(tids);
};
