exports.name ="readvar";
exports.run = function(x) 
{
return tiddlyclip.caller.getVariable(x)
};