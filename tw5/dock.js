
exports.name ="dock";
exports.run  = function(configobj,aux,name) {
var config = $tw.wiki.getTiddler(configobj) || {fields:{}};
var other =  $tw.wiki.getTiddler(aux) || {fields:{}};
name = name || document.title;
tPaste.setconfig(config.fields.text,config.fields.title);
return tiddlyclip.modules.dodock(JSON.stringify(config.fields),name,JSON.stringify(other.fields));

};
