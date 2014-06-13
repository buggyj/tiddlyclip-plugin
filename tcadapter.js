/*\
title: $:/plugins/bj/tiddlyclip/tcadapter.js
type: application/javascript
module-type: widget


\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

if($tw.browser) {
	require("$:/plugins/bj/tiddlyclip/tidpaste.js");
}
var CreateTiddlerWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
	this.addEventListeners([
		{type: "tiddlyclip-create", handler: "handleTiddlyclipEvent"}
	]);
};


/*
Inherit from the base widget class
*/
CreateTiddlerWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
CreateTiddlerWidget.prototype.render = function(parent,nextSibling) {
	this.parentDomNode = parent;
	this.computeAttributes();
	this.execute();
	this.renderChildren(parent,nextSibling);
}

CreateTiddlerWidget.prototype.getTiddlerList = function() {
	var defaultFilter = "[all[shadows+tiddlers]tag[$:/tags/tiddlyclip]]";
	return this.wiki.filterTiddlers(defaultFilter,this);//BJ FIXME should not allow user defined filters
}
/*
Compute the internal state of the widget
*/
CreateTiddlerWidget.prototype.execute = function() {
	// Get our parameters here we could allow an module to modify the plugin
	// Get the commands and place them in the tiddlyclip structure to expose them to the user
	this.list = this.getTiddlerList();
	$tw.utils.each(this.list,function(title,index) {
		try {
			var func = require(title);
			tiddlyclip[func.name]=func.run;
		} catch (e) {
			alert("tc: problem with command " + title);
		} 
	});		
	this.makeChildWidgets();
};

CreateTiddlerWidget.prototype.handleTiddlyclipEvent = function(event) {

	tiddlyclip.modules.tPaste.paste(event.category,event.pagedata,event.currentsection);	
	return false;
};
		
/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
CreateTiddlerWidget.prototype.refresh = function(changedTiddlers) {
	//var changedAttributes = this.computeAttributes();
	if(false) {
		this.refreshSelf();
		return true;
	} else {
		return this.refreshChildren(changedTiddlers);		
	}
};
exports.createclip = CreateTiddlerWidget;

})();
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var tcWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
tcWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
tcWidget.prototype.render = function(parent,nextSibling) {
	var doc = document;
	var self =this;
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
		//tiddlyclip.log("savefile at last!");
		// Get the details from the message
		var message = event.target;
	    var category = message.getAttribute("data-tiddlyclip-category");
	    var pageData = message.getAttribute("data-tiddlyclip-pageData");
	    var transformed =  JSON.parse(pageData);
	    if (!transformed.data) alert("not data");
	    var currentsection = message.getAttribute("data-tiddlyclip-currentsection");					
		self.dispatchEvent({type: "tiddlyclip-create", category:category, pagedata: transformed, currentsection:currentsection});	
	}

};

/*
Compute the internal state of the widget
*/
tcWidget.prototype.execute = function() {

};

/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
tcWidget.prototype.refresh = function(changedTiddlers) {

		return false;		

};

exports["tcadapter"] = tcWidget;

})();
