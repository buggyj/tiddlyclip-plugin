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
    var x, subtid = str.split('->'),subfld;
    if (subtid.length ===2) {
        subfld=$tw.utils.parseTextReference(subtid[1]);
        x=widget.wiki.getSubTiddler(subtid[0],subfld.title);
        if (!subfld.field) return "";
        return x? (x.getFieldString(subfld.field)): "";
    };
	return widget.wiki.getTextReference(str);
}

exports.run = doAssign;
exports.symbol = ':';
