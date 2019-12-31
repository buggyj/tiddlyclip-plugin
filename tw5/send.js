 function send(action,text,aux,extra) {
	var message = document.createElement("div") ,messageBox = document.getElementById("tiddlyclip-message-box");
	if(messageBox) {
		message.setAttribute("data-action",action);
		message.setAttribute("data-text",text||"");
		message.setAttribute("data-aux",aux||"");
		message.setAttribute("data-extra",extra||"");
		messageBox.appendChild(message);
		
		// Create and dispatch the custom event to the extension
		var event = document.createEvent("Events");
		event.initEvent("tc-send-event",true,false);
		message.dispatchEvent(event);
     return "sent";
	} else {
		return "error no  extension found";
	}
};




exports.name ="send";
exports.run  = function(action,text,aux,extra) {
	if (!action) return "nothing to do!";
	//if docking, set the config to this table for mapping returned clips
	if (action === "dock") {
		var ob = JSON.parse(text),opts = JSON.parse(aux);
		tiddlyclip.modules.tPaste.setconfig(ob.text,ob.title);
		tiddlyclip.modules.tPaste.setopts(opts.text,opts.title);
		extra = extra || document.title;
	}
	return  send(action,text,aux,extra);
};
