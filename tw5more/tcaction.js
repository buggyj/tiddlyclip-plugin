/*\
title: $:/plugins/bj/tiddlyclip/tcaction.js
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
	this.tabletid = this.getAttribute("$tabletid");
	this.catname = this.getAttribute("$catname");
	this.delay = this.getAttribute("$delay")||null;
	this.delayms = this.getAttribute("$delayms")||null;
	this.filter = this.getAttribute("$filter")||null;
	this.tag = this.getAttribute("$tag")||null;
	if (this.tag) {
		this.filter = "[tag["+this.tag+"]]";
	}
	if (this.delayms) {
		this.delayms = parseInt(this.delayms);
		if (isNaN(this.delayms)) { this.delayms = 0; }
	}
	this.sendmssg = this.getAttribute("$sendmssg")||null;
	if (this.delay) this.delay *= 60; //mins to seconds
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
ToDoWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes["$tabletid"] || changedAttributes["$catname"]|| changedAttributes["$delay"]) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

/*
Invoke the action associated with this widget
*/
ToDoWidget.prototype.invokeAction = function(triggeringWidget,event) {
	var self = this,
		options = {};
	var pagedata = {data:{}};
	$tw.utils.each(this.attributes,function(attribute,name) {
		if(name.charAt(0) !== "$") {
			pagedata.data[name] = attribute;
		}
	});
	if (this.filter) {
		pagedata.remoteTidArr = $tw.wiki.filterTiddlers(this.filter);
		if (this.tag) pagedata.filterOnTag = this.tag;//maybe useful to know?
	}
	if (!this.sendmssg) {
		pagedata.data.category=this.catname;
		tiddlyclip.modules.tPaste.paste.call(this,this.catname,pagedata,null,this.tabletid);console.log("direct2 call");
	} else if (this.delayms) {
		pagedata.data.category=this.catname;
		setTimeout(() => {self.dispatchEvent({type: "tiddlyclip-create", category:self.catname, pagedata: pagedata, currentsection:null, 
												localsection:self.tabletid, delay:self.delay});console.log("delay call")},this.delayms);
	} else {
		pagedata.data.category=this.catname;
		self.dispatchEvent({type: "tiddlyclip-create", category:this.catname, pagedata: pagedata, currentsection:null, localsection:this.tabletid, delay:this.delay});//console.log("message2 call");
	}
	return true; // Action was invoked
};

ToDoWidget.prototype.invokeMsgAction = function(param) {
	return this.invokeAction(this); 
}

exports["action-tiddlydo"] = ToDoWidget;

})();
