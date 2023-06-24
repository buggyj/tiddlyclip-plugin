/*\
module-type: library
tags: $:/tags/tiddlyclip
title: bj/tiddlyclip/putCell.js
type: application/javascript

\*/


//local rule - works on local taget 
exports.name ="putCell";
exports.run  = function(table,xy,val) {
var coords = xy.split(" ");

function putCellContents(table,x,y,val) { 		
	var rows = table.trim().split("\n"),row;
	var j = 0;

	for (var i = 0;i < rows.length;i++) {
		 if (rows[i].charAt(0) === "|") break;//find start of table
		 j++;
	}
    //get row
    row = rows[y*1 + j];
    cells = row.replace(/\"\"\"\|\"\"\"/g,"&bar;").split("|");
    
	 cells[x*1+1] = val;
     rows[y*1 + j] = cells.join("|");
    
    return (rows.join("\n"))
}
return (putCellContents(table,coords[0],coords[1],val));
}