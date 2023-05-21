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
    throw("is undefined");

};

var compute = function (str, widget) {
    var x, subtid = str.split('->'),subfld;
    if (subtid.length ===2) {
        subfld=$tw.utils.parseTextReference(subtid[1]);
        if (!subfld.field) return null;
        x=widget.wiki.getSubTiddler(subtid[0],subfld.title);
        return x? (x.getFieldString(subfld.field)): null;
    };
	return widget.wiki.getTextReference(str);
}

exports.run = doAssign;
exports.symbol = ':';
