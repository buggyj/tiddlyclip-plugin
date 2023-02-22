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


	tiddlyclip.dates=function(){
		var dates ={};
		var dateLong=    'DDD, MMM DDth, YYYY';
		var dateTimeLong='DDD, MMM DDth, YYYY at hh12:0mm:0ss am';	
		var dateShort=   'DD MMM YYYY';//journal form
		var dateTimeShort=   'YYYY/MM/DD 0hh:0mm:0ss';//journal form
		var hours = "0hh";
		var minutes = "0mm";
		
		dates.yearMonth=$tw.utils.stringifyDate(new Date()).replace(/(.*)\.(.*)/,"$1").substr(0,6);
		dates.dateTimeLong=   $tw.utils.formatDateString(new Date(),dateTimeLong);	
		dates.dateLong=       $tw.utils.formatDateString(new Date(),dateLong);		
		dates.dateShort=      $tw.utils.formatDateString(new Date(),dateShort);	       
		dates.dateComma=     dates.dateShort.toString().replace(/ /g,':');
		dates.dateTimeShort=  $tw.utils.formatDateString(new Date(),dateTimeShort);
		dates.nowhours=  	$tw.utils.formatDateString(new Date(),hours);
		dates.nowminutes=  	$tw.utils.formatDateString(new Date(),minutes);
		return dates;
	}
	tiddlyclip.getDefaultRule=function (ruleName) {
		var defaultRules = {
			defaultTid:'||||{"#type":"text/x-tiddlywiki"},{"$type":"((*@classic*??*#type*??*@abort()*))"}||no-textsaver import|',
			defaultSnip:
			'|((*@pageTitle*))/thumbprint|((*@exists(@snap)*??*@snap*))|ClippedImage|'+
			'|{"$type":"image/png"},{"$when":"((*@dateTimeShort*))"},{"$location":"((*@pageRef*))"}|[[SnapRuleMode]]|'+
			'|((*@pageTitle*))|((*@pageRef*))\\n\\n{{((*@pageTitle*))/thumbprint}}\\n\\n((*@text*))\\n\\n||'+
			'|{"$location":"((*@pageRef*))"},{"$caption":"((*@pageTitle*))"},{"$when":"((*@dateTimeShort*))"}||',
			defaultPin: '|((*@pageTitle*))|((*@pageRef*))\\n\\n[img[((*@onImage*??*@imageURL*??*@largestImgURL*))]]\\n\\n((*@text*))\\n\\n((*@exists(@userstring)*??*@userstring*))||'+
						'|{"$location":"((*@pageRef*))"},{"$caption":"((*@pageTitle*))"},{"$when":"((*@dateTimeShort*))"}|inc|'
		}
		return defaultRules[ruleName];
	}
	tiddlyclip.defaultCategories = [
		"|Tid|copy tids||defaultTid|tiddlers|",
		"|Snip|copy||defaultSnip||",
		"|Pin|Pin it||defaultPin||"
	];

	tiddlyclip.defs = {
	}
	tiddlyclip.getMultiTidTitle = function(title) {
		var p = title.indexOf("->"), container, tid;
		if(p !== -1 && title.substr(0, 8) !== "Draft of") {
			container = title.substr(0, p).trim();
			tid = title.substr(p+2).trim();
		} else {
			tid = title;
		}
		return {container:container, title:tid};
	}
	tiddlyclip.newProtoTiddler = function (){
		var tid = new $tw.Tiddler($tw.wiki.getCreationFields(),getModificationFields({}));
		var current = {fields:{}};
		for (var atr in tid.fields){ 
			current.fields[atr]=tid.getFieldString(atr);	
		}
		return current;	
	}
	tiddlyclip.modifyTW= function(fields){
		var tiddler = this.getMultiTidTitle(fields.title), tid;
		if(!tiddler.container) {
			this.modifyTWsimple(fields);
			return;
		}
		//remove container from title	
		fields.title = 	tiddler.title;
		var container =  $tw.wiki.getTiddler(tiddler.container), text;
		if (container) {
			text = JSON.parse(container.fields.text);
		} else {
			text = {tiddlers:{}};
		}
		//add the new subtiddler
		text.tiddlers[tiddler.title] = fields;
		//modify name to be the subtiddler
		text.tiddlers[tiddler.title].title = tiddler.title;
		var updateFields = {
			title: tiddler.container,
			text: JSON.stringify(text)
		};	
		$tw.wiki.addTiddler(new $tw.Tiddler($tw.wiki.getCreationFields(),container,updateFields,getModificationFields()));	

	}
	tiddlyclip.modifyTWsimple= function(fields){	
			$tw.wiki.addTiddler(new $tw.Tiddler(fields,getModificationFields(fields)));
	}
	tiddlyclip.getNewTitle= function(baseTitle,options) {
		options = options || {};
		var c = 0,
			title = baseTitle;
		while(this.tiddlerExists(title) ) {
			title = baseTitle + 
				(options.prefix || "-") + 
				(++c);
		}
		return title;
	}
	tiddlyclip.getTidContents= function(tidname) {
		var tiddler = this.getMultiTidTitle(tidname);
		if(tiddler.container) {
			tiddler = $tw.wiki.getSubTiddler(tiddler.container,tiddler.title);
		} else {
			tiddler = $tw.wiki.getTiddler(tiddler.title);
		}
		if (tiddler && tiddler.fields) {
			return tiddler.fields.text;
		}
	}
	
	tiddlyclip.getTiddlerData = $tw.wiki.getTiddlerData;
	
	tiddlyclip.deleteTiddler = function (tid){$tw.wiki.deleteTiddler(tid);}
	
	tiddlyclip.parseListFields = ":<";

	tiddlyclip.parseListField = function(text) {
		var fields = [];
		text.split(/\r?\n/mg).forEach(function(line) {

			var p = line.indexOf("="),field,value,text,q,otype=null;
			if(p > 0) {
				q = p;
				otype = line.charAt(p-1);
				if (tiddlyclip.parseListFields.indexOf(otype)!==-1) { 
					p--;
					text = line.substr(q+1).replace("\\n","\n");
					value = {};
					value.parser = otype;
					value.text = text;
				}
				else {
					value = line.substr(q+1).replace(/\\n/g,"\n");
				}			
				field = line.substr(0, p).trim();

				if(field) {
					var x ={};
					x[field] = value;
					fields.push(x);
				}
			}
		});
		return fields;
	};

	
	tiddlyclip.getTidrules= function(tidname) {
		var tiddler = this.getMultiTidTitle(tidname), data;
		if(tiddler.container) {
			tiddler = $tw.wiki.getSubTiddler(tiddler.container,tiddler.title);
		} else {
			tiddler = $tw.wiki.getTiddler(tiddler.title);
		}
		if (tiddler && tiddler.fields) {
			if (tiddler.fields.type == "application/x-bclip")	{
				var tot =  this.parseListField(tiddler.fields.text);
			data = JSON.stringify(tot);
		} else {
			data = tiddler.fields.text;
		}
			return data;
		}
	}
	//$tw.wiki.my.logEnable= function() {tiddlyclip.logit=true};
	//$tw.wiki.my.logDisable= function() {tiddlyclip.logit=false};
	tiddlyclip.log= function(x) {
		//if (tiddlyclip.logit) 
		//alert(x);
	};
	tiddlyclip.tiddlerExists= function(tidname) {
		var tiddler = this.getMultiTidTitle(tidname);
		if(tiddler.container) {
			tiddler = $tw.wiki.getSubTiddler(tiddler.container,tiddler.title);
		} else {
			tiddler = $tw.wiki.getTiddler(tiddler.title);
		}
			return(!!tiddler);
	}	
	tiddlyclip.getTiddler= function (title) {
		var tiddler = this.getMultiTidTitle(title), tid;
		if(tiddler.container) {
			tid = $tw.wiki.getSubTiddler(tiddler.container,tiddler.title);
		} else {
			tid = $tw.wiki.getTiddler(tiddler.title);
		}
		if (!tid){
			return null;
		}
		var current = {fields:{}};
		for (var atr in tid.fields){ 
			current.fields[atr]=tid.getFieldString(atr);	
		}
		return current;	
	}	
	tiddlyclip.finish=function (tids,save) {
		for (var i = 0; i < tids.length; i++){
			 this.caller.dispatchEvent({type: "tm-navigate", navigateTo:tids[i]});
			 //alert("open "+tids[i])
		 }
		if (save) this.caller.dispatchEvent({type: "tm-auto-save-wiki"}); 
	}
	tiddlyclip.importTids =function (fields) {
		var tiddler = this.getMultiTidTitle(fields.title), tid;
		if(!tiddler.container) {
			this.importTidsSimple(fields);
			return;
		}
		//remove container from title	
		fields.title = 	tiddler.title;
		var container =  $tw.wiki.getTiddler(tiddler.container), text;
		if (container) {
			text = JSON.parse(container.fields.text);
		} else {
			text = {tiddlers:{}};
		}
		//add the new subtiddler
		text.tiddlers[tiddler.title] = fields;
		//modify name to be the subtiddler
		text.tiddlers[tiddler.title].title = tiddler.title;
		var updateFields = {
			title: tiddler.container,
			text: JSON.stringify(text)
		};	
		var tid = new $tw.Tiddler($tw.wiki.getCreationFields(),container,updateFields,getModificationFields());	
		//alert(JSON.stringify(tid))
        var tiddlerFieldsArray = [tid.fields];					
		this.caller.dispatchEvent({type: "tm-import-tiddlers", param: JSON.stringify(tiddlerFieldsArray)});	
	}
	tiddlyclip.importTidsSimple =function (tidfields) {
		//tiddlyclip.log("savefile at last!");
		// Get the details from the message
        var tiddlerFieldsArray = [tidfields];					
		this.caller.dispatchEvent({type: "tm-import-tiddlers", param: JSON.stringify(tiddlerFieldsArray)});	
	}
	var doaction = function(action) {
		if (this._g("%$hasGlobalSaver") === 'true')	{
			console.log("ignored, tc handles messages");
			return "ignored, tc handles messages";
		}
		try{
			tiddlyclip.caller.invokeActionString(action,tiddlyclip.caller, tiddlyclip.lastevent,{});
		}catch(e){console.log(e)}
		return "";
	}
	var _TextReference = function (str) {return $tw.wiki.getTextReference(str);}
	
	tiddlyclip.macro={doaction:doaction,_TextReference:_TextReference};

	tiddlyclip.setMacroInterface = function (keys) {
		for (var names in keys){ 
			tiddlyclip.macro[names]=keys[names];	
		}	
		tiddlyclip.macro["_caller"]	= function () {return tiddlyclip.caller};
		tiddlyclip.macro["_lastevent"] = function () {return tiddlyclip.lastevent};
	}
	tiddlyclip.modules.tiddlerAPI.initJSinterface(tiddlyclip.setMacroInterface);
	$tw.utils.each(
		(function() {
			return $tw.wiki.filterTiddlers("[all[shadows+tiddlers]tag[$:/tags/tiddlyclip]]");
		})(),
		function(title,index) {
			try {
				var func = require(title);
				if (func.name.charAt(0) === '_') {
					alert("tc: command name invalid" + title);
				} else {
					tiddlyclip.macro[func.name]=func.run;
				}
			} catch (e) {
				alert("tc: problem with command " + title);
			} 
		}
	);	
	tiddlyclip.oparser={};
	$tw.utils.each(
		(function() {
			return $tw.wiki.filterTiddlers("[all[shadows+tiddlers]tag[$:/tags/tiddlyclipparser]]");
		})(),
		function(title,index) {
			try {
				var func = require(title);
				tiddlyclip.oparser[func.symbol]=func.run;
			} 	catch (e) {
				alert("tc: problem with command " + title);
			} 
		}
	);		
	tiddlyclip.version = function () {
		var versiontid = this.getTiddler("$:/plugins/bj/tiddlyclip");
		if (versiontid && versiontid.fields && versiontid.fields.version){
			return versiontid.fields.version
		}
		return null;
	}	
}	
var CreateTiddlerWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
	this.addEventListeners([
		{type: "tiddlyclip-create", handler: "handleTiddlyclipEvent"}
	]);
};

