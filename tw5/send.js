




exports.name ="send";
exports.run  = function(action,text,aux,extra) {
	  var result = this.sendraw(action,text,aux,extra);
	  if (result == 'undocked') alert ("tiddlywiki is not docked!");
};
