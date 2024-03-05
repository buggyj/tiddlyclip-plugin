var tiddlerExists= function(tidname) {

			var tiddler = $tw.wiki.getTiddler(tidname);
			return(!!tiddler);
	}


exports.name ="newtitlespace";
exports.run  = function(baseTitle,ext,noesc) {
	var i,dot="";
    if (!noesc) baseTitle =  baseTitle.replace(/#|<|>|\:|\"|\||\?|\*|\/|\\|\^/g,"_");
	if (ext) dot = ".";
	ext = ext ||"";
	var c = 0,
	title = baseTitle +dot+ ext;
	while(tiddlerExists(title) ) {
		title = baseTitle + " " + (++c) +dot+ ext;
	}
	return title;
}