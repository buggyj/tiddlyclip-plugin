/*\
title: $:/plugins/bj/tiddlyclip/tcmenu.js
type: application/javascript
module-type: widget
\*/


(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";


var getContextMenuRoot = function() {
	
	var menuContext = document.getElementById("tcContextMenu");
	if(!menuContext) {
		menuContext= document.createElement("div");
		menuContext.style.display = "none";
		menuContext.style.zIndex = "9999";
		menuContext.className="tccmenu";
		menuContext.style.position = "absolute";
		menuContext.setAttribute("id","tcContextMenu");
		document.body.appendChild(menuContext);
	}
	return menuContext;
	
}; 


var menuRoot = null;

var makeContextMenu = function(source) {
	var menuRoot = getContextMenuRoot();
	//clear old contents before adding new
	menuRoot.innerHTML = "";
	this.menu = document.createElement("ul");
	this.source = source;
	menuRoot.appendChild(this.menu);
}


makeContextMenu.prototype.show= function (){
	var menuRoot = getContextMenuRoot();
	menuRoot.style.left = event.pageX + "px";
	menuRoot.style.top = event.pageY + "px";
	menuRoot.style.display = "block";
}


makeContextMenu.prototype.createMenuItem= function (item){
	var menuItem = 	document.createElement("li");
	var link = document.createElement("a");
	var icon;
	if (item.display && item.display !== "") link.innerHTML = this.source.getValueAsHtmlWikified(item.display,true);
	else {
		if (item.icon) {
			link.innerHTML = item.icon;
		}
		link.appendChild(document.createTextNode(item.title));
	}
	menuItem.appendChild(link);
	this.menu.appendChild(menuItem);
	menuItem.addEventListener('click', (e) => {
		var menuRoot = getContextMenuRoot();
		menuRoot.style.display = "none";
		item.onclick(item.title,e);
	});

}

var hasMode = function  (cat,mode) {
	if (!cat.modes) return false;
		for (var i=0; i< cat.modes.length;i++)
			if (mode === cat.modes[i]) return true;
		return false;
}
	
var includeNodeType = function (cat, nodeName) {
	
	if (hasMode (cat,"@link")) {
		if (nodeName === "A" || nodeName === "a") return true;
		return false;
	}
	if (hasMode (cat, "@notlink") && (nodeName === "A" || nodeName === "a")) return false;
	return true;
}

makeContextMenu.prototype.createCategoryPopups= function (config, widget, selectedtext,e){
	var pagedata = Object.assign({}, widget.pagedata);
	//replace data to stop caching of selectedtext
	pagedata.data = Object.assign({}, pagedata.data);	
	if (Object.keys(config).length >0) {

		for(var m in config) {
			var catsel;
			if (!includeNodeType(config[m],e.target.nodeName)) continue;
			catsel = (function(x) {
				return function(catname,e){
					var rules,type;
					if (selectedtext) pagedata.data.selectedtext = selectedtext;
					pagedata.e=widget.event;
					pagedata.data.category=catname;//console.log(widget.contextconfig)
					rules = $tw.wiki.getTiddler(config[catname].rules||"");
					if (rules && rules.fields ) type = rules.fields.type ||"";
					else type = "";
					if (type == "application/x-bclip")	{
						var cat = {tidtitle:'',doz:config[catname].rules,modes:[]};
						tiddlyclip.modules.tPaste.paste.call(widget, null,pagedata,null,null,cat)
					}
					else
					   tiddlyclip.modules.tPaste.paste.call(widget,catname,pagedata,null,widget.contextconfig);
				};
			})(m);
	
			this.createMenuItem({title:m, onclick:catsel, icon:config[m].icon,display:config[m].display});
		}
	
	}

}
	function clickhandler2(event){
		var menuRoot = getContextMenuRoot();
		menuRoot.style.display = "none";
		document.removeEventListener('contextmenu', clickhandler2);//console.log("aremvoed handle2");
		document.removeEventListener('click', clickhandler);//console.log("aremvoed handle");
	}
	function clickhandler(event){
		var menuRoot = getContextMenuRoot();
		menuRoot.style.display = "none";
		document.removeEventListener('click', clickhandler);//console.log("remvoed handle");
		document.removeEventListener('contextmenu', clickhandler2);//console.log("remvoed handle2");
	}
var Widget = require("$:/core/modules/widgets/widget.js").widget;

var tcWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};


tcWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/

tcWidget.prototype.getValueAsHtmlWikified = function(text,mode) {
	
	function copyvars(obj, prefix) {
	  const result = {};

	  for (const key in obj) {
		if (key.startsWith(prefix)) {
		  result[key] = obj[key].value;
		}
	  }

	  return result;
	}	
	
	return $tw.wiki.renderText("text/html","text/vnd.tiddlywiki",text,{
		parseAsInline: mode !== "block",
		parentWidget:this,
		variables: copyvars(this.variables,"tcmenu")
	});
};
tcWidget.prototype.contextmenu = function (event) {
	var menu,selectedtext = getSelection().toString().trim();
	var menuRoot = getContextMenuRoot();
			if(this.matchSelector && !event.target.matches(this.matchSelector)) {
				return false;
			}
	//debounce when menu is showing
	if (menuRoot.style.display === "block") {event.preventDefault();return;}
    this.event = event;
	menu = new makeContextMenu(this);
	menu.createCategoryPopups(this.activeCategories,this,selectedtext,event);
	menu.show();//console.log("in contextmenu")

	document.addEventListener('click', clickhandler);

	event.preventDefault();
	window.setTimeout(function () {document.addEventListener('contextmenu', clickhandler2)},0);
}

