/*\
module-type: library
tags: $:/tags/tiddlyclip
title: $:/bj/tiddlyclip/downRow.js
type: application/javascript

\*/

//local rule - works on local taget 
exports.name ="downRow";
exports.run  = function(table,xy) {
var coords = xy.split(" ");

function downRow(table,y) { 		
	var lines = table.trim().split("\n");
	var j = 0;

	for (var i = 0;i < lines.length;i++) {
		 if (lines[i].charAt(0) === "|") break;//find start of table
		 j++;
	}
    //move row
if ((y*1 + j) < lines.length-1){
 let temp = lines[y*1 + j];
lines[y*1 + j] = lines[y*1 + j +1];
lines[y*1 + j +1] = temp;
} 
    return (lines.join("\n"))
}
return (downRow(table,coords[1]));
}