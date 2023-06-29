exports.name ="get";
exports.run  = function(tiddler,field)
	{
        field=field||"text";
        var tid = $tw.wiki.getTiddler(tiddler);
	if (tid) {return tid.fields[field]||""};
};