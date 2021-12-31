/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;
var widget = new Widget();
widget.wiki = $tw.wiki;
var doAssign = function(str) {
var x, contents = str.replace(/\{\{(.+)\}\}/,"$1").trim();
	
	x= compute(contents,widget);
    if (typeof x === 'string') return x;
    return str+" is undefined";

};

var compute = function (str, widget) {
    var x, subtid = str.split('->');
    if (subtid.length ===2) {
        x=widget.wiki.getSubTiddler(subtid [0],subtid [1]);console.log(JSON.stringify(x));
        return x? (x.fields.text) : "";
    };
	return widget.wiki.getTextReference(str);
}

exports.run = doAssign;
exports.symbol = ':';
