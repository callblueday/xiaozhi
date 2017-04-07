var os = require('os');
var ifaces = os.networkInterfaces();

function GetIp() {

  var ipList = [];

  for (var dev in ifaces) {
    var alias = 0;
    ifaces[dev].forEach(function(details) {
      if (details.family == 'IPv4') {
        ipList.push(details.address);
        // console.log(dev + (alias ? ':' + alias : ''), details.address);
        ++alias;
      }
    });
  }
  return ipList;
}



module.exports = GetIp;