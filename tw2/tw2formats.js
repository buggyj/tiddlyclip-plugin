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
