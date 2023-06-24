/*\
module-type: library
tags: $:/tags/tiddlyclip
title: $:/bj/tiddlyclip/delRow.js
type: application/javascript

\*/

//local rule - works on local taget 
exports.name ="delRow";
exports.run  = function(table,xy) {
var coords = xy.split(" ");

function delRow(table,y) { 		
	var rows = table.trim().split("\n");
	var j = 0,row = row;

	for (var i = 0;i < rows.length;i++) {
		 if (rows[i].charAt(0) === "|") break;//find start of table
		 j++;
	}
console.log(rows.length,j)
   if ((rows.length> j+1)) rows.splice(y*1 + j,1);
    return (rows.join("\n"))
}
return (delRow(table,coords[1]));
}