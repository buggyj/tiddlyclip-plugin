 function show(action,text) {
	var message = document.createElement("div") ,messageBox = document.getElementById("tiddlyclip-message-box");
	if(messageBox) {
		message.setAttribute("data-action",action);
		message.setAttribute("data-text",text);
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
exports.run  = function(action,text) {

if (!action) return "nothing to do!";

return  show(action,text);


};
