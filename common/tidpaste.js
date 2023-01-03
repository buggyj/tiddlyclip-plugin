tiddlyclip={hello:"hello"};

(function(){
tiddlyclip.modules={};
 
var log = function (x) {
	alert(x);
}
	function status (param) {
		tiddlyclip.log(param);
		}
if (true) {

tiddlyclip.modules.tPaste = (function () {

	var api = 
	{
		onLoad:onLoad,				paste:paste,				
		hasMode:hasMode,			setconfig:setconfig,
		getconfig:getconfig,		dodock:dodock,
		hasModeBegining:hasModeBegining,setopts:setopts,
		getopts:getopts
	};
	var   tiddlerObj, twobj,   defaults;

	function onLoad() {
		tiddlerAPI 	= tiddlyclip.modules.tiddlerAPI;
		twobj		= tiddlyclip.modules.twobj;
		defaults	= tiddlyclip.modules.defaults;
	}
/////////////////////////////////////////////////////////////////////////////

 function dodock(text,aux,extra) {
	var message = document.createElement("div") ,messageBox = document.getElementById("tiddlyclip-message-box");
	if(messageBox) {
		message.setAttribute("data-action","dock");
		message.setAttribute("data-text",text||"");
		message.setAttribute("data-aux",aux||"");
		message.setAttribute("data-extra",extra||document.title);
		//add in the version - thru tcadapter
		var tidops = getopts();
		var noshowtids = tidops && tidops.noshowtids && tidops.noshowtids === "yes";
		if (tiddlyclip.version && !noshowtids) {
			message.setAttribute("data-version",tiddlyclip.version());
		}
		messageBox.appendChild(message);
		
		// Create and dispatch the custom event to the extension
		var event = document.createEvent("Events");
		event.initEvent("tc-send-event",true,false);
		message.dispatchEvent(event);
     return "docked";
	} else {
		return "error no  extension found";
	}
};


    var configName="", config="",optsName="", opts="";
	function findDefaultRule(rule) {
		return (rule.substring(0,7)==='default') ? defaults.getDefaultRule(rule):null;
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
		
		if (!catFound) {status ("not found cat: "+category);return {valid:false};}
		
		var ruleDefs =  twobj.getTidContents(pieces[4].replace(/^\[\[([\s\S]*)\]\]/,"$1"));//remove wikiword parens if present
		//if rule is not found use the default rules
		if (!ruleDefs) {
			status ("rules not found for cat: "+category+" was "+pieces[4]);
			ruleDefs = findDefaultRule(pieces[4]);
			
			}
		if (!!ruleDefs)  {	
			try {
				cat = {rules:null,valid:false};		
				cat.rules=addSequenceOfRules(ruleDefs,category);//one or more
				cat.modes= extractModes(pieces[5]);
				cat.tags = pieces[3];
				cat.tip  = pieces[2];
				cat.valid= true;
				status("found cat: "+category)
				return cat;
			} catch(e) {
				status("caught error while adding rules for cat: " + category);
				return {valid:false};
			}
		}
		status ("rules not found for cat: "+category);
		return {valid:false}; 
	}


	function setRules(cat)
	{
		var ruleDefs =  twobj.getTidContents(cat.title);
		//if rule is not found use the default rules
		if (!ruleDefs) {
			status ("rules not found for cat: "+category+" was "+cat.title);
			ruleDefs = findDefaultRule(cat.tile);//BJ tile is not correct
			
			}
		if (!!ruleDefs)  {	
			try {	
				cat.rules=addSequenceOfRules(ruleDefs);//one or more
				status("found cat: ");
				cat.valid =true;
				return cat;
			} catch(e) {
				status("caught error while adding rules for cat: ");
				return {valid:false};
			}
		}
		status ("rules not found for cat: "+category);
		return {valid:false}; 
	}

	function findSection(activeSection,configTable) {
        var sectionStrgs;
		var content = configTable;
		if (content != null) {
			sectionStrgs = content.split(defaults.getDefs().FOLDSTART+'['); //sections begin with a title, , followed by a table of categories
			if(sectionStrgs.length>1) {
				status("found clip list format config")		 
				sectionStrgs.shift();	
				//only load active categories 
				return (sectionStrgs[activeSection].split('!/%%/\n')[1]);//strip of section name from first line
			} else { 
				status("found straight config format");
				sectionStrgs = content.split('\n!'); //sections begin with a title, eg !mysection, followed by a table of categories
				for (var  j = activeSection; j < sectionStrgs.length;  j++) { 
					if ( sectionStrgs[j].indexOf('|') !== -1) {
						// assumes that '|' means there is a def table otherwise move to next sections def table
						//only load active categories
						return (sectionStrgs[j].replace(/(^\|)*\n/,''));//strip of section name from first line
					}
							
				}
				status("config tiddler missing table");
				return ([]);//not found
			}

		}else {
			status("config tiddler not found try with default values");
			return defaults.getDefaultCategories().join("\n");
		}
	}
//////////////////////////////////////////////////////////
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
		var firstRow=0,firstrule=0;
/*
        if (ruleDefs[firstRow].substring(0,2)==='|!') firstRow += 1;// row  maybe column titles, ie the string |!Title|!Body|!Tags|!Modes|
		for (var i=firstrule,j=firstRow; j<ruleDefs.length; i++,j++) {
			arrayOfRules[i]=new Rule(ruleDefs[j]);
		}
*/
		var j = 0;
		for (var i = 0;i < ruleDefs.length;i++) {
			 if (ruleDefs[i].charAt(0) !== "|" || ruleDefs[i].charAt(1) === "!") continue;//row maybe column titles, ie the string |!Title|!Body|!Tags|!Modes| or a comment
			 arrayOfRules[j]=new Rule(ruleDefs[i]);
			 j++;
		}

		return arrayOfRules;
	}

	function Rule(defRule, modes) {
		//INPUT DEF:
		//defRule is a string of the form '|Title|Body|Tags|Fields|Init values|Modes|' or a struture {	title:'..', body:'..', tags:'..'}
		//extracts subst patterns for title, body, tags. Also extracts modes
		var Tid;
		var whiteSpace = /^\s+|\s+$/g;//use trim
		var isLinked = /^\[\[([\s|\S]*)\]\]$/;
		if ((typeof defRule) =='string' ) { //we has a row definition
			//remove triple quotes around any | - these were needed to stop TW thinking they were table elements
			var pieces = defRule.replace(/\"\"\"\|\"\"\"/g,"&bar;").split("|");
			if  (pieces.length <7) {error('short:'+defRule);throw new Error('Invalid Rule');} //error malformeed TODO: inform the user
			var tidops = getopts();
			for (var i=1;i<7;i++) {
				pieces[i]= pieces[i].replace("&bar;","|"); 
				if (pieces[i] == null) {
					if (i==1) throw new Error('Invlid Rule');//must define a name for the tid
				} else 	if (i!=3 && isLinked.test(pieces[i])) { // -there is a definition in a seperated tiddler - go get it
				    var temp=pieces[i].replace (/^\[\[([\s|\S]*)\]\]$/,"$1"); //remove  brackets
						 temp =twobj.getTidrules(temp); //this.body contains the name of the tiddler
						 if (temp != null) pieces[i] = temp;						
				} else{
					
					if (i==6)  				pieces[i] = '[{"#newdata":"'+pieces[i]+'"}]';//modes	
					else if (i==4||i==5)	pieces[i] = '['+pieces[i]+']';	
					else if (i==3) {
						  
						  if (tidops && tidops.noautoextratags && tidops.noautoextratags === "yes") {
							  if (pieces[i]) 	pieces[i] = '[{"#space":" "},{"$tags":"((*@exists($tags)*??*$tags*))((*@exists($tags)*??*#space*))'+pieces[i]+'"}]'; 
							  else 				pieces[i] ='[]'; // don't modify/create
						  } else {
							  if (pieces[i]) 	pieces[i] = '[{"#space":" "},{"$tags":"((*@exists($tags)*??*$tags*))((*@exists($tags)*??*#space*))((*@exists(@extraTags)*??*@extraTags*)) '+pieces[i]+'"}]'; 
							  else 				pieces[i] ='[{"$tags":"((*@exists(@extraTags)*??*@extraTags*)) ((*@abort(@extraTags)*)) ((*@exists($tags)*??*$tags*))"}]'; 							  
						  }
						  
					   }
					else if (i==2) {
						if (tidops && tidops.legacybody && tidops.legacybody === "yes")
						 		pieces[i] = '[{"#newdata":"'+pieces[i]+'"}]';//text	
						else
							pieces[i] =  JSON.stringify([{"#newdata":pieces[i].replaceAll("\\n","\n")}]);//text	
							}	
					else if (i==1){
						  if (pieces[i]) 	pieces[i] = '[{"$title":"'+pieces[i]+'"}]';
						  else 				pieces[i] ='[]'; // don't modify/create
					   }  			
				}
			}
			this.title =pieces[1];
			this.body  =pieces[2];
			this.tags = pieces[3];
			this.fields =pieces[4]; 
			this.InitVals=pieces[5];	
			this.modes =pieces[6];
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
//  BJ! TODO ADD A LOG THAT IS ONLY WRITTEN WHEN SAVING THE TW - this needs to be done in the finish() function of the shim
    function performAction(cat,pageData) {
		defaults.defaultCommands[cat].command(pageData);
	}
	function getconfig() {
		if (config) return config;
		if (!configName) return twobj.getTidContents("TiddlyClipConfig");
		return twobj.getTidContents(configName)||null; 
		
	}
	function setconfig (text,name) {
		config = text;
		configName = name;
	}
	function loadOpts(ClipOpts) {
			//load additional prefs from targetTW		
			var pieces =ClipOpts, opts={};
			if (!pieces) {
			return;
			}
			pieces.split(/\r?\n/mg).forEach(function(line) {
				if(line.charAt(0) !== "#") {
					var p = line.indexOf(":");
					if(p !== -1) {
						var field = line.substr(0, p).trim(),
							value = line.substr(p+1).trim();
						opts[field] = value;
					}
				}
			});
			return opts;
		 };
		 
	function getopts() {
		if (opts) return opts;
		if (!optsName) return twobj.getTiddlerData("TiddlyClipOpts");
		return twobj.getTiddlerData(optsName)||null; 
	}
	function setopts (op,name) {
		opts = loadOpts(op);
		optsName = name;
	}	
	// This is the function called when clicking the context menu item.
	function paste(catName,pageData, section, substitutionTiddler ,setCat)
	{  
		var cat, save =false;
		tiddlyclip.caller = this;
		tiddlyclip.lastevent = pageData.e||null;
		
		status ("paste enter");
		if (!setCat) {
			if (substitutionTiddler) {
				cat = findCategory (twobj.getTidContents(substitutionTiddler), catName);
			} else if (pageData.data.section === "__sys__") { //from addon - change of focused tw
				cat = findCategory (findSection(section,twobj.getTidContents("TiddlyClipSys")), catName);
			} else if (pageData.data.section === "__sysdock__") {//from addon to solicite dock 
				var tidclipconfigtext = twobj.getTidContents("TiddlyClipConfig");
				var tcconf = JSON.stringify({text:tidclipconfigtext,title:'TiddlyClipConfig'});
				var tidclipconfigopts = twobj.getTidContents("TiddlyClipOpts");
				var tcopts = JSON.stringify({text:tidclipconfigopts,title:'TiddlyClipOpts'});
				tiddlyclip.modules.tPaste.setconfig(tidclipconfigtext,'TiddlyClipConfig');
				tiddlyclip.modules.tPaste.setopts(tidclipconfigopts,'TiddlyClipOpts');
				status (dodock(tcconf,tcopts));
				return;
			} else {
				cat = findCategory (findSection(section,getconfig()), catName);
			}
			//find the table denoted by the section (a header in the TiddlyClipConfig ), then find the row (cat)
			if (!cat.valid) {
					cat = findCategory (findSection(section), catName);//look for default rule
			}
		}else {
			cat = setRules(setCat);
		}
		if (!cat.valid) {			
			status("not valid category");
			return;
		}
		status ("valid category");
		//could check for type of cat.rules if function then run -- allows module plugin with Tw5
		var cancelled = {val:false};
		var tiddlers = [],tideditMode=[];//list of tids to store
		var catTags = cat.tags;//main config tags 
		var patterns = cat.rules;
		var startrule=0;

		if(hasMode(cat,"nosub")) return;
		//now loop over each tiddler to be created(defined in the category's extension entry)
		//if a list of tiddlers are to be copied from a page then we will have to loop over them as well
		tiddlerAPI.parserReset();
		status ("before subst loop");
		if (!hasModeBegining(cat,"tiddler"))  { //user has not selected  tiddler mode
			for(var i=startrule; i<patterns.length; i++)  {	
				var tiddlerObj, writeMode;
				tiddlerObj = new tiddlerAPI.Tiddler();
				status ("before subst");
				tiddlerObj.copyCatModes(cat.modes);
				tiddlerObj.setPageVars(pageData);
				tiddlerObj.setNormal(patterns[i],pageData);
				tiddlerObj.subst(patterns[i],pageData);

				status ("after subst");	
				//tiddlerObj.text=userInput(tiddlerObj.text); //not used at present
				tiddlerObj.addTags(catTags);
				status ("after addTags");
				if (cancelled.val==true) {return;}
				//if (pageData.data.WriteMode !="none") writeMode=pageData.data.WriteMode;
				//add tiddlers one by one to our list of edits
				tiddlers.push(tiddlerObj);

				status ("after push to list");
			}
		} else { 
			var tid;
			for (tid=firstRemoteTid(pageData); hasNextRemoteTid(pageData);tid=nextRemoteTid(pageData)){
				if (!hasMode(cat,"tiddlerscopy")) {
					for(var i=startrule; i<patterns.length; i++)  {	
						var tiddlerObj, writeMode;
						tiddlerObj = new tiddlerAPI.Tiddler(tid);
						status ("before subst");
						tiddlerObj.copyCatModes(cat.modes);
						tiddlerObj.setPageVars(pageData);
						tiddlerObj.setTids(patterns[i],pageData);
						if (tiddlerObj.hasMode("nontid")) {
							tiddlerObj.fields={};
							tiddlerObj.setPageVars(pageData);
							tiddlerObj.setNormal(patterns[i],pageData);
						} 
						tiddlerObj.subst(patterns[i],pageData);
						status ("after subst");	
						//tiddlerObj.text=userInput(tiddlerObj.text); //not used at present
						tiddlerObj.addTags(catTags);
						status ("after addTags");
						if (cancelled.val==true) {return;}
						//if (pageData.data.WriteMode !="none") writeMode=pageData.data.WriteMode;
						//add tiddlers one by one to our list of edits
						tiddlers.push(tiddlerObj);

						status ("after push to list");
					}
				}
				else {
					tiddlerObj=new tiddlerAPI.Tiddler(tid);
					var writeMode;//no editmode
					tiddlerObj.addTags(catTags);
					tiddlers.push(tiddlerObj);
				}
			}

		}
		if(hasMode(cat,"immediate")) {
			status ("before immediate tids to tw");
			var tidimmdiate=[];
			for (var i =0; i< tiddlers.length; i++) {
				tidimmdiate.push(twobj.immediatetids(tiddlers[i]));
			}
			return tidimmdiate;
		}

		if(hasMode(cat,"nosave")) return;
		status ("before adding to tw");
		var tidnames=[];
		for (var i =0; i< tiddlers.length; i++) {
			if (!tiddlers[i].noSave()){
				addTiddlerToTW(tiddlers[i]);
				save = true;
			}
			if(tiddlers[i].hasMode("open")) tidnames.push(tiddlers[i].fields.title);
		}
		if(hasMode(cat,"nofin")) return;
		if(hasMode(cat,"noautosave")) save = false;
		twobj.finish(tidnames,save);
	}  
     
    function save(tiddlerObj) {
		switch (tiddlerObj.getSaveMode()) {
			case 'add/import':
				if (twobj.tiddlerExists(tiddlerObj.fields.title))  twobj.importtids(tiddlerObj);
				else twobj.modifyTW(tiddlerObj);
			break;
			case 'add':
				twobj.modifyTW(tiddlerObj);
			break;
			default: //import
				twobj.importtids(tiddlerObj);
		}
	}
		
	function addTiddlerToTW( tiddlerObj) { 

		switch (tiddlerObj.getWriteMode()) {
			case 'once':
				var oldtid = twobj.getTiddler(tiddlerObj.fields.title);//retrieve existing version
				if (!!oldtid) break;
				save(tiddlerObj);
				break;
			case 'move':
				var oldtid = twobj.getTiddler(tiddlerObj.fields.title);//retrieve existing version
				if (!!oldtid)  {
					oldtid.fields.title =oldtid.fields.title +'/'+ new Date();//move old tid by appending the date to its title
					oldtid.modes = tiddlerObj.modes //need to know the save mode
					save(oldtid);//move out the way
				}
				save(tiddlerObj);
				break;
			case 'inc':
				tiddlerObj.fields.title = twobj.getNewTitle(tiddlerObj.fields.title); 
				save(tiddlerObj);
				break;
			case 'delete':
				tiddlerObj.fields.title = twobj.deleteTiddler(tiddlerObj.fields.title); 
				break;
			default: //import
				save(tiddlerObj);

		}
	}

	return api;
}());
///end tPaste ///
tiddlyclip.modules.twobj = (function () {

	var api = 
	{
		onLoad:onLoad, 			tiddlerExists:tiddlerExists,
		modifyTW:modifyTW,		getTiddler:getTiddler,
		getTidContents:getTidContents,finish:finish,
		importtids:importtids,	getNewTitle:getNewTitle,
		getTidrules:getTidrules, getTiddlerData:getTiddlerData,
		immediatetids:immediatetids,deleteTiddler:deleteTiddler
	}
	var   tiddlerAPI;
	function onLoad () {
				tiddlerAPI 	= tiddlyclip.modules.tiddlerAPI;
	}
	var tw =null;
	var storeStart;		

	function getTidContents(tidname) {
			return tiddlyclip.getTidContents(tidname);
	}
    
    function getTiddlerData(tid) {
			return tiddlyclip.getTiddlerData(tid);
	}

    function deleteTiddler(tid) {
			return tiddlyclip.deleteTiddler(tid);
	}
	
	function getTidrules(tidname) {
			return tiddlyclip.getTidrules(tidname);
	}
		
	function getNewTitle(tidname) {
			return tiddlyclip.getNewTitle(tidname);
	}
	function getTiddler(tidname) {	
		var storedTid=tiddlyclip.getTiddler(tidname);
		if (storedTid) {
			return (new tiddlerAPI.Tiddler(storedTid,true));
		}
		else return null;
	}		
	function modifyTW(t)
	{
	    var fields={}; 
		t.attribs = t.attribs.filter(function(i) {return t.toRemove.indexOf(i) < 0;});
		for (var i = 0; i < t.attribs.length;i++) {
				fields[t.attribs[i]]=t.fields[t.attribs[i]];//put extended fields into a group
		}
		tiddlyclip.modifyTW(fields);
	}		

	function importtids(t){
	    var fields={}; 
		t.attribs = t.attribs.filter(function(i) {return t.toRemove.indexOf(i) < 0;});
		for (var i = 0; i < t.attribs.length;i++) {
				fields[t.attribs[i]]=t.fields[t.attribs[i]];//put fields into a group
		}
		tiddlyclip.importTids(fields);
	}	
	
	function immediatetids(t){
	    var fields={}; 
		t.attribs = t.attribs.filter(function(i) {return t.toRemove.indexOf(i) < 0;});
		for (var i = 0; i < t.attribs.length;i++) {
				fields[t.attribs[i]]=t.fields[t.attribs[i]];//put fields into a group
		}
		return fields;
	}
		   			   
	function tiddlerExists(title) {
			return tiddlyclip.tiddlerExists(title);
	}	

	function finish(tids,save) 
	{
		tiddlyclip.finish(tids,save);
	}
			   			   
	return api;
}());
///end twobj///

tiddlyclip.modules.tiddlerAPI = (function () {

	var api = 
	{
		onLoad:onLoad, Tiddler:Tiddler, parserReset:parserReset
	}
	var tcBrowser, twobj,pref, util, table;
	
	function onLoad(doc) {
		tcBrowser	= tiddlyclip.modules.tcBrowser;
		twobj		= tiddlyclip.modules.twobj;	
		defaults	= tiddlyclip.modules.defaults;
	}
	function parserReset() {
		table={'%':{}};
	}
	function createDiv(){
		return document.createElement("div");
	}
	// Static method to bracket a string with double square brackets if it contains a space
	function encodeTiddlyLink(title)
	{
		return title.indexOf(" ") == -1 ? title : "[[" + title + "]]";
	};

	// Static method to encodeTiddlyLink for every item in an array and join them with spaces
	function encodeTiddlyLinkList(list)
	{
		if(list) {
			var t,results = [];
			for(t=0; t<list.length; t++)
				results.push(encodeTiddlyLink(list[t]));
			return results.join(" ");
		} else {
			return "";
		}
	};
	function removeDuplicates(names) {
		var i,j,dup,nams = []; 

		// Parse a string array from a bracketted list. For example "OneTiddler [[Another Tiddler]] LastOne"
		var parseStringArray = function(value) {
			if(typeof value === "string") {
				var memberRegExp = /(?:^|[^\S\xA0])(?:\[\[(.*?)\]\])(?=[^\S\xA0]|$)|([\S\xA0]+)/mg,
					results = [],
					match;
				do {
					match = memberRegExp.exec(value);
					if(match) {
						var item = match[1] || match[2];
						if(item !== undefined && results.indexOf(item) === -1) {
							results.push(item);
						}
					}
				} while(match);
				return results;
			} else {
				return null;
			}
		};
		nlist = parseStringArray(names);
		/*
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
			if (!dup) nams.push(nlist[i]);
		}
		*/
		return encodeTiddlyLinkList(nlist);
	}
	function Tiddler(el,truetid) {
		this.attribs = ["text"];
		this.toRemove =[];
		var current = this;
		current.fields = {};
		current.fields.text ="";
		//current.fields.title ="";	
		
		function convertedFromJSON(el) {
				try {
					var tid =JSON.parse(el);
					for (var atr in tid){
						current.fields[atr]=tid[atr];
						current.attribs.push(atr);		
					}
					return true;
				} catch(e){
					return false;
				}
		}
		if (!el) { 
			el =  tiddlyclip.newProtoTiddler();
			for (var atr in el.fields){ 
					current.fields[atr]=el.fields[atr];
					current.attribs.push(atr);		
			}			

		    this.fields.tags="";//BJ FIX remove or move to adapter
		} else if (!truetid) {
			if((typeof el) ==="string"){ 
				if (convertedFromJSON(el)) return this; //conversion complete
				//convert html to dom ;
				var wrapper= createDiv();
				wrapper.innerHTML= el;
				el= wrapper.firstChild;
				wrapper = {};//release div
			}								 				
			this.fields.text = undoHtmlEncode(el.innerHTML.
					replace(/\n<pre xmlns="http:\/\/www.w3.org\/1999\/xhtml">([\s|\S]*)<\/pre>\n/mg,"$1").
					replace(/\n<pre>([\s|\S]*)<\/pre>\n/mg,"$1"));
			var  j = el.attributes, m, extraTags='';
			for (var i = j.length; i!== 0; i--) {
				m=j[i-1].nodeName; 
				v=j[i-1].value;
				this.attribs.push(m);
				this.fields[m] = undoHtmlEncode(v) ;
			}
		} else {
			for (var atr in el.fields){ 
				current.fields[atr]=el.fields[atr];
				current.attribs.push(atr);		
			}
			if (!!this.fields.tags) this.fields.tags = (this.fields.tags instanceof Array)?this.fields.tags.join(' '):this.fields.tags;
		    else this.fields.tags="";
			//this.body =   this.text;
		} 
		
		return this;
	}
	
	Tiddler.prototype.copyCatModes=function(modes) {
		this.catModes = modes;
	}

	Tiddler.prototype.hasCatMode=function(mode){
		if (!this.catModes) return false;
		for (var i=0; i< this.catModes.length;i++)
			if (mode === this.catModes[i]) return true;
		return false;
	}
	
	Tiddler.prototype.addMimeType=function(mime){
		this.attribs.push('type');
		this.fields.type = mime;
	}
	
	Tiddler.prototype.exportFieldsTo=function(obj){
		if (!obj) return null;
		for (var i = 0; i<this.attribs.length; i++){ 
			var atr = this.attribs[i];
			obj[atr]=this.fields[atr]; 	
		};					 
		return obj;
	}	

	Tiddler.prototype.noSave=function(){
		return (!this.fields.title ||this.hasMode("nosave"));
	}
		
	Tiddler.prototype.addTags=function(tags){
		if (!tags) return;
		if (!this.fields.tags) {
			this.fields.tags = removeDuplicates(tags);
			this.attribs.push("tags");	
		}
		else {
			this.fields.tags = removeDuplicates(this.fields.tags + ' '+ tags);
		}
	}

	Tiddler.prototype.applyEdits = function(fields) {
		for (var i in fields){				
			if (!this.hasOwnProperty(i)) this.attribs.push(i);//add to list of fields to update. BJ should be this.attribs.hasOwnProperty(i)??
			this.fields[i] = fields[i];
		}
	}
	
	Tiddler.prototype.removeField = function(field) {
			this.toRemove.push(field);
	}

	Tiddler.prototype.hasMode=function(mode){
		if (!this.modes) return false;
		for (var i=0; i< this.modes.length;i++)
			if (mode === this.modes[i]) return true;
		return false;
	}
	
	Tiddler.prototype.getWriteMode=function(mode){
		var writeMode = 'normal';
		if (!this.modes) return writeMode;
		if (this.hasMode("move")) return "move";
		else if (this.hasMode("once")) return "once";
		else if (this.hasMode("inc")) return "inc";
		else if (this.hasMode("delete")) return "delete";
		return writeMode;
	}
	
	Tiddler.prototype.getSaveMode=function(mode) {
		if (!this.modes) return 'import';
		else if (this.hasMode("add/import")) return "add/import";
		else if (this.hasMode("add")) return "add";
		return 'import';
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

	function extractModes(tagString) {
		var modes =[], tList = tagString.split(' ');
		for (var i=0; i< tList.length; i++) {
			modes[i] = tList[i].trim();
		}
		return modes;
	}
	Tiddler.prototype.setPageVars  =	function (pageData){
		var dateLong=    'DDD, MMM DDth, YYYY';
		var dateTimeLong='DDD, MMM DDth, YYYY at hh12:0mm:0ss am';	
		var dateShort=   'DD MMM YYYY';//journal form
		var dateTimeShort=   'YYYY/MM/DD 0hh:0mm:0ss';//journal form

		var dates =tiddlyclip.dates();
		for (var atr in dates){ 
			pageData.data[atr]=dates[atr];
		}
		if (!!pageData.data.category) {
			pageData.data.category1stWord=pageData.data.category.replace(/(.*) (.*)/,"$1");
		}
		var macrosx =defaults.getDefs();
		table['$']={};table['#']={};table['@']={};
		for (var n in pageData.data) {table['@'][n]= pageData.data[n];}
		for (var n in macrosx) {table['@'][n]= macrosx[n];}
	}

	Tiddler.prototype.setTids  =	function (rule,pageData){

		//---first determine the title
		table['#']={};	
		this.exportFieldsTo(table['$']);
		this.parseStructure(rule.title);
		var title = table['$'].title;			 
		table['@']['newtiddler']= 'false';

		//xecute mode rule and obtain (possibly) modified modes
		this.parseStructure(rule.modes);			 
		this.modes=extractModes(table['#']['newdata']);
		//---modes are now determined 
	}
	
	Tiddler.prototype.setNormal  =	function (rule,pageData){

		//---first determine the title
		this.parseStructure(rule.title);
		var title = table['$'].title;			 
		table['#']={};		
		//---next we need to find the modes before we can decide how to update
		//-----1- does tiddler exist already?
		var storedTid=twobj.getTiddler(title);
		if (storedTid) {
			storedTid.exportFieldsTo(table['$']);
			table['@']['newtiddler']= 'false';
		} else {
			table['@']['newtiddler']= 'true';
			this.exportFieldsTo(table['$']);
		}
		//-----2- execute mode rule and obtain (possibly) modified modes
		this.parseStructure(rule.modes);			 
		this.modes=extractModes(table['#']['newdata']);
		//---modes are now determined 
		table['#']={};
		table['$']={};

		//---expose whether this is a new tiddler
		if (this.hasMode('append')||this.hasMode('prepend')||this.hasMode('modify')) {
			var storedTid=twobj.getTiddler(title);
			if (storedTid) {
				storedTid.exportFieldsTo(table['$']);
				table['@']['newtiddler']= 'false';
			} else { 
				this.exportFieldsTo(table['$']);
				this.parseStructure(rule.InitVals);
				table['@']['newtiddler']= 'true';
			}
		}
		else 
		{
			this.exportFieldsTo(table['$']);
			this.parseStructure(rule.InitVals);
			table['@']['newtiddler']= 'true';
		}
		table['$'].title=title;
	}
	Tiddler.prototype.subst  =	function (rule,pageData){
		//---apply rules
		table['#']={};
		this.parseStructure(rule.body);	
		//---check to see if user will handle insertion of new text		 
		if (!this.hasMode('no-textsaver')) {
			var data = table['#']['newdata'], prepend =this.hasMode('prepend');
			status ("not textsaver with data "+ data+" olddata "+	table['$']['text']);
			//BJ does this.fields.text exist with a new tiddler? 
			table['$']['text'] = (!!prepend)?data + table['$']['text'] :table['$']['text'] + data;
		}
		table['#']={};
		this.parseStructure(rule.tags);	

		table['#']={};
		table['@'].fields=table['$'];
		if (table['@']['#nofieldupdates'] !=='true') this.parseStructure(rule.fields);
		//---move data from parser table into tiddler
		this.applyEdits(table['$']);
		return this;
	}
	///////////////// parser implementation /////////////////
	var error=function (message) {
		 alert(message);
	}

    function setStatus(x) {
		table['@']['$$']=x;
	}

	function getSimpleVarFrom (n ) {
		n = n.trim();
		var type = n.substring(0,1);
		if (type !== '#' &&type !=='$' && type !=='@'&& type !=='%') error("variable: invalid name "+n);
        else return {type:type, leftSide:n.substring(1)};
	}
	function valOf(n, test) {
		var val, type = n.substring(0,1);
		if (type !== '#' &&type !=='$'&&type !=='@'&& type !=='%'){
			if (!test) error("source: invalid name"+n);
			return null;
		}
		else {
			val=table[type][n.substring(1)];
			if (val == undefined) { 
				if (!test)  error("source: invalid val "+n);
				return null;
			}
			return val;
		}
	 }
	function toValues(sources,test) {
		var values = [], returned;
		for (var i = 0 ; i < sources.length ;i++) {
			if ((values[i]= valOf(sources[i],test))==null) return null;
		}
		return  values;
	}
	function makeInt (value) {
		if(/^(\-|\+)?([0-9]+)$/.test(value)) {
			return Number(value);
		}
		return NaN;
	}

	Tiddler.prototype.parseStructure=function(cb,localonly) {
		//updates the global 'table'
		var target, b;
		try {
		b=JSON.parse(cb);
		} catch(e) {
			error(cb+" is not a json");
			return;
		}
		for (var i=0; i < b.length; i++) {
			var moreThanOne = 0,replaceOp;
			for (var n in b[i]) {//n is our nodes combined target/operator string - eg #x#EQ
				if (moreThanOne) error ("general:more than one subterm in node");
				var rightSide =b[i][n];
				if (typeof rightSide === "object") {
					//lookup parser
					var parser = tiddlyclip.oparser[rightSide.parser];
					if (parser) {
						replaceOp= this.replaceALL(rightSide.text);
						if (!replaceOp.abort) rightSide =  this.replaceALL(parser (replaceOp.result)).result;
						else  {
							moreThanOne++;
							break;
						}
					}
					else error("source: invalid type object");
				}
				else if (typeof rightSide === "string") {
					replaceOp= this.replaceALL(rightSide);
				
					if (!replaceOp.abort) rightSide = replaceOp.result;
					else {
							moreThanOne++;
							break;
					}
				} else error("source: invalid type");
				
				var returedVals =  getSimpleVarFrom (n);
				var leftSide =  returedVals.leftSide;
				var type 	 =  returedVals.type;
				if (type !== '#' &&type !=='$' &&type !=='%' &&type !=='@'){ 
					error("target: invalid name "+n);	
					continue;
				}		
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
	 Tiddler.prototype.abort=function(source) {
		if (/@abort\(/.test(source) ){ return true;}
		return false;
	}
	 Tiddler.prototype.handleFunction=function(source) {
		var self = this, abort=false;
		function alertAll() {
			var args = Array.prototype.slice.call(arguments);
			args.unshift('alertAll');
			alert(args.join(' '));
		}
		if (!/@(.*)\(([\S\s]*?)\)/.test(source) )return {result:null,abort:abort};
		//abort macro
		return {result:source.replace(/@(.*)\(([\S\s]*?)\)/g,function(m,key1,key2,offset,str){
			if (key1=="delete") {
				self.removeField(key2.substring(1));
				return "deleted "+key2;
			}
			if (key1=="abort") {
				if (!key2) {abort=true;return null;} //empty params means abort whatever
				if (valOf(key2, true) == null) {abort=true;return null;} //if val not exist abort
				if (valOf(key2) === 'false'){abort=true;return null;}
				return "";//otherwise just remove the abort() token
			}
			if (key1=="exists") {
				if (valOf(key2, true) != null)
					return "true";
				else
					return "false"
			}
			if (key1=="alert") {
				if (valOf(key2,true) == null)
					alert(key2+" null");
				else
					alert(valOf(key2));
				return "alerted";
			}

			//handle normal functions
			var vals;
			if (!!key2) vals = toValues(key2.split(/\s*,\s*/));
			else vals = null;
			if (key1=="alertAll") {
				alertAll.apply(null,vals);
				return "all alerted";
			}
			try {
				if (key1.charAt(0) === "_") throw ("invalid name");
				tiddlyclip.setMacroInterface ({_s:function (x){return table[x];}, _hasGlobalSaver:!self.hasCatMode("nosave")});
				return tiddlyclip.macro[key1].apply(tiddlyclip.macro,vals);
			}
			catch(e) {
				if (typeof e === "string" && e === "tcabort") {

				} else {
					alert (key1 + " marco not found");	
					console.log(e);
				} 
				abort = true;
			}
/*
			try {
				return tiddlyclip[key1](val);
			} catch (e) {
				error ("macro "+key1 +" not found");
				return "macro " + key1 + " not found";
			} 
*/				
			return m;
		}),abort:abort};
	}
	
	Tiddler.prototype.replaceALL=function(source, data){ //replace all ((* *)) delimited strings
		var self = this, abort=false;
		return {result:source.replace(/\(\(\*([\S\s]*?)\*\)\)/g,function(m,key,offset,str){ 
			var parts, vals, res, firstterm, firstparts, testedTrue = true;
			// check for  ((*conditional*??*Use this variable*??*or use this variable*))
			firstparts= key.split("*??*");
			//handle conditional string
			if (firstparts.length >1) {	
				var negate=(firstparts[0].substring(0,1)== '!');
				if (negate) {
					firstterm = firstparts[0].substring(1);
				} else {
					firstterm = firstparts[0];
				}
				// regex condition
				if ((parts= firstterm.split("/")).length ==3) {
					if ((vals = toValues(parts)) == null) return m;
					var regParts = (valOf(parts[1])).split("/");
					var pattern=new RegExp(regParts[1],regParts[2]);
					
					if (negate&&pattern.test(vals[0])) testedTrue = false;
					else if (!negate&&!pattern.test(vals[0]))testedTrue = false;
				}
				// comparision
				else if ((parts= firstterm.split("==")).length ==2) {
					if ((vals =toValues(parts))==null) return m;
					if ((res=handleBinaryForm(vals[0],negate?"NQ":"EQ",vals[1]))==null) return m;
					else if (!res) testedTrue = false; 
				} 
				// macro
				else if ((res = self.handleFunction(firstterm).result) != null) { // a function
					if ( negate && res==="true") 	{testedTrue = false;}
					if (!negate && res==="false") {testedTrue = false;}

				}
				// boolean variable
				else {
					if ((vals =valOf(firstterm))==null)  return m;
					if ( negate && vals==="true") 	testedTrue = false;
					if (!negate && vals==="false") testedTrue = false;
				}

				if (testedTrue) {
					key = firstparts[1];
				} 
				else { 
					if (firstparts.length == 2) return '';//no 'else' defined
					key = firstparts[2];
				}
			}
			// end of handling conditional string part
			var parts;
			// regex ((*@PageRef/#rule/#term*)) or ((*.....*??*@PageRef/#rule/#term*))
			if ((parts = key.split("/")).length ==3) {
				if ((vals = toValues(parts)) == null) return m;
				var regParts = (valOf(parts[1]));
				var regexBody = regParts.replace(/\/([\s\S]*)\/.*$/,"$1");
				var regexflags = regParts.replace(/.*\/(.*?)$/,"$1");
				var pattern=new RegExp(regexBody,regexflags);
				setStatus(null);
			return vals[0].replace(pattern, function(match){setStatus("r"); return match.replace(new RegExp(regexBody,regexflags), vals[2]);});
			}
			// substitute
			if ((parts = key.split(":")).length ==3) {
				if ((vals = toValues(parts)) == null) return m;		
				//var strg = str.replace(/i/g, function(token){replaced = true; return '!';});
				setStatus(null);
				return vals[0].replace(vals[1], function(token){setStatus("r"); return vals[2];});
			}
			// add 
			if ((parts = key.split("+")).length == 2) {
				if ((vals = toValues(parts)) == null) return m;
				if ((res = handleBinaryForm(vals[0],"PS",vals[1])) == null) return m;
				return res.toString();
			}	
			// subtract	
			if ((parts= key.split("-")).length ==2) {
				if ((vals = toValues(parts,true)) != null) {
					if ((res = handleBinaryForm(vals[0],"MS",vals[1])) == null) return m;
					return res.toString();
				}
			}
			// macro
			var returned = self.handleFunction(key);
			if (returned.abort) {abort=true; return null};//abort replaceAll completely
			if ((res = returned.result) != null) return res;
			else 
			// vanilla variable
			if ((res = valOf(key,true)) != null) return res;
                        else return "";
			// error
			return m;
		}),abort:abort};
    }
	///////////////// parser implementation end/////////////////
	return api;
	
}());
///end tiddlerObj///
 tiddlyclip.modules.defaults = (function () {
	var defaultCommands = {
		search:{tip:'search selection in tw', command:function(){alert("mysearch")}}
	};
	var tPaste, twobj;
	function onLoad() {
		twobj=tiddlyclip.modules.twobj;
	}
	var api = 
	{
		onLoad:onLoad, getDefaultRule:getDefaultRule, 
		getDefaultCategories:getDefaultCategories,
		getDefs:getDefs,
		defaultCommands:defaultCommands
	}	

	function getDefs(){
		if (!twobj.tiddlerExists("TiddlyClipDefs"))  return tiddlyclip.defs;

		var content = twobj.getTidContents("TiddlyClipDefs");//where all marcos are defined	
		try {
			if (content =="") return tiddlyclip.defs;
			var values =JSON.parse(content);
			if (!!values) {return values;}
		}catch(e){	
		}
		return tiddlyclip.defs; 
	}
	
	function getDefaultCategories() {
		return tiddlyclip.defaultCategories;
	}		
 
	function getDefaultRule(ruleName) {
		return tiddlyclip.getDefaultRule(ruleName);
	}
 	return api;
}());
///end defaults///


var MODULES = tiddlyclip.modules;
for (var mod in MODULES) {
	MODULES[mod].onLoad();
}

} 

}());

