 function dodock(text,aux,extra) {
	var message = document.createElement("div") ,messageBox = document.getElementById("tiddlyclip-message-box");
	if(messageBox) {
		message.setAttribute("data-action","dock");
		message.setAttribute("data-text",text||"");
		message.setAttribute("data-aux",aux||"");
		message.setAttribute("data-extra",extra||"");
		messageBox.appendChild(message);
		
		// Create and dispatch the custom event to the extension
		var event = document.createEvent("Events");
		event.initEvent("tc-send-event",true,false);
		message.dispatchEvent(event);
     return "docked";
	} else {
		return "error no  extension found";
	}
};




exports.name ="dock";
exports.run  = function(text,aux,extra) {

return dodock(JSON.stringify($tw.wiki.getTiddler(text).fields),aux,JSON.stringify($tw.wiki.getTiddler(extra).fields));
 

};
