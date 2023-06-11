	function encodeTiddlyLink(title)
	{
		return title.indexOf(" ") == -1 ? title : "[[" + title + "]]";
	};

	function encodeTiddlyLinkList(list)
	{
		if(list) {
             list = JSON.parse(list);
			var t,results = [];
			for(t=0; t<list.length; t++)
				results.push(encodeTiddlyLink(list[t]));
			return results.join(" ");
		} else {
			return "";
		}
	};

exports.name ="totaglist";
exports.run  = function(list) {

return encodeTiddlyLinkList(list)
}