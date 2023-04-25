exports.name ="newtitleplusplus"; 
exports.run  = function(baseTitle,suffix) {

		var c = 1, title = baseTitle, s, append = "";
        if (!!suffix && baseTitle.endsWith(suffix)) {
             baseTitle = baseTitle.slice(0, -suffix.length);
             append = suffix;
        }
		s = baseTitle.search(/[0-9]+(?![^0-9]+)/g);
		if (s != -1) {
			c = 1 + parseInt(baseTitle.substring(s)); 
			baseTitle = baseTitle.substring(0,s);
			
		} 
		title = baseTitle  + c + append;	
		
		while($tw.wiki.getTiddler(title) ) {
			title = baseTitle + 
				(++c)+append;
		}
		return title;
}