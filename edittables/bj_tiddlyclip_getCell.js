/*\
module-type: library
tags: $:/tags/tiddlyclip
title: bj/tiddlyclip/getCell.js
type: application/javascript

\*/

//local rule - works on local taget 
exports.name ="getCell";
exports.run  = function(table,xy) {
var coords = xy.split(" ");

function getCellContents(table,x,y) { 		
	var rows = table.trim().split("\n"),row;
	var j = 0;

	for (var i = 0;i < rows.length;i++) {
		 if (rows[i].charAt(0) === "|") break;//find start of table
		 j++;
	}
    //get row
    row = rows[y*1 + j];
    cells = row.replace(/\"\"\"\|\"\"\"/g,"&bar;").split("|");
    
	return cells[x*1+1].replace("&bar;","\\\\\\|\\\\\\");//bj - replace with regex for multiple substs
}
return (getCellContents(table,coords[0],coords[1]));
}