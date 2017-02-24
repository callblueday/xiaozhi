function gen_cuid(len){
    var s = 'abcedfghijklmnopqrstuvwxyzABCEDFGHIJKLMNOPQRSTUVWXYZ1234567890';
    if(!len){
        len = 32;
    }
    var ret = '';
    for(var i = 0; i < 32; i++){
        ret += s[Math.floor(Math.random() * s.length)] ;
    }
    return ret;
}