tcWidget.prototype.render = function(parent,nextSibling) {

	this.computeAttributes();
	this.activeCategories = {};
	this.execute();
	this.parentDomNode = parent;
	parent.addEventListener("contextmenu", this.contextmenu.bind(this));
	

}

tcWidget.prototype.loadSectionFromFile = function(activeSection) {
		
        this.sectionNames=['Default'];
        var sectionStrgs, catIsNotSet = true;

		//if (activeSection===0) defaultCategories();//load default rules defined by this program 

		var content = $tw.wiki.getTiddlerText(this.contextconfig);//where all sections are defined
		if (content) {
			sectionStrgs = content.split('\n!'); //sections begin with a title, eg !mysection, followed by a table of categories
			//the ! has not be removed by the split in the case of the first section
			if (sectionStrgs[0].charAt(0) == "!") {
				sectionStrgs[0] = sectionStrgs[0].substr(1);
			} else  { //put tid name as section
				sectionStrgs[0] = this.contextconfig + "\n" + sectionStrgs[0];
			}
				
			//remember all section names - used to allow the user to see sections and change which is active
			for (var  j =0; j< sectionStrgs.length;  j++) { 
				
				this.sectionNames[j] = sectionStrgs[j].split('\n')[0];//first line is name
				if ( j >= activeSection && catIsNotSet && sectionStrgs[j].indexOf('|') !== -1) {
					// assumes that '|' means there is a def table otherwise move to next sections def table
					//only load active categories
					this.loadActiveSectionCategories(sectionStrgs[j].replace(/(^\|)*\n/,''));//strip of section name from first line
					catIsNotSet = false;
				}
						
			}	

		}else {
			//defaultCategories();
			alert("menu config tiddler not found");
		}
	}
	 tcWidget.prototype.loadActiveSectionCategories = function(table) {
		var categoryRows = table.split("\n");
		var cat = {};
		var tagsAndModes;
		var pieces;//console.log("estrart");
		for (var i=0; i<categoryRows.length; i++) {
			cat = {rules:null,valid:true};
			pieces = categoryRows[i].split("|");// form |Category|Tip|Tags|Rules Tid|Modes|
			if (pieces.length==1) continue; //ingore blanklines
			if (pieces.length < 5) {alert('config table format error no of row incorrect'); return;}
			if (pieces[1].substring(0,1)==='!') continue; //first row is column headings
			var catName = pieces[1]; 
			var extratrans = catName.replace(/.*\{\{(.+)\}\}.*/,"$1");
			if (extratrans !== catName) { 
				catName = catName.replace(/\{\{.+\}\}/,"");
				cat.icon = $tw.wiki.getTiddlerText(extratrans.trim());		
			} 
			else cat.icon = null;
			if (pieces.length > 5) { //extension -remember that we expect a final blank piece and blank start piece;
                 cat.valid = true;
			} else return;//error
			
			cat.modes= this.extractModes(pieces[5]);
			cat.tags = pieces[3];
			cat.display  = pieces[2];
			cat.rules = pieces[4].replace (/^\[\[([\s|\S]*)\]\]$/,"$1"); //remove  brackets;
			/*if (hasModeBegining(cat,"debug")) {
				debugcontrol(cat);
			} else {*/
				this.activeCategories[catName] = cat;
			//}
		} 
		return;
	}
	
	tcWidget.prototype.extractModes = function(tagString) {
		var modes =[], tList = tagString.split(' ');
		for (var i=0; i< tList.length; i++) {
			modes[i] = tList[i].trim();
		}
		return modes;
	}
/*
Compute the internal state of the widget
*/
tcWidget.prototype.execute = function() {
	var self = this;
	this.contextconfig = this.getAttribute("$contextconfig");
	this.matchSelector = this.getAttribute("$matchSelector"),

	this.pagedata = {data:{}};
	$tw.utils.each(this.attributes,function(attribute,name) {
		if(name.charAt(0) !== "$") {
			self.pagedata.data[name] = attribute;
		}
	});
this.loadSectionFromFile(0);
};
/*
Selectively refreshes the widget if needed. Returns true if the widget or any of its children needed re-rendering
*/
tcWidget.prototype.refresh = function(changedTiddlers) {
//console.log("refresh");
	var changedAttributes = this.computeAttributes(), menuRoot = getContextMenuRoot();
	if (menuRoot.style.display !== "none"){
		document.removeEventListener('contextmenu', clickhandler2);//console.log("aremvoed handle2");
		document.removeEventListener('click', clickhandler);//console.log("aremvoed handle");
		menuRoot.style.display = "none";
	}

	if($tw.utils.count(changedAttributes) > 0 || changedTiddlers[this.contextconfig]) {
		this.refreshSelf();
		return true;
	}
	return false;		

};

exports["tcmenu"] = tcWidget;
})();
