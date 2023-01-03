exports.name ="userinput";
exports.run  = function(prompt) {

	var res=window.prompt(prompt);
    if (res === null) {throw ("tcabort");}
   else return res;
}