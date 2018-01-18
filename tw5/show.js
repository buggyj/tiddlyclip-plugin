 function show(action,text,aux,extra) {
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
     return "shown";
	} else {
		return "error no  extension found";
	}
};




exports.name ="show";
exports.run  = function(action,text,aux,extra) {

if (!action) return "nothing to do!";

return  show(action,text,aux,extra);


};
