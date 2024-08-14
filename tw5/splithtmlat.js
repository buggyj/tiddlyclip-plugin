function regexIndexOf(string, regex, startpos) {
    var indexOf = string.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}
exports.name ="splithtmlat";
exports.run  = function(base,n,upper) {
var r = 0,xmlLen=0;
var xBracOpn,xBracCls=0;
var n = n*1;
console.log ("n",n)
var c = 0;
while ((c<15)&&(xBracCls < base.length)) {
//find location of xml tag 
c++;
console.log ("xBracCls",xBracCls)
    xBracOpn = regexIndexOf(base,/<\/?[^<]+?>/, xBracCls);;console.log ("xBracOpn",xBracOpn)
     //xBracOpn = base.indexOf(/<.+?>/, xBracCls);console.log ("xBracOpn",xBracOpn)
     if ((xBracOpn === -1)||(xBracOpn > (n + xmlLen))) break; //no more xml found or passed split point. 
     xBracCls = base.indexOf(">", xBracOpn);
     xmlLen += (1+xBracCls-xBracOpn); console.log("xmlLen",xmlLen)
    
}
   r = n + xmlLen;
console.log ("r",r)
    if (upper == '0') return base.substring(0, r);
    return base.substring(r);


}
