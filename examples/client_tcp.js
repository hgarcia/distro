var distro = require("../index");

var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
var obj = distro.create().message(headers, "This is the payload");

distro.create({log: function () {}}).tcpServer({port: 41235}).receive(cb);
distro.create({log: function () {}}).tcpClient({port: 41234}).send(obj);

function cb(err, msg) {
  console.log("Client called back from the server: " + msg);
}