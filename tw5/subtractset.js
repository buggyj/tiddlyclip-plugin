exports.name ="subtractset";
exports.run  = function(base,ext) {
	var found, i, j,newbase='', list=ext.split(' '), oldbase=base.split(' ');
	for (i=0;i<oldbase.length;i++) {
              found = false;
               for (j=0;j<list.length;j++) {
                      if (oldbase[i].trim()===list[j].trim()) found = true;
               }
              if (!found) newbase = newbase + ' ' + oldbase[i];
}

	return newbase.trim();
}
