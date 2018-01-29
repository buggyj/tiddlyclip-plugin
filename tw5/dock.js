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
		//set the config to this table for mapping returned clips
		tiddlyclip.modules.tPaste.setconfig(text,aux);
     return "docked";
	} else {
		return "error no  extension found";
	}
};

exports.name ="dock";
exports.run  = function(configobj,aux,name) {
var config = $tw.wiki.getTiddler(configobj) || {fields:{}};
var other =  $tw.wiki.getTiddler(aux) || {fields:{}};
name = name || document.title;
tiddlyclip.modules.tPaste.setconfig(config.fields.text,config.fields.title);
return dodock(JSON.stringify(config.fields),name,JSON.stringify(other.fields));

};
