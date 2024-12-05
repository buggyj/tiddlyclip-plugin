exports.name ="openwin";
exports.run  = function(strUrl, strWindowName, strWindowFeatures, strTime) {			
var pp =	window.open(strUrl, strWindowName,strWindowFeatures);

                setTimeout(() => {pp.close()},strTime*1000)

return "";
}
