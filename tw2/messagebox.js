tiddlyclip.modules.messagebox = (function () {


	var tPaste;
	
//on start
	tPaste	= tiddlyclip.modules.tPaste;
	var doc = document;
	{
		// Inject the message box
		var messageBox = doc.getElementById("tiddlyclip-message-box");
		if(!messageBox) {
			messageBox = doc.createElement("div");
			messageBox.id = "tiddlyclip-message-box";
			messageBox.style.display = "none";
			doc.body.appendChild(messageBox);
		}
		// Attach the event handler to the message box
		messageBox.addEventListener("tiddlyclip-save-file", onSaveFile,false);
	};
	function onSaveFile(event) {
		tiddlyclip.log("savefile at last!");
		// Get the details from the message
		var message = event.target;
	    var category = message.getAttribute("data-tiddlyclip-category");
	    var pageData = message.getAttribute("data-tiddlyclip-pageData");
	    var transformed =  JSON.parse(pageData);
	    if (!transformed.data) alert("not data");
	    var currentsection = message.getAttribute("data-tiddlyclip-currentsection");
		tPaste.paste(category,transformed,currentsection);	
	}

}());
