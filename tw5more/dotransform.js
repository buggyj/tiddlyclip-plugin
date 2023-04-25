/*\
title: $:/plugins/bj/tiddlyclip/do-transform.js
type: application/javascript
module-type: widget
\*/


(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";
var Widget = require("$:/core/modules/widgets/widget.js").widget;

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



function findCategory (tableOfCats, category) {	
	var categoryRows = tableOfCats.split("\n");
	var cat = {}, tagsAndModes, pieces, catFound=false;
	var hasExt = false;
	
	for (var i=0; i<categoryRows.length; i++) { 
		pieces = categoryRows[i].split("|");// row is = |Category|Tip|Tags|Rules Tid|Modes|
		if (pieces.length==1) continue; 	//ingore blanklines
		if (pieces.length < 7) {
			alert('config table format error no of row incorrect '+categoryRows[i]);
			 return {valid:false};
		}
		if (pieces[1].substring(0,1)==='!') continue; //first row is column headings
		if (category == pieces[1]) {
			catFound = true;
			break;
		}
	} //loop end
	
	if (!catFound) {
		alert ("not found cat: "+category);
		return {valid:false};
	}
	
	return {title:pieces[4].replace(/^\[\[([\s\S]*)\]\]/,"$1"),valid:true};//remove wikiword parens if present
}

/*
Compute the internal state of the widget
*/

CreateTiddlerWidget.prototype.execute = function() {
	this.executeSelf();	
	this.makeChildWidgets();
}

CreateTiddlerWidget.prototype.executeSelf = function() {
	var self = this;
	// Get our parameters here we could allow an module to modify the plugin
	// Get the commands and place them in the tiddlyclip structure to expose them to the user

//	////////////end of lib//////////////////  //
	this.tabletid = this.getAttribute("$tabletid");
	this.catname = this.getAttribute("$catname");
	this.cattid = this.getAttribute("$cattid");
	this.doz = this.getAttribute("$do","");
	if (this.doz === "") this.doz = [this.getAttribute("$doThis","")];
	this.title = this.getAttribute("$title","");
	this.doRefreshShself = this.getAttribute("$refreshself","yes");//This may not work well if it is dynamically changed - prob. won't be
    this.localrefresh = [];
    if (!((this.tabletid && this.catname)||this.cattid||this.doz)) this.doz = "$:/plugins/bj/tiddlyclip/doTransDefault";
    
	var pagedata = {data:{}},cat,self = this;
	$tw.utils.each(this.attributes,function(attribute,name) {
		if(name.charAt(0) === "$") {
			if(name !== "$catname") self.localrefresh.push(attribute);
		} else if( name.length > 1 && name.charAt(0) === ":") {
			var namepart=name.substring (1,name.length);
			if (!tiddlyclip.getTiddler(attribute)) console.log ("refresh warning: tiddler in parameter does not exist"+attribute);
			self.localrefresh.push(attribute);
			pagedata.data[namepart] = attribute;
		} else {
			pagedata.data[name] = attribute;
		}
	});
	if (this.doz) {
		cat = {tidtitle:this.title,doz:this.doz,modes:["immediate"]};
	}
	else if (this.cattid) {
		cat = {title:this.cattid,modes:["immediate"]};
	}
	else {
		cat = findCategory(tiddlyclip.getTidContents(this.tabletid),this.catname);//extract cat from table and make it 'immediate' only 
		if (!cat.valid){alert("cat rule not found"); return;}
		cat.modes=["immediate"];
	}
	pagedata.data.category=this.catname;
	var temptids = tiddlyclip.modules.tPaste.paste.call(this, null,pagedata,null,null,cat)||[];
	for (var i =0; i< temptids.length; i++) {	
		var title = temptids[i].title;
		self.setVariable(title,temptids[i].text);	
		$tw.utils.each(temptids[i],function(val,key) {
			//build tiddler field references 
			var newkey = title+'!!'+key;
			self.setVariable(newkey,val);
		});
	}
};

function settimers (delay, callback) {
	var next = new Date(), timejson = {}, interval = 0;
	interval = parseInt(delay);
	if (interval > 0) {
		next.setSeconds(next.getSeconds() + interval);	
		timejson.timeout = next.toJSON() ;
		timejson.onTimeout = callback;
		if (!$tw.utils.bjGlogalTimer) {
			alert ("bjGlogalTimer missing");//maybe better to replace with a timer
			return;
		}
		$tw.utils.bjGlogalTimer.register(timejson);
	}
}

CreateTiddlerWidget.prototype.handleTiddlyclipEvent = function(event) {
	if (event.localsection) {
		if (event.delay) {
			settimers (event.delay, function (){
				tiddlyclip.modules.tPaste.paste.call(this,event.category,event.pagedata,null,event.localsection);
			});
		}
		else {
			tiddlyclip.modules.tPaste.paste.call(this,event.category,event.pagedata,null,event.localsection);
		}
	} else {
		tiddlyclip.modules.tPaste.paste.call(this,event.category,event.pagedata,event.currentsection);	
	}
	return false;
};
		
/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
CreateTiddlerWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(Object.keys(changedAttributes).length) {
		if (this.doRefreshShself === 'yes') {
			this.refreshSelf();
			return true;
		}
		else this.executeSelf();
	}
    for (var atr in changedTiddlers){
		//compare with parameters that can be refreshed
        if (this.localrefresh.indexOf(atr) !== -1) {
            if (this.doRefreshShself === 'yes') {
				this.refreshSelf();
				return true;
			} else {
				this.executeSelf();
				break;
			}
        }
    }
	return this.refreshChildren(changedTiddlers);
};

exports["do-transform"] = CreateTiddlerWidget;
})();
