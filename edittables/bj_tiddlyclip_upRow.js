/*\
module-type: library
tags: $:/tags/tiddlyclip
title: bj/tiddlyclip/upRow.js
type: application/javascript

\*/

//local rule - works on local taget 
exports.name ="upRow";
exports.run  = function(table,xy) {
var coords = xy.split(" ");

function upRow(table,y,row) { 		
	var rows = table.trim().split("\n");
	var j = 0;

	for (var i = 0;i < rows.length;i++) {
		 if (rows[i].charAt(0) === "|") break;//find start of table
		 j++;
	}
    //move row
if (y*1 > 0){
 let temp = rows[y*1 + j];
rows[y*1 + j] = rows[y*1 + j -1];
rows[y*1 + j -1] = temp;
} 
    return (rows.join("\n"))
}
return (upRow(table,coords[1]));
}