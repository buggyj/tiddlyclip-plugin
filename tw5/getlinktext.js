//local rule - works on local taget 
exports.name ="getLinkText";
exports.run  = function(errorcode) {
var onerror="tcabort";
if (errorcode && errorcode==="exit") onerror = "tcexit";
	try{
		console.log(this._lastevent.target);
		if (this._lastevent.target.nodeName !== "A" && this._lastevent.target.nodeName !== "a") throw ("not a link");
		return this._lastevent.target.innerHTML;
	}catch(e){
		console.log(e)
		throw(onerror);
	}
}