/*\
module-type: library
tags: $:/tags/tiddlyclip
title: bj/tiddlyclip/getCellPosition.js
type: application/javascript

\*/


//local rule - works on local taget 
exports.name ="%getCellPosition";
exports.run  = function(xmin,ymin) {
var xmin=xmin || 0;
var ymin=ymin || 0;

try{
var e =this._lastevent();

var cell = e.target.closest('td,th');
var row = (cell.parentNode.rowIndex);
var col =cell.cellIndex;

    if (isNaN(row) || isNaN(col)) throw ("tcexit");
    if (col < xmin || row < ymin) throw ("tcexit");
     return `${col} ${row}`;
}catch(e){console.log(e)}
	throw ("tcexit");
}