exports.name ="sublink";
exports.run  = function(link,global) {
	var here = (window.document.location.toString().split("#")[0]).replace(/(.*)\/.*?$/,"$1");
	var  pos = -1;
    var link = link.replace(/ /g,"%20");
	pos = link.indexOf(here);
	if (!global && pos === 0) return "./" + link.substr(here.length+1);
	return link;
}

