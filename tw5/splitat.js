exports.name ="splitat";
exports.run  = function(base,n,upper) {
    if (upper == '0') return base.substring(0, n);
    return base.substring(n);
}