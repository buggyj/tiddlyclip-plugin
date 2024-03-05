exports.name ="replaceall";
exports.run  = function(instr,substrg,newstrg) {
try {
return instr.replaceAll(substrg,newstrg);
} catch(e) {throw ("tcexit");}
};