exports.name ="writevar";
exports.run = function(v,str,n) 
{
var node =  tiddlyclip.caller;
for (var i = 0; i>=n; i++)  if (node.parentWidget) node = node.parentWidget;
return node.setVariable(v,str);
};