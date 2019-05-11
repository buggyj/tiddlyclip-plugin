exports.name ="addsets";
exports.run  = function(base,ext) {
	var i, list=ext.split(' ');
	for (i=0;i<list.length;i++) {
            if (base.indexOf(list[i]) === -1) base = base + ' ' + list[i];
         }
	return base;
}
