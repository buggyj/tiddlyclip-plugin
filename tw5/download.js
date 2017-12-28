exports.name ="download";
exports.run  = function(title,text)
	{

save(text,"download",function (){alert("dl'ed")},{variables: {filename: title}});
console.log(dl);
	return "saving";
};


function save (text,method,callback,options) {
	options = options || {};
	// Get the current filename
	var filename = options.variables.filename;
	if(!filename) {
		var p = document.location.pathname.lastIndexOf("/");
		if(p !== -1) {
			filename = document.location.pathname.substr(p+1);
		}
	}
	if(!filename) {
		filename = "tiddlywiki.html";
	}
	// Set up the link
	var link = document.createElement("a");

	link.setAttribute("href",text);

	link.setAttribute("download",filename);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	// Callback that we succeeded
	callback(null);
	return true;
};
