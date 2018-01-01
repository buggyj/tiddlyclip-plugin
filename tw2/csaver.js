
tiddlyclip.macro.csaver  = function(title,text)
	{

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

	link.setAttribute("href","data:image/png;base64,"+text);

	link.setAttribute("download",filename);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	// Callback that we succeeded
	callback(null);
	return true;
};



 function csaver(text,cname,subdir,callback) {
	var messageBox = document.getElementById("csaver-message-box");
	if(messageBox) {
		cname = cname.replace(/<|>|\:|\"|\||\?|\*|\/|\\|\^/g,"_");
		// Create the message element and put it in the message box
		var message = document.createElement("div");
		message.setAttribute("data-csaver-contentname",decodeURIComponent(cname));
		message.setAttribute("data-csaver-content",text);
		message.setAttribute("data-csaver-subdir",subdir);
		message.setAttribute("data-csaver-taget-type","image/png");
		messageBox.appendChild(message);
		// Add an event handler for when the file has been saved
		message.addEventListener("csaver-have-saved-file",function(event) {
			callback(null);
		}, false);
		// Create and dispatch the custom event to the extension
		var event = document.createEvent("Events");
		event.initEvent("csaver-save-file",true,false);
		message.dispatchEvent(event);
     return subdir?subdir+'/'+cname:cname;
	} else {
		return "error no saver extension found";
	}
};





var subdir = "media";
if (!text) return "";
return csaver(text,title,subdir,function (){alert("dl'ed")});


};
