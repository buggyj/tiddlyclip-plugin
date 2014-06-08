/*\
title: $:/plugins/bj/tiddlyclip.js
type: application/javascript
module-type: widget
\*/
/***
|Name|TiddlyClipPlugin|
|Version|0.0.1|
|Author|BJ|
|Date:|26-05-2014|
|Type|plugin|
|Overrides||
|CoreVersions|2.6.0 5.0.12|
!Description
used with browser AddOn to gather clips of webpages and add them to a tiddlywiki.
Used with configuaration tiddlers to provide flexibility in the manner in which the clips are added,
and provide options via the browser's context menu system.
!!!!!Code
***/
//{{{
(function(){
var tiddlyclip={};
tiddlyclip.modules={};
tiddlyclip.log= function(x) {};
var vers2=false;
if (typeof version == 'undefined') vers2=false;
else
 vers2=(version.major ==2) ?true:false;
if (vers2||$tw.browser) {
function MyError(message){
    this.message = message;
}

MyError.prototype = new Error();

tiddlyclip.modules.tPaste = (function () {

	var api = 
	{
		onLoad:onLoad,				paste:paste,				
		hasMode:hasMode,			loadSectionFromFile:loadSectionFromFile,
		getTidContents:getTidContents,
		hasModeBegining:hasModeBegining
	};
	var   tiddlerObj, twobj,   defaults;

	function onLoad() {
		tiddlerAPI 	= tiddlyclip.modules.tiddlerObj;
		twobj		= tiddlyclip.modules.twobj;
		defaults	= tiddlyclip.modules.defaults;
		toTiddlyText= tiddlyclip.modules.convert;
	}
	api.BeforeSave = {};
	api.AfterSub = {};
	
	var activeCategories= {};
    var currentsection;

	function loadActiveSectionCategories(table, defaultRule) {	
		var categoryRows = table.split("\n");
		var cat = {};
		var hasExt = false;
		var tagsAndModes;
		var pieces;;
		for (var i=0; i<categoryRows.length; i++) {
			cat = {rules:null,valid:true};
			pieces = categoryRows[i].split("|");// form |Category|Tip|Tags|Rules Tid|Modes|
			if (pieces.length==1) continue; //ingore blanklines
			if (pieces.length < 5) {alert('config table format error no of row incorrect'); return;}
			if (pieces[1].substring(0,1)==='!') continue; //first row is column headings
			var catName = pieces[1]; 
			if (pieces.length > 5) { //extension -remember that we expect a final blank piece and blank start piece;
				var ruleDefs =  getTidContents(pieces[4]);
				if (ruleDefs == null) ruleDefs = (pieces[4].substring(0,7)==='default') ? defaults.getDefaultRule(pieces[4]):null;
				//var ruleDefs = defaultRule? defaultRule: getTidContents(pieces[4]);
				if ((ruleDefs == null) && (catName ==="tid"))  ruleDefs= defaults.getDefaultRule('defaultTid');
				else if ((ruleDefs == null) && (catName ==="web"))  ruleDefs= defaults.getDefaultRule('defaultWeb');
				else if ((ruleDefs == null) && (catName ==="text"))  ruleDefs= defaults.getDefaultRule('defaultText');
				if (ruleDefs != null)  {	
					try {
						cat.rules=addSequenceOfRules(ruleDefs,catName);//one or more
					} 
					catch(e) {
						cat.valid = false;//dont run tiddler insertion code
					}
				}
				else {
					cat.valid = false;
				}
			} else {cat.valid = false;}//error
			if (cat.valid) {
				cat.modes= extractModes(pieces[5]);
				cat.tags = pieces[3];
				cat.tip  = pieces[2];
			}
			activeCategories[catName] = cat;
		} 
		return hasExt;
	}

	function extractModes(tagString) {
		var modes =[], tList = tagString.split(' ');
		for (var i=0; i< tList.length; i++) {
			modes[i] = tList[i].trim();
		}
		return modes;
	}

	function hasMode (cat,mode) {
			if (!cat.modes) return false;
		for (var i=0; i< cat.modes.length;i++)
			if (mode === cat.modes[i]) return true;
		return false;
	}
	function hasModeBegining (cat,mode) {
			if (!cat.modes) return false;
		for (var i=0; i< cat.modes.length;i++)
			if (mode === cat.modes[i].substr(0,mode.length)) return true;
		return false;
	}
//////////////////////////////////////		
	function addSequenceOfRules(tiddler,cat) { 		
		var ruleDefs = tiddler.trim().split("\n");
		var arrayOfRules =[];
		var firstRow=0,firstrule=0;;
		if (ruleDefs[firstRow].substring(0,2)==='$:') {
			arrayOfRules[0]= {valid:true};
			try {
					if (!vers2) {
						arrayOfRules[0].run=require(ruleDefs[firstRow]).run;
						firstrule=1;
					}
			} catch(e) {alert("no extmodule found")};
			firstRow=2;
			if (ruleDefs.length<2) return arrayOfRules;
		}
        if (ruleDefs[firstRow].substring(0,2)==='|!') firstRow += 1;// row  maybe column titles, ie the string |!Title|!Body|!Tags|!Modes|
		for (var i=firstrule,j=firstRow; j<ruleDefs.length; i++,j++) {
			arrayOfRules[i]=new  Rule(ruleDefs[j]);
		}
		return arrayOfRules;
	}

	function Rule(defRule, modes) {
		//INPUT DEF:
		//defRule is a string of the form '|Title|Body|Tags|Fields|Init values|Modes|' or a struture {	title:'..', body:'..', tags:'..'}
		//extracts subst patterns for title, body, tags. Also extracts modes
		var Tid;
		var whiteSpace = /^\s+|\s+$/g;//use trim
		
		if ((typeof defRule) =='string' ) { //we has a row definition
			//remove triple quotes around any | - these were needed to stop TW thinking they were table elements
			var pieces = defRule.replace(/\"\"\"\|\"\"\"/g,"&bar;").split("|");
			if  (pieces.length <6) {alert('short:'+defRule);throw new Error('Invalid Rule');} //error malformeed TODO: inform the user
			for (var i=1;i<6;i++) {
				pieces[i]= pieces[i].replace(whiteSpace,"").replace("&bar;","|"); 
				if (pieces[i] == null) {
					if (i==1) throw new Error('Invlid Rule');//must define a name for the tid
				} else 	if (pieces[i].substring(0,2)==='[[') { // -there is a definition in a seperated tiddler - go get it
				    var temp=pieces[i].replace (/\[\[([\s|\S]*)\]\]/,"$1"); //remove  brackets
					if (temp.substring(0,2) !== '[[') {
						 temp =getTidContents(temp); //this.body contains the name of the tiddler
						 if (temp != null) pieces[i] = temp;
					}						
				} else{
					if (i < 4) pieces[i] = '[{"#newdata":"'+pieces[i]+'"}]';
					else if (i <6)	pieces[i] = '['+pieces[i]+']';	
				}
			}
			this.title =pieces[1];
			this.body  =pieces[2];
			this.tags = pieces[3];
			this.fields =pieces[4]; 
			this.InitVals=pieces[5];	
			this.modes =extractModes(pieces[6]);
		}	
		else { // we are passed a structure
			this.title =defRule.title;
			this.body  =defRule.body;
			this.tags  =defRule.tags;
			this.fields ='';
			this.InitVals="";	
			this.modes = modes;	
		}
		
	}
		
	Rule.prototype.hasMode=function(mode){
		if (!this.modes) return false;
		for (var i=0; i< this.modes.length;i++)
			if (mode === this.modes[i]) return true;
		return false;
	}
	
	Rule.prototype.getWriteMode=function(mode){
		var writeMode = 'overwrite';
		if (!this.modes) return writeMode;
		for (var i=0; i< this.modes.length;i++)
			if (('append' === this.modes[i])||('prepend' === this.modes[i])||('move' === this.modes[i])
			   ||('overwrite' === this.modes[i])||('once' === this.modes[i])) return (this.modes[i]);
		return writeMode;
	}

	function defaultCategories() {
		var defaultcats  =defaults.getDefaultCategories();
		for (var i= 0; i< defaultcats.length; i++) {
			loadActiveSectionCategories(defaultcats[i]);
		}
	}

	function loadSectionFromFile(activeSection) {
		//sets currentsection
		activeCategories= {};
        var sectionStrgs;

		if (activeSection==0) defaultCategories();//load default rules defined by this program 

		var content = getTidContents("TiddlyClipConfig");//where all sections are defined
		if (content != null) {
			sectionStrgs = content.split(defaults.getMacros().FOLDSTART+'['); //sections begin with a title, , followed by a table of categories
			if(sectionStrgs.length>1) { //clip list format			 
				sectionStrgs.shift();	
				//only load active categories 
				loadActiveSectionCategories(sectionStrgs[activeSection].split('!/%%/\n')[1]);//strip of section name from first line
				currentsection = activeSection;
			} else { //straight text table
				sectionStrgs = content.split('\n!'); //sections begin with a title, eg !mysection, followed by a table of categories
				//only load active categories
				loadActiveSectionCategories(sectionStrgs[activeSection].replace(/(^\|)*\n/,''));//strip of section name from first line
				currentsection = activeSection;
			}

		}else {
			defaultCategories();
			currentsection=0;
			//alert("config tiddler not found");
		}
	}

////////private section///////////////
	function userInput(source){ //replace  % delimited strings with user input

		return source.replace(/%\[\$(.*?)\]%/g,function(m,key,offset,str){
			
			var parts=key.split("::");
			var userString={value:" "};
			//alert(parts[0]+"::"+parts[1]);
			if (parts.length !==2) {
				//use as a single field
				return  m;
			}
			//tcBrowser.UserInputDialog(parts[1],userString);
			
			return (userString.value);
		}
	)};
	function loadTiddlerVarsFrom(pageData,tid) {
		//alert(twobj.title + 'title');
		//BJ FIXME this need to be changed so that it acts like 'append mode'
		// and the tiddler is got from the retrieve procedure
		tidObj=new tiddlerAPI.Tiddler(tid);
		pageData.data.remoteTidText= decodeutf8(tidObj.text);
		pageData.data.remoteTidTags= decodeutf8(tidObj.tags||" ");
		pageData.data.remoteTidTitle=decodeutf8(tidObj.title);		
	}
	function firstRemoteTid(pageData) {
		pageData.remoteTidIndex = 0;
		return pageData.remoteTidArr[0];
	}
	
	function hasNextRemoteTid(pageData) {//alert(api.remoteTidArr.length + " len "+api.remoteTidIndex );
		return (pageData.remoteTidIndex < pageData.remoteTidArr.length);
	}
	
	function nextRemoteTid(pageData) {
		pageData.remoteTidIndex += 1;
		if (pageData.remoteTidIndex === pageData.remoteTidArr.length) return null;
		return pageData.remoteTidArr[pageData.remoteTidIndex];	
	}	
//  BJ! TODO ADD A LOG THAT IS ONLY WRITTEN WHEN SAVING THE TW
    function performAction(cat,pageData) {
		defaults.defaultCommands[cat].command(pageData);
	}
	// This is the function called when clicking the context menu item.
	function paste(catName,pageData, section, atHome, versionOfsection)
	{  
		loadSectionFromFile(section);//load activeCategories

		var cat= activeCategories[catName];
		if (!cat.valid) {
			return;
		}
		//could check for type of cat.rules if function then run -- allows module plugin with Tw5
		var cancelled = {val:false};
		var tiddlers = [],tideditMode=[];//list of tids to store
		var catTags = cat.tags;//main config tags 
		var patterns = cat.rules;
		var startrule=0;
		if (!!patterns[0].run) {
			patterns[0].run(catName,pageData, section);
			startrule=1;
		}
		if(hasMode(cat,"nosub")) return;
		//now loop over each tiddler to be created(defined in the category's extension entry)
		//if a list of tiddlers are to be copied from a page then we will have to loop over them as well

		
		if (!hasMode(cat,"tiddlers"))  { //user has not selected  tiddler mode
			if (hasModeBegining(cat,"tiddler")) loadTiddlerVarsFrom(pageData,firstRemoteTid(pageData));//copy into data area for insertion by a rule
			for(var i=startrule; i<patterns.length; i++)  {	
					var writeMode = patterns[i].getWriteMode();
					var tiddlerObj = new tiddlerAPI.Tiddler();

					if ((patterns[i].hasMode('pipeLast'))&&(tiddlers.length!==0)) 
						tiddlerObj.subst(new Rule(tiddlers.pop(),patterns[i].modes),pageData); //remove last element and use as a rule
					else
						tiddlerObj.subst(patterns[i],pageData);
					tiddlerObj.createdByRule=patterns[i];		//reference back to the rule - can be used later
					//tiddlerObj.text=userInput(tiddlerObj.text); //not used at present
					tiddlerObj.addTags(catTags);
					//user extensions
					for (var userExtends in api.AfterSub) {
							api.AfterSub[userExtends](tiddlerObj);
					}
					if (cancelled.val==true) {return;}
					//if (pageData.data.WriteMode !="none") writeMode=pageData.data.WriteMode;
					//add tiddlers one by one to our list of edits
					tiddlers.push(tiddlerObj);
					tideditMode.push(writeMode);
			}
		} else { 
			var tid;
			for (tid=firstRemoteTid(pageData); hasNextRemoteTid(pageData);tid=nextRemoteTid(pageData)){
				tiddlerObj=new tiddlerAPI.Tiddler(tid);
					var editMode;//no editmode
					tiddlerObj.addTags(catTags);
				    if (!vers2 && pageData.data.Classic =='true') tiddlerObj.addMimeType('text/x-tiddlywiki');
					tiddlers.push(tiddlerObj);
					tideditMode.push(editMode);
			}

		}
		for (var userExtends in api.BeforeSave) {
			api.BeforeSave[userExtends]();
		}
		if(hasMode(cat,"nosave")) return;

		for (var i =0; i< tiddlers.length; i++) {
			if (!tiddlers[i].isNull())
				addTiddlerToTW(tiddlers[i], tideditMode[i]);
		}
		twobj.saveTW("tiddley clip");
	}  

	function getTidContents(tidname) {
		if (vers2) 
			return store.getTiddlerText(tidname);
		else
			return $tw.wiki.getTiddlerText(tidname);
	}
		
	function addTiddlerToTW( tiddlerObj, writeMode) { 
		if (!twobj.tiddlerExists(tiddlerObj.title))  twobj.modifyTW(tiddlerObj);
		else {
			switch (writeMode) {
				case 'once':
					var oldtid = twobj.getTiddler(tiddlerObj.title);//retrieve existing version
					if (!!oldtid) break;
					twobj.modifyTW(tiddlerObj);
					break;
				case 'move':
					var oldtid = twobj.getTiddler(tiddlerObj.title);//retrieve existing version
					oldtid.title =oldtid.title + new Date();//move old tid by appending the date to its title
					//TODO: RENAME TAGS WITH '_'
					twobj.modifyTW(oldtid);//move out the way
					twobj.modifyTW(tiddlerObj);
					break;
				case 'append':
					var oldtid =twobj.getTiddler(tiddlerObj.title);//retrieve existing version
					oldtid.updateWith(tiddlerObj);
					twobj.modifyTW(oldtid);
					break;
				case 'prepend':
					var oldtid =twobj.getTiddler(tiddlerObj.title);//retrieve existing version
					oldtid.updateWith(tiddlerObj ,"prepend");
					twobj.modifyTW(oldtid);
					break;
			   //BJ FIXME need to add a case for 'tiddler' - rename tiddler that is clipped (as in move) instead of overwritting
			   // also need a 'force' option to force over writing.
			   // also an option to allow 'move' as above - adding a tiddlyclipmoved. tiddlyclipcolision for the other option
				default: //overwrite
				twobj.modifyTW(tiddlerObj);
			}
		}
	}

	return api;
}());

tiddlyclip.modules.twobj = (function () {

	var api = 
	{
		onLoad:onLoad, 			tiddlerExists:tiddlerExists,
		loadtw:loadtw, 	 		modifyTW:modifyTW,
		saveTW:saveTW,			getTiddler:getTiddler,
		dock:dock			
	}
	var   tiddlerAPI,tPaste;
	function onLoad () {
				tiddlerAPI 	= tiddlyclip.modules.tiddlerObj;
				tPaste=tiddlyclip.modules.tPaste;
				dock();
		}
	var tw =null,oldTW=null;
	var storeStart;		

	function saveTW(title) 
	{
		//nothing to do
	}
	function loadtw() {
		return true;
	}

	function getTiddler(tidname) {	
		if (vers2) 
			var storedTid=store.getTiddler(tidname);
		else
			var storedTid=$tw.wiki.getTiddler(tidname);
		if (storedTid) {
			return (new tiddlerAPI.Tiddler(storedTid,true));
		}
		else return null;
	}		
	function modifyTW(t)
	{
	    var fields={}; 
	    if (vers2) {
			var exclude = ["title","modifier","modified","created","creator","tags","text"];
			exclude = exclude.concat(t.toRemove);
			t.attribs = t.attribs.filter(function(i) {return exclude.indexOf(i) < 0;});
			for (var i = 0; i < t.attribs.length;i++) {
				fields[t.attribs[i]]=t[t.attribs[i]];//put extended fields into a group
			}
					
			var tiddler = store.saveTiddler(t.title,t.title,t.text,t.modifier,t.modified,t.tags,fields,false,t.created,t.creator);
			autoSaveChanges(null,[tiddler]);
		} else {
			t.attribs = t.attribs.filter(function(i) {return t.toRemove.indexOf(i) < 0;});
			$tw.utils.each(t.attribs, function(name,index ) {	
			   fields[name]=	t[name];//put fields into a group
				//alert("mod"+name+' '+fields[name]);
			});
			$tw.wiki.addTiddler(new $tw.Tiddler(fields));
		}
	}		
			   			   
	function tiddlerExists(title) {
	    if (vers2) 
			return(store.tiddlerExists(title));
		else
			return($tw.wiki.tiddlerExists(title));
	}	
	function dock() {
		injectMessageBox(document);
	};
	function injectMessageBox(doc) {
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
		   			   
	return api;
}());

tiddlyclip.modules.tiddlerObj = (function () {

	var api = 
	{
		onLoad:onLoad, Tiddler:Tiddler
	}
	var tcBrowser, twobj,pref, util, table, toTiddlyText;
	
	function onLoad(doc) {
		tcBrowser	= tiddlyclip.modules.tcBrowser;
		twobj		= tiddlyclip.modules.twobj;	
		defaults	= tiddlyclip.modules.defaults;
		toTiddlyText= tiddlyclip.modules.convert;
	}
	function createDiv(){
		return document.createElement("div");
	}
   Tiddler.prototype.addCreationFields=function() {
			this.created=new Date();
			this.creator=config.options.txtUserName;
	}
	function Tiddler(el,truetid) {
		this.attribs = ["title","text"];
		this.toRemove =[];
		var current = this;
		if (!el) { 
			if (vers2) {
				el = new window.Tiddler();
				store.forEachField(el,function(tiddler,fieldName,value){
							current[fieldName]=value;
							current.attribs.push(fieldName);},false);	
				this.addCreationFields();
			} else {
				el =  new $tw.Tiddler($tw.wiki.getCreationFields(),$tw.wiki.getModificationFields());
				for (var atr in el.fields){ 
						current[atr]=el.getFieldString(atr);
						current.attribs.push(atr);		
				}			
			}	
		    this.tags="";		
		} else if (!truetid) {
			if((typeof el) ==="string"){ //convert html to dom ;
				var wrapper= createDiv();
				wrapper.innerHTML= el;
				el= wrapper.firstChild;
				wrapper = {};//release div
			}								 				
			this.text = undoHtmlEncode(el.innerHTML.
					replace(/\n<pre xmlns="http:\/\/www.w3.org\/1999\/xhtml">([\s|\S]*)<\/pre>\n/mg,"$1").
					replace(/\n<pre>([\s|\S]*)<\/pre>\n/mg,"$1"));
			var  j = el.attributes, m, extraTags='';
			for (var i = j.length; i!== 0; i--) {
				m=j[i-1].nodeName; 
				v=j[i-1].value;
				this.attribs.push(m);
				this[m] = undoHtmlEncode(v) ;
			}

		} else {
			if (vers2) {
				store.forEachField(el,function(tiddler,fieldName,value){
						current[fieldName]=value;
						current.attribs.push(fieldName);},false);	
			} else {
				for (var atr in el.fields){ 
						current[atr]=el.getFieldString(atr);
						current.attribs.push(atr);		
				}
			}		
			if (!!this.tags) this.tags = (this.tags instanceof Array)?this.tags.join(' '):this.tags;
		    else this.tags="";
			//this.body =   this.text;
		}	
		if (vers2) {
			if (!!this.modified ) this.modified=(this.modified instanceof Date) ? this.modified : Date.convertFromYYYYMMDDHHMM(this.modified);
			this.created=(this.created instanceof Date) ? this.created : Date.convertFromYYYYMMDDHHMM(this.created);
		} else {
			if (!!this.modified ) this.modified=(this.modified instanceof Date) ? this.modified : $tw.utils.parseDate(this.modified);
			this.created=(this.created instanceof Date) ? this.created : $tw.utils.parseDate(this.created);
		}				
		return this;
	}
	
	Tiddler.prototype.addMimeType=function(mime){
		this.attribs.push('type');
		this.type = mime;
	}
	
	Tiddler.prototype.updateWith=function(tid, prepend){
		if (!tid) return false;
		if ((!tid.title)||(tid.title !==this.title)) return false;
		var created = this.created?this.created:new Date();
		var creator = this.creator?this.creator:this.modifier?this.modifier:'unknown';

		for (var i = 0; i<tid.attribs.length; i++){ 
			var atr = tid.attribs[i];
            if (atr === "tags") {
				 this.tags = removeDuplicates(this.tags + tid.tags);
				 if (!this.hasOwnProperty('tags'))  this.attribs.push('tags');
			} else if (atr !== "text") {
				if (!this.hasOwnProperty(atr))  {this.attribs.push(atr);}
			     this[atr]=tid[atr];
			}			
		};	
		this.toRemove = tid.toRemove;				
		this.text = (!!prepend)?tid.text + this.text :this.text + tid.text;
		this.created = created;
		this.creator = creator;
		this.modified = new Date();
		return true;
	}
	
	Tiddler.prototype.exportFieldsTo=function(obj){
		if (!obj) return false;

		for (var i = 0; i<this.attribs.length; i++){ 
			var atr = this.attribs[i];

            if (atr !== "tags"&&atr !== "text")  obj[atr]=this[atr]; //BJ meditation: what about title??
            			
		};					 
		return obj;
	}
		
	Tiddler.prototype.isNull=function(){
		return (!this.title)
	}
		
	Tiddler.prototype.addTags=function(tag){
		if (!tag) return;
		if (!this.tags) this.tags = ' ';
		this.tags = removeDuplicates(this.tags + ' '+ tag);
	}

	Tiddler.prototype.applyEdits = function(fields) {
		for (var i in fields){				
			if (!this.hasOwnProperty(i)) this.attribs.push(i);//add to list of fields to update
			this[i] = fields[i];
		}
	}
	
	Tiddler.prototype.removeField = function(field) {
			this.toRemove.push(field);
	}

	Tiddler.prototype.EncodedDiv = function() {
		var tiddler = "<div";
		for (var i = 0; i<this.attribs.length; i++){
			//within the program tags and extraTags are combined - seperate them before writing to file
				tiddler += ' '+ this.attribs[i] + '="' +tcBrowser.htmlEncode(this[this.attribs[i]])+'"';
		}
		tiddler += 	">\n<pre>" + tcBrowser.htmlEncode(this.text) + "</pre>\n</div>";
		return tiddler;
	}

	function undoHtmlEncode( input ) {
		input =input
        .replace(/&bar;/g, '|')
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
        return (input);   
	}

	Tiddler.prototype.subst  =	function (rule,pageData){
		var dateLong=    'DDD, MMM DDth, YYYY';
		var dateTimeLong='DDD, MMM DDth, YYYY at hh12:0mm:0ss am';	
		var dateShort=   'DD MMM YYYY';//journal form
		var dateTimeShort=   'YYYY/MM/DD 0hh:0mm:0ss';//journal form
		if (vers2) {		
			pageData.data.YearMonth=(new Date()).convertToYYYYMMDDHHMMSSMMM().replace(/(.*)\.(.*)/,"$1").substr(0,6);
			pageData.data.DateTimeLong=  new Date().formatString(dateTimeLong);	//replaces  %DateTimeLong%
			pageData.data.DateLong=      new Date().formatString(dateLong);		//replaces  %DateLong%
			pageData.data.DateShort=     new Date().formatString(dateShort);		//replaces  %DateShort%     
			pageData.data.DateTimeShort=     new Date().formatString(dateTimeShort);		//replaces  %DateShort%   
			pageData.data.DateComma=     pageData.data.DateShort.toString().replace(/ /g,':');
		}else {
			pageData.data.YearMonth=$tw.utils.stringifyDate(new Date()).replace(/(.*)\.(.*)/,"$1").substr(0,6);
			pageData.data.DateTimeLong=   $tw.utils.formatDateString(new Date(),dateTimeLong);	
			pageData.data.DateLong=       $tw.utils.formatDateString(new Date(),dateLong);		
			pageData.data.DateShort=      $tw.utils.formatDateString(new Date(),dateShort);	       
			pageData.data.DateComma=     pageData.data.DateShort.toString().replace(/ /g,':');
		}
		pageData.data.Category1stWord=pageData.data.Category.replace(/(.*) (.*)/,"$1");
		var protoData = {}; 
		var targetTags='';

		var macrosx =defaults.getMacros();
		table={$:{}};table['#']={};table['@']={};
		for (var n in pageData.data) {table['@'][n]= pageData.data[n];}
		for (var n in macrosx) {table['@'][n]= macrosx[n];}

		this.parseStructure(rule.title);			 
		this.title=table['#']['newdata'];
		//this copies tags from target to preserve it's tags as well as obtaining any fields
		if (rule.hasMode('append')||rule.hasMode('prepend')||rule.hasMode('modify')) {
			var storedTid=twobj.getTiddler(this.title);
			if (storedTid) {
				storedTid.exportFieldsTo(table['$']);
				table['@']['newtiddler']= 'false';
			} else {
				this.parseStructure(rule.InitVals);
				table['@']['newtiddler']= 'true';
			}
		}
		else 
		{
			this.parseStructure(rule.InitVals);
			table['@']['newtiddler']= 'true';
		}
		if (rule.hasMode('modify')){
			//expose old values
			table['$'].tags = this.tags;
			table['$'].text = this.text;
		}
		//BJ FIXME here we can test for 'tiddler mode' and retreive the tiddler from the list of clipped tids
		//else if	rule.hasModeBeginng('tiddler')) {
		//	var Tid = getclippedtid();//increment handle in outer loop
		//	Tid.exportFieldsTo(table['$']);
		//	table['@']['newtiddler']= 'false';	
		//}	

		table['#']={};
		this.parseStructure(rule.body);			 
		this.text=table['#']['newdata'];
		
		table['#']={};
		this.parseStructure(rule.tags);	
		if (!!table['#']['newdata']) {
			//alert(table['#']['newdata']);
			 this.attribs.push("tags");
			 this.tags=' '+table['#']['newdata'];
		 }
		table['#']={};
		this.parseStructure(rule.fields);

		this.applyEdits(table['$']);

		return this;
	}

	 var error=function (message) {
		 alert(message);
	 }

	 function getSimpleVarFrom (n ) {
		n = n.trim();
		var type = n.substring(0,1);
		if (type !== '#' &&type !=='$' && type !=='@') error("variable: invalid name "+n);
        else return {type:type, leftSide:n.substring(1)};
	 }
	function valOf(n) {
		var val, type = n.substring(0,1);
		if (type !== '#' &&type !=='$'&&type !=='@'){
			error("source: invalid name"+n);
			return null;
		}
		else {
			val=table[type][n.substring(1)];
			if (!val) error("source: invalid val "+n);
			return val;
		}
	 }
	function toValues(sources) {
		var values = [], returned;
		for (var i = 0 ; i < sources.length ;i++) {
			if ((values[i]= valOf(sources[i]))==null) return null;
		}
		return  values;
	}
	function makeInt (value) {
		if(/^(\-|\+)?([0-9]+)$/.test(value)) {
			return Number(value);
		}
		return NaN;
	}

  Tiddler.prototype.parseStructure=function(b,localonly) {
		var target;
		b=JSON.parse(b);//BJ FIXME rap in a try and set error()
		for (var i=0; i < b.length; i++) {
			var moreThanOne = 0;
			for (var n in b[i]) {//n is our nodes combined target/operator string - eg #x#EQ
				if (moreThanOne) error ("general:more than one subterm in node");
				var rightSide =b[i][n];
				if (typeof rightSide === "object") error("source: invalid type object");
				else if (typeof rightSide === "string") {
					rightSide = this.replaceALL(rightSide);
				}
				else error("source: invalid type");
				var returedVals =  getSimpleVarFrom (n);
				var leftSide =  returedVals.leftSide;
				var type 	 =  returedVals.type;
				if (type !== '#' &&type !=='$') error("target: invalid name "+n);			
				if (!localonly)  table[type][leftSide] = rightSide;
				else {
					if (type=='#') table[type][leftSide] = rightSide;
					else error("target: invalid assignment");
				}
				moreThanOne++;		
			}
		}
	}

	function handleBinaryForm(leftSide,operator,rightSide) {
		switch (operator) {
			case 'PS':
			case 'MS':
				rightSide = makeInt(rightSide);
				if ( isNaN(rightSide)) {error("rightside: can only add integers"); return null;}
				leftSide = makeInt(leftSide);
				if (isNaN(leftSide)) {error("leftside: can only add integers"); return null;}
				return ((operator==='PS')?leftSide+rightSide:leftSide-rightSide);			
				break;
			case 'EQ':
			case 'NQ':
			//alert(leftSide+" cmp "+rightSide);
				return ((operator==='EQ')?leftSide==rightSide:leftSide!=rightSide);			
				break;
			default: error("operator not found");
					 return null;
		}	
	}

	 Tiddler.prototype.handleFunction=function(source) {
		var self = this;
		if (!/(.*)\(([\S\s]*?)\)/.test(source) )return null;
		return source.replace(/(.*)\(([\S\s]*?)\)/g,function(m,key1,key2,offset,str){
			if (key1=="delete") {
				self.removeField(key2.substring(1));
				return "deleted "+key2;
			}
			//handle normal functions
			var val=valOf(key2);
			if ( !!val && key1=="htmlToTW2") {
				return toTiddlyText.convert(val);
			}
			return m;
		});
	}
	
	Tiddler.prototype.replaceALL=function(source, data){ //replace all % delimited strings
		var self = this;
		return source.replace(/\(\(\*([\S\s]*?)\*\)\)/g,function(m,key,offset,str){ 
			var parts, vals, res, firstterm, firstparts= key.split("*??*");
			if (firstparts.length ==2) {	
				var negate=(firstparts[0].substring(0,1)== '!');
				if (negate) {
					firstterm = firstparts[0].substring(1);
				} else {
					firstterm = firstparts[0];
				}
				//var parts= firstterm.split("/");
				if ((parts= firstterm.split("/")).length ==2) {
					if ((vals = toValues(parts)) == null) return m;
					var regParts = (valOf(parts[1])).split("/");
					var pattern=new RegExp(regParts[1],regParts[2]);
					
					if (negate&&pattern.test(vals[0]))return '' ;
					else if (!negate&&!pattern.test(vals[0]))return '' ;
				}
				else if ((parts= firstterm.split("==")).length ==2) {
					if ((vals =toValues(parts))==null) return m;
					if ((res=handleBinaryForm(vals[0],negate?"NQ":"EQ",vals[1]))==null) return m;
					else if (!res) return ''; 
				} 
				else {
					if (!valOf(firstterm)) return m;
					if (valOf(firstterm)==="true") 	return "";
				}
				key= firstparts[1];	
			}
			var parts= key.split("/");
			if (parts.length ==3) {
				if ((vals = toValues(parts)) == null) return m;
				var regParts = (valOf(parts[1])).split("/");
				var pattern=new RegExp(regParts[1],regParts[2]);
			return vals[0].replace(pattern, vals[2]);
			}
			parts= key.split(":");
			if (parts.length ==3) {
				if ((vals = toValues(parts)) == null) return m;		
				return vals[0].replace(vals[1], vals[2]);
			} 
			if ((parts = key.split("+")).length == 2) {
				if ((vals = toValues(parts)) == null) return m;
				if ((res = handleBinaryForm(vals[0],"PS",vals[1])) == null) return m;
				return res.toString();
			}		
			if ((parts= key.split("-")).length ==2) {
				if ((vals = toValues(parts)) == null) return m;
				if ((res = handleBinaryForm(vals[0],"PS",vals[1])) == null) return m;
				return res.toString();
			}
			if ((res = self.handleFunction((parts[0]))) != null) return res;
			if (!valOf(parts[0])) return m;
			return valOf(parts[0]);
		});
    }

	return api;
	
	function removeDuplicates(names) {
		var i,j,dup,nams = '', nlist = names.split(' ');
		for ( i=0; i < nlist.length; i++)
			nlist[i] = nlist[i].trim();
		for ( i=0; i < nlist.length; i++){
			dup = false;
			for ( j = i ; j > 0; j--) {
				if (nlist[i] === nlist[j-1]){
					dup = true;// alert("dup");
					break;
				}
			}
			if (!dup) nams = nams+' '+nlist[i];
		}
		return nams;
	}	
}());

 tiddlyclip.modules.defaults = (function ()
{
	var defaultCommands = {
		search:{tip:'search selection in tw', command:function(){alert("mysearch")}}
	};
	var tPaste, twobj;
	function onLoad() {
		tPaste=tiddlyclip.modules.tPaste;
		twobj=tiddlyclip.modules.twobj;
	}
	var api = 
	{
		onLoad:onLoad, getDefaultRule:getDefaultRule, 
		getDefaultCategories:getDefaultCategories,
		getTWPrefs:getTWPrefs,
		getMacros:getMacros,
		defaultCommands:defaultCommands
	}	
	var defaultCategories = [
		"|tid|copy tids||defaultTid|tiddlers|",
		"|text|save text||defaultText||",
		"|web|save html||defaultWeb||"
	];
	var defaultRules = {
		defaultTid:'|{{{%($remoteTidTitle)%}}}|{{{%($remoteTidText)%}}}|{{{%($remoteTidTags)%}}}|||append|',
		defaultText:'|{{{%($PageTitle)%}}}|{{{%($PageRef)% <br>date="%($DateTimeLong)%", <html>%($Text)%</html>}}}||||append|',
		defaultWeb: '|{{{%($PageTitle)%}}}|{{{%($PageRef)% <br>date="%($DateTimeLong)%", <html>%($Web)%</html>}}}||||append|'
	}

	var defaultPrefs = {
		ConfigOptsTiddler:'ConfigOptions',
		filechoiceclip:1,
		txtUserName:'default',
		txtBackupFolder:'x'
	}
	var macros = {
	FOLDSTART:'ᏜᏜᏜᏜ*',
	FOLDCONTENT:'!/%%/'
	}
	
	function getMacros(){
		if (!twobj.tiddlerExists("TiddlyClipMacros"))  return macros;

		var content = tPaste.getTidContents("TiddlyClipMacros");//where all marcos are defined	
		try {
			if (content =="") return macros;
			var values =JSON.parse(content);
			if (!!values) {return values;}
		}catch(e){	
		}
		return macros; 
	}
	
	function getTWPrefs(){ return defaultPrefs;}
	

	function getDefaultCategories() {
		return defaultCategories;
	}		
 
	function getDefaultRule(ruleName) {
		return defaultRules[ruleName];
	}

 	return api;
}());

tiddlyclip.modules.convert =(function ()
{
	function onLoad() {

	}

	//# based on code from include plugin
	var convert = function(text)
	{
		var content = "<html><body>" + text + "</body></html>";
		// Create the iframe
		var iframe = document.createElement("iframe");
		iframe.style.display = "none";
		document.body.appendChild(iframe);
		var doc = iframe.document;
		if(iframe.contentDocument)
			doc = iframe.contentDocument; // For NS6
		else if(iframe.contentWindow)
			doc = iframe.contentWindow.document; // For IE5.5 and IE6
		// Put the content in the iframe
		doc.open();
		doc.writeln(content);
		doc.close();
		// convert to tiddlytext
		var twcontent = toTW(doc.body);
		iframe.parentNode.removeChild(iframe);
		return twcontent;
	};
	
	var toTW  =(function() {
	  var ELEMENT = this.Node?Node.ELEMENT_NODE:1,
			 TEXT = this.Node?Node.TEXT_NODE:   3,
			 CDATA= this.Node?Node.CDATA_SECTION_NODE:4,
		   COMMENT= this.Node?Node.COMMENT_NODE:  8;
	
		var Tname = {
		//need to add a flag the says only add a \n if not preceeded by \n
		
		// -- table --
		table   :[handleTabBg,handleTabEnd,''],//todo add handle end to add footer '
		thead	:[handleTheadBg, "",""],
		tbody	:[handleTbodyBg, "",""],
		tfoot	:[handleTfootBg, "",""],
		tr		:[trStart,trEnd,''],
		td		:[tdStart,tdEnd,''],
		th		:[tdStart,tdEnd,'th'],

		// -- heading --

		h1:["\newline!"			,"\n",""],
		h2:["\newline!!"		,"\n",""],
		h3:["\newline!!!"		,"\n",""],
		h4:["\newline!!!!"		,"\n",""],
		h5:["\newline!!!!!"		,"\n",""],
		h6:["\newline!!!!!!"	,"\n",""],
		
		// -- list --
		ul		:[""			,"\newline","ul"],
		ol		:[""			,"\newline","ol"],
		dl		:[""			,"\newline","dl"],
		li		:[handleBullit	,"","li"],
		dt		:[handleBullit	,"","dt"],
		dd		:[handleBullit	,"","dd"],
		
		// -- quoteByBlock --		
		// -- quoteByLine --
		blockquote:[handlebq, "\newline","bq"],
		
		// -- rule --
		// -- monospacedByLine --
		// -- wikifyComment --	
		// -- macro --
		// -- prettyLink --
		// -- wikiLink --
		// -- urlLink --
		a		:["[["			,handleLink,""], 
		
		// -- image --
		img		:[handleImg, '',''],
		
		// -- html --
		// -- commentByBlock --
		// -- characterFormat --
		b      :[ "''",  "''" ,""],
		strong :[ "''",  "''" ,""],
		i      :[ "//",  "//" ,""],
		em     :[ "//",  "//" ,""],
		u      :[ "__",  "__",""],
		sub    :[ "~~",  "~~",""],
		sup    :[ "^^",  "^^",""],
		strike :[ "--",  "--",""],
		
		// -- customFormat --
		span:[handleSPAN		,endDIV,""],	
		div:[handleDIV			,endDIV,""],	
		// -- mdash --
		hr:["<hr>"	,"",""],		
		// -- lineBreak --

		br		:[handleBreak,	"",""],
		
		// -- rawText --
		// -- htmlEntitiesEncoding --

		code   :[ "{{{",  "}}}",""],
		tt     :[ "{{{",  "}}}",""],
		pre   :[ "\newline{{{\n",  "\newline}}}\n",""]

		}	
		var MAXCOL=20;
		var spanDwCounters = new Array(MAXCOL);
		var colCount =0;	
		var intable=false;
		var foot,tofoot,head,footer;
		var divStackEmpty =[];
				
	  return function tw(el, outer, LOCALE,parentbullit) {
			var i = 0, j = el.childNodes, k='', m, n,
				l = j.length;
			var nodeFound=false, ind, bullit = [];
			if (!parentbullit) parentbullit = [];
			for (ind = 0; ind < parentbullit.length;ind++) bullit.push(parentbullit[ind]);
			
			if (outer) 
			{
				m = el.nodeName.toLowerCase();
				
				for (var name in Tname) {

					if (name === m) {
						k = typeof Tname[name][0] == "function"?
								Tname[name][0](el, outer, LOCALE,parentbullit):Tname[name][0];		
						
						//alert( "m="+m+" "+k);
						bullit.push(Tname[name][2]);//pass on tag to child for bulit list
						nodeFound = true;
						break;
					}
				}
			}
			var temp='';
			while(i !== l) switch((n = j[i++]).nodeType) {

			  case ELEMENT: temp +=tw(n, true, LOCALE,bullit); break;
			  case TEXT:    temp += doTrim(m,n.nodeValue); break;
			  case COMMENT: temp += "/% " +n.nodeValue +" %/";break;
			  

			} 
			if (tofoot===true) footer += temp; else k += temp;
			
			var kk='blank';
			if (!outer) return trimNl(k);
			for (var name in Tname) {
				if (name === m) {
					kk = (typeof Tname[name][1] == "function"?
								Tname[name][1](el, outer, LOCALE):Tname[name][1]);
					//return (k+Tname[name][1]);
					//alert ('kk '+kk);
					return k+kk;
				}
			}
			return k;
		}; 
		function attr(el,LOCALE) {
			var i = 0, j = el.attributes, k = new Array(l = j.length), l, nm,v;
			while(i !== l) {
				nm = j[i].nodeName ;
				v = j[i].value;
				k[i]='';
				//check to see if src is local, add path if it is 
				if ((nm==='src')||(nm==='href')){
					var pathStart = v.substring(0,4);
					
					if ((pathStart==='file') ||(pathStart === 'http'))
						k[i] +=nm + '="'+ v + '"'; 
					else {
						if (nm==='src') {
							if (!!LOCALE) {
								var locale = LOCALE.split('//');
								locale = locale[0]+'//'+locale[1].split('/')[0];
								k[i] +=nm +  '="'+ locale+v + '"';
							}
							else k[i] +=nm +  '="'+v + '"';
						}
						else
							k[i] +=nm +  '="'+ LOCALE+v + '"';	
					}
		
				}
				else
					k[i] +=nm + '="'+ v +'"';
				//alert(nm+" ="+v);
				i++;
			}
			return (l?" ":"") + k.join(" ");
	  }
		  
		function handleSPAN(el, outer, LOCALE,parentbullit,bullitstack) {
			var k = '{{"', style = '';
			var attrlist = attr(el,LOCALE);
			var empty = true;
			for (var i= 0;i< attrlist.length;i++) { 
				item = attrlist[i].split(':');

				if (item[0] ==='style'){
					k +=attrlist[i].substring(6,attrlist[i].length-1).replace(/"/g,"'")+";";
				   empty = false;
				}
			}
			divStackEmpty.push(empty);
			if (empty === true) return '';
			return k+'"{\newline';
		}

		function handleDIV(el, outer, LOCALE,parentbullit,bullitstack) {
			var k = '{{"', align = 'left',style = '';
			var attrlist = attr(el,LOCALE);
			var empty = true;
			for (var i= 0;i< attrlist.length;i++) { 
				item = attrlist[i].split(':');
				if (item[0] ==='align'){ 
					k +='align:'+item[1]+";";
					empty = false;
				}
				else if (item[0] ==='style') {
					k +=attrlist[i].substring(6,attrlist[i].length-1).replace(/"/g,"'")+";";
					empty = false;
				}
			}
			divStackEmpty.push(empty);
			if (empty === true) return '';
			return k+'"{\newline';
		}
		function endDIV() {
			if (divStackEmpty.pop() === true) return "";
			return '}}}';
		}	
		function doTrim(name, content) {
			var whiteSpace = /^\s+|\s+$/g;
			if (name!=='pre') return content.replace(whiteSpace, ' ');
			return content;
		}
	   function trimNl(k)
	   {
		   return k.replace (/(\newline)+/g,"\newline").replace (/\n\newline/g,"\n").
					replace(/\newline/g,"\n").          replace(/\n.*?\trim\|/g,"\n|").
					replace(/\|([h,f])\trim.*?\n/g,"|$1\n").     replace(/\trim/g,"");//replace(/\trim/g,"\n");tiddler	function
		  }
		function trimNewLines(k,term) { 
			if ((term.length >6) &&(term.substring(0,7) === '\newline')) {
				tt = term.substring(7,term.length);
				if ((k.length > 1) &&(k.substring(k.length-1,k.length)==='\n')) return k + tt;
				else return (k + '\n' + tt);
			}
			return k + term;
		}
		
		function handleBreak (el, outer, LOCALE,parentbullit,bullitstack) 	{
			if (intable === true) return '<<br>>';
			return "\n";
		}
		
		function handleBullit(el, outer, LOCALE,parentbullit,bullitstack) {
			var bullit;// = parentbullit[parentbullit.length-1];
			for (var i =0 ; i < parentbullit.length; i++) {
				bullit = parentbullit[parentbullit.length-1-i];
				if ((bullit === 'dl')||(bullit === 'ul')||(bullit === 'ol')) break;
			}
			//if (i === parentbullit.length) alert ("error");

			if ((this[2] ==='dt')&&(bullit === 'dl')){ return '\newline'+handleBullitList(parentbullit)+';';}
			if (bullit === 'ul') { return '\newline'+handleBullitList(parentbullit,parentbullit.length-1-i) +'*';}
			if (bullit === 'ol') { return '\newline'+handleBullitList(parentbullit,parentbullit.length-1-i)+'#';}
			if (bullit === 'dl') { return '\newline'+handleBullitList(parentbullit,parentbullit.length-1-i)+':';}
			return '';
		}


		function handleBullitList(parentbullit,end) {
			if (parentbullit.length < 1) return;
			
			var bullitInner = parentbullit[end-1];
			for (var i =end-1 ; i>-1; i--) {
				bullitInner = parentbullit[i];
				if ((bullitInner === 'dt')||(bullitInner === 'li')||(bullitInner === 'dd')) break;
			}
			if (i === end) { alert ("error"); return;}
			end = i;
			var bullitOuter = parentbullit[end-1];
			for (var i =end-1 ; i>-1; i--) {
				bullitOuter = parentbullit[i];
				if ((bullitOuter === 'dl')||(bullitOuter === 'ul')||(bullitOuter === 'ol')) break;
			}
			if (i === end) { alert ("error"); return;}
			//parentbullit=parentbullit.substring(0,parentbullit.length-4);
			
			if ((bullitInner ==='dt')&&(bullitOuter === 'dl')){ return handleBullitList(parentbullit,i)+';';}
			if (bullitOuter === 'ul') { return handleBullitList(parentbullit,i)+'*';}
			if (bullitOuter === 'ol') { return handleBullitList(parentbullit,i)+'#';}
			if (bullitOuter === 'dl') { return handleBullitList(parentbullit,i)+':';}
			return '';
		}
		function handleLink (el, outer, LOCALE) {
			return  '|' +el.getAttribute("href") +']]';
		}
		function handlebq (el, outer, LOCALE,parentbullit,bullitstack)	{
			var bullit;// = parentbullit[parentbullit.length-1];
			var outline = '\newline>';
			for (var i =parentbullit.length-1 ; i >-1; i--) {
				bullit = parentbullit[i];
				if (bullit === 'bq') outline += '>';
			}

			return outline;
		}


		function handleTabBg (el, outer, LOCALE,parentbullit,bullitstack) {
			for (var i = 0; i < MAXCOL; i++) spanDwCounters[i]=0;
			foot = false;
			tofoot = false;
			head = false;
			footer = '';
			return '';
		}
		function handleTheadBg() {
			head = true; //flag to put header char on each of row
			return '';
		}
		function handleTbodyBg() {
			tofoot=false;
			head = false;
			return '';
		}
		function handleTfootBg() {
			foot = true; //flag to put foot char on each of row
			tofoot =true;//when footer html is before body save to temp area then append
			return '';
		}
		function handleTabEnd(){
			if (foot===true)
			return footer + "f\newline"; //move footer to end of table
			else return '\newline';
			return '';
		}
		function trStart (el, outer, LOCALE,parentbullit,bullitstack) {
			colCount =0;
			if (tofoot===true) footer+='\newline'; else  return '\newline';
			return '';
		}
		function trEnd (){
		    if (tofoot===true) { footer+='|f\trim';return '';}
		    if (head===true) return  '|h\trim';
		    return '|\trim';
		}
		function tdStart (el, outer, LOCALE,parentbullit,bullitstack) {
			var k ='|';
			intable = true; //<br> are converted to <<br>> not newline due to tw formatting
			if (colCount === 0) k='\trim|';
			if 	(spanDwCounters[colCount] >1) {
				k +='~|';
				spanDwCounters[colCount]--;
			} else
				if (this[2]==='th') k +='!';
			var rowspan =  parseInt( el.getAttribute('rowspan'))|| 1;
			spanDwCounters[colCount]= rowspan;
			
			var colspan =  parseInt(el.getAttribute('colspan') )|| 1;
			//alert("colspan "+colspan);
			for (var i = 0; i<colspan-1; i++) k+='>|';
			
			var align = el.getAttribute('align') || 'none';
			var style = el.getAttribute('style') || '';
			if (style === 'text-align: center;') align = 'center';
			if (style ==='text-align: right;')   align = 'right' ;
			if ((align ==='center')||(align ==='right')) k+=' ';
			if (tofoot===true)footer+=k; else return k;
			return '';
		}
		
		function tdEnd (el, outer, LOCALE,parentbullit,bullitstack) {
			colCount +=1;
			intable = false;
			var align =  el.getAttribute('align') || 'none';
			var style = el.getAttribute('style') || '';
			if (style === 'text-align: center;') align = 'center';
			if (style ==='text-align: left;')   align = 'left' ;

			if (align ==='center') if (tofoot===true)footer+=' ';else return ' ';	
			if (align ==='left') if (tofoot===true)footer+=' '; else return ' ';
			if (tofoot===true)footer+='';else return '';
			return '';
			//if (tofoot===true) alert (footer);
		}

		function handleImg(el, outer, LOCALE,parentbullit,bullitstack) {
			var img = el.getAttribute('src');
			if (!img) return '';

			var pathStart = img.substring(0,4);

			if ((pathStart!=='file') && (pathStart !== 'http'))
			{
				var locale = LOCALE.split('//');
				locale = locale[0]+'//'+locale[1].split('/')[0];
				img= locale+img;	
			}	
			var alt = el.getAttribute('alt');
			var align = el.getAttribute('align');
			var title = el.getAttribute('title');

			var ret = "[";
			if (align === 'left') ret += "<" ;
			if (align === 'right') ret += ">" ;
			ret += "img[";
			if (title) ret += "$title|" 
			ret += (img+"]]");
			return ret;
		}
	})(); 
	var api = 
	{
		onLoad:onLoad, convert:convert
	}
	return api;
}());


var MODULES = tiddlyclip.modules;
for (var mod in MODULES) {
	MODULES[mod].onLoad();
}


	 function decodeutf8(source) {

		 var chr1,chr2,chr3,result="",i=0;
		 while (i <source.length){
			 chr1= source.charCodeAt(i);
			 if (chr1<128) {result+= String.fromCharCode(chr1);i++;}
			 else {
				 chr2=source.charCodeAt(i+1);
				 if ((chr1 > 191) && (chr1 < 224)){result+= String.fromCharCode(((chr1 & 31) << 6) | (chr2 & 63));i+=2;}
				 else {
					 chr3=source.charCodeAt(i+2);
					 result+= String.fromCharCode(((chr1 & 15) << 12) | ((chr2 & 63) << 6) | (chr3 & 63));
					 i+=3;
				 }
			 }
		 }
		 return result;
	}	
} 

if (vers2) {
(function ()
{
	var myformatter =  [];
	var requiredFormatter = {
		TiddlyClipConfig:{ 
			table:true, 		heading:false, 		list:false, 			quoteByBlock:false,	
			quoteByLine:false, 	rule:false,  		monospacedByLine:false, wikifyComment:false,
			macro:true, 		prettyLink:false, 	wikiLink:true, 		    urlLink:false, 		
			image:false, 		html:false, 			commentByBlock:false,	characterFormat:false, 
			customFormat:false, mdash:false, 		lineBreak:false, 		rawText:false, 	
			htmlEntitiesEncoding:false },
		plain:{ 
			table:false, 		heading:false, 		list:false, 			quoteByBlock:false,	
			quoteByLine:false, 	rule:false,  		monospacedByLine:false, wikifyComment:false,
			macro:true, 		prettyLink:false, 	wikiLink:false, 		    urlLink:false, 		
			image:false, 		html:true, 		commentByBlock:false,	characterFormat:false, 
			customFormat:false, mdash:false, 		lineBreak:false, 		rawText:false, 	
			htmlEntitiesEncoding:false }
	}
    var i;

	for (tagName in requiredFormatter){
		myformatter =  [];		
		for (var m in requiredFormatter[tagName]) if (requiredFormatter[tagName][m]==true) {
		 	for ( i=0; i<config.formatters.length; i++)  
				if (config.formatters[i].name==m) {//value from above table
					  myformatter.push(config.formatters[i]);
				};
		} 	 	
		var parser = new Formatter(myformatter);
		parser.formatTag= tagName;//tag tiddlers with this
		parser.format= tagName;
		config.parsers[tagName]=parser; 
	}    
	return;
	
function cloneFormatter(formatter) {
	var oldhtmlformatter = {};
	for (var m in formatter) oldhtmlformatter[m] = formatter[m];
	return oldhtmlformatter;
}	       
})();
}
}());
//}}}
