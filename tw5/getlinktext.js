//local rule - works on local taget 
exports.name ="getLinkText";
exports.run  = function(errorcode) {
var onerror="tcabort";
if (errorcode && errorcode==="exit") onerror = "tcexit";
	try{
		var lastevent = this._lastevent();
		console.log(lastevent.target);
		if (lastevent.target.nodeName !== "A" && lastevent.target.nodeName !== "a") throw ("not a link");
		return lastevent.target.innerHTML;
	}catch(e){
		console.log(e)
		throw(onerror);
	}
}