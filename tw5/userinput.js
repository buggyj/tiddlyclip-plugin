exports.name ="userinput";
exports.run  = function(prompt,now) {

	var now=now||"", res=window.prompt(prompt,now);
    if (res === null) {throw ("tcabort");}
   else return res;
}