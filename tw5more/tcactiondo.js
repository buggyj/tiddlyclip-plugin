/*\
title: $:/plugins/bj/tiddlyclip/tcactiondo.js
type: application/javascript
module-type: widget
\*/


(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var ToDoWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
ToDoWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
ToDoWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();
};

/*
Compute the internal state of the widget
*/
ToDoWidget.prototype.execute = function() {
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
ToDoWidget.prototype.refresh = function(changedTiddlers) {
	return true;
};

/*
Invoke the action associated with this widget
*/
ToDoWidget.prototype.invokeAction = function(triggeringWidget,event) {
	var self = this, cat, options = {};
	var pagedata = {data:{}};
	this.computeAttributes();
	this.doz = this.getAttribute("$do","");
	if (this.doz === "") this.doz = [this.getAttribute("$doThis","")];
	$tw.utils.each(this.attributes,function(attribute,name) {
		if(name.charAt(0) !== "$") {
			pagedata.data[name] = attribute;
		}
	});
	cat = {tidtitle:null,doz:this.doz,modes:["nosave"]};
	tiddlyclip.modules.tPaste.paste.call(this, null,pagedata,null,null,cat)
	return true; // Action was invoked
};

ToDoWidget.prototype.invokeMsgAction = function(param) {
	return this.invokeAction(this); 
}

exports["action-tcdo"] = ToDoWidget;

})();
