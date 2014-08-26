	tiddlyclip.dates=function(){
		var dates ={};
		var dateLong=    'DDD, MMM DDth, YYYY';
		var dateTimeLong='DDD, MMM DDth, YYYY at hh12:0mm:0ss am';	
		var dateShort=   'DD MMM YYYY';//journal form
		var dateTimeShort=   'YYYY/MM/DD 0hh:0mm:0ss';//journal form
		
		dates.yearMonth=(new Date()).convertToYYYYMMDDHHMMSSMMM().replace(/(.*)\.(.*)/,"$1").substr(0,6);
		dates.dateTimeLong=  new Date().formatString(dateTimeLong);	//replaces  %dateTimeLong%
		dates.dateLong=      new Date().formatString(dateLong);		//replaces  %dateLong%
		dates.dateShort=     new Date().formatString(dateShort);		//replaces  %dateShort%     
		dates.dateTimeShort=     new Date().formatString(dateTimeShort);		//replaces  %dateShort%   
		dates.dateComma=     dates.dateShort.toString().replace(/ /g,':');
		return dates;
	}
	tiddlyclip.getDefaultRule=function (ruleName) {
		var defaultRules = {
			defaultTid:'||||||no-textsaver|',
			defaultText:"|((*@pageTitle*))|((*@pageRef*)) <br>date='((*@dateTimeLong*))', <html>((*@text*))</html>||||append|",
			defaultWeb: "|((*@pageTitle*))|((*@pageRef*)) <br>date='((*@dateTimeLong*))', <html>((*@web*))</html>||||append|"
		}
		return defaultRules[ruleName];
	}
	
	tiddlyclip.defs = {
	FOLDSTART:'ᏜᏜᏜᏜ*',
	FOLDCONTENT:'!/%%/'
	}
	
	tiddlyclip.newProtoTiddler = function (){
		var tid = new window.Tiddler(),current={fields:{}};
		store.forEachField(tid,function(tiddler,fieldName,value){
					current.fields[fieldName]=value;},false);
					
		current.fields.created=new Date();
		current.fields.modified=new Date();
		current.fields.creator=config.options.txtUserName;
		return current;
	}
	tiddlyclip.modifyTW= function(fields){
		var t= {fields:{},attribs:[]};
		t.fields = fields;
		fields = {};
		if (!!t.fields.modified ) t.fields.modified=(t.fields.modified instanceof Date) ? t.fields.modified : Date.convertFromYYYYMMDDHHMM(t.fields.modified);
		t.fields.created=(t.fields.created instanceof Date) ? t.fields.created : Date.convertFromYYYYMMDDHHMM(t.fields.created);
		for (var j in t.fields)  t.attribs.push(j); 
		var exclude = ["title","modifier","modified","created","creator","tags","text"];
		t.attribs = t.attribs.filter(function(i) {return exclude.indexOf(i) < 0;});
		for (var i = 0; i < t.attribs.length;i++) {
			fields[t.attribs[i]]=t.fields[t.attribs[i]];//put extended fields into a group
		}
				
		var tiddler = store.saveTiddler(t.fields.title,t.fields.title,t.fields.text,t.fields.modifier,t.fields.modified,
										t.fields.tags,fields,false,t.fields.created,t.fields.creator);
	}
	tiddlyclip.getTidContents= function(tidname) {
			return store.getTiddlerText(tidname);
	}
	tiddlyclip.tiddlerExists= function(title) {
			return(store.tiddlerExists(title));
	}	
	tiddlyclip.getTiddler= function (title) {
		/*
		var tid=store.getTiddler(title);
		if (!tid){
			return null;
		}
		var storedTid = {fields:{}};
		store.forEachField(tid,function(tiddler,fieldName,value){
			storedTid.fields[fieldName]=value;
		});
		return storedTid;
	}*/		

		var storedTid=null;
		var temp=store.getTiddler(title);
		if (temp) {
			storedTid = {fields:{}};
			store.forEachField(temp,function(tiddler,fieldName,value){
				storedTid.fields[fieldName]=value;
			});
			storedTid.fields['title']=title;
		}			
		if (storedTid) {
			if (!!storedTid.fields.modified ) storedTid.fields.modified=
					(storedTid.fields.modified instanceof Date) ? storedTid.fields.modified : Date.convertFromYYYYMMDDHHMM(storedTid.fields.modified);
			storedTid.fields.created=(storedTid.fields.created instanceof Date) ? storedTid.fields.created : Date.convertFromYYYYMMDDHHMM(storedTid.fields.created);
			return (storedTid);
		}
		
		else return null;
	}
	
	tiddlyclip.finish=function (tids) {
		//tiddlyspace either expects a list of tids (not titles) or a null - we could get the tids here or put null
		autoSaveChanges(null,null); 
	}
	tiddlyclip.importTids =function (tidfields) {
	}
    tiddlyclip.macro = {};
;
