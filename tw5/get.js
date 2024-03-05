exports.name ="get";
exports.run  = function(tiddler,field,list) {
	var field=field||"text";
	var tid = $tw.wiki.getTiddler(tiddler);
	var st = "";
	if (!tid) return "";//should we abort??

	if (list) {
		if (Array.isArray(tid.fields[field])) {
			let fld =tid.fields[field]||[];
			for (var i=0; i < fld.length; i++) st = st + " [["+fld[i]+"]]";
			return st.trim();
		} 
	}
	return tid.fields[field]||"";
};