function getModificationFields(fields) {
	if(fields && typeof fields.modified === "string") return {};
	return $tw.wiki.getModificationFields();
}
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
	var self = this;
	// Get our parameters here we could allow an module to modify the plugin
	// Get the commands and place them in the tiddlyclip structure to expose them to the user

//	////////////end of lib//////////////////  //
	this.tabletid = this.getAttribute("$tabletid");
	this.catname = this.getAttribute("$catname");
	this.cattid = this.getAttribute("$cattid");
	this.doz = this.getAttribute("$do","");
	this.title = this.getAttribute("$title","");
    this.localrefresh = [];
	if ((this.tabletid && this.catname)||this.cattid||this.doz) {
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
	}

	this.makeChildWidgets();
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
		this.refreshSelf();
		return true;
	}
    for (var atr in changedTiddlers){
        if (this.localrefresh.indexOf(atr) !== -1) {
            this.refreshSelf();
            return true;
        }
    }
	return this.refreshChildren(changedTiddlers);
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
var onSaveFileBound = null;

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
		messageBox.removeEventListener("tiddlyclip-save-file",onSaveFileBound,false);//if the widget is re-render remove old version
		messageBox.addEventListener("tiddlyclip-save-file", onSaveFileBound = this.onSaveFile.bind(self),false);
	};
	
}

tcWidget.prototype.onSaveFile = function(event) {
		//tiddlyclip.log("savefile at last!");
		// Get the details from the message
		var message = event.target;
	    var category = message.getAttribute("data-tiddlyclip-category");
	    var pageData = message.getAttribute("data-tiddlyclip-pageData");
	    var transformed =  JSON.parse(pageData);
	    if (!transformed.data) alert("not data");
	    var currentsection = message.getAttribute("data-tiddlyclip-currentsection");
	    message.parentNode.removeChild(message);
		this.dispatchEvent({type: "tiddlyclip-create", category:category, pagedata: transformed, currentsection:currentsection});	
	}

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

