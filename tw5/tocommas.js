exports.name ="toCommas";
exports.run  = function(list) {
	/*var found, i, j, list=ext.split(' '), oldbase=base.split(' ');
	for (i=0;i<list.length;i++) {
              found = false;
               for (j=0;j<oldbase.length;j++) {
                      if (oldbase[j].trim()===list[i].trim()) found = true;
               }
              if (!found) base = base + ' ' + list[i];
}

	return base.trim();*/
return list.replaceAll(' ',',');
}
