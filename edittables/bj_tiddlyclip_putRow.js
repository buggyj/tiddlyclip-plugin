/*\
module-type: library
tags: $:/tags/tiddlyclip
title: bj/tiddlyclip/putRow.js
type: application/javascript

\*/
//local rule - works on local taget 
exports.name ="putRow";
exports.run  = function(table,xy,row) {
var coords = xy.split(" ");

function addRow(table,y,row) { 		
	var rows = table.trim().split("\n");
	var j = 0,row = row;

	for (var i = 0;i < rows.length;i++) {
		 if (rows[i].charAt(0) === "|") break;//find start of table
		 j++;
	}
//find row cols
var cols= rows[j].split("|")||[];
var nCol = cols.length;
for (var i = 0;i < nCol-3;i++) row+='|';
  //add row
   rows.splice(y*1 + j+1,0,row);
    return (rows.join("\n"))
}
return (addRow(table,coords[1],row));
}