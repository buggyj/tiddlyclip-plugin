/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;
var widget = new Widget();
widget.wiki = $tw.wiki;
var doAssign = function(str) {
var contents = str.replace(/\{\{(.+)\}\}/,"$1").trim();
	
alert(contents+"="+compute(contents,widget));
	return compute(contents,widget)||str+" is undefined";
};

var compute = function (str, widget) {
	return widget.wiki.getTextReference(str);
}

exports.run = doAssign;
exports.symbol = ':';
