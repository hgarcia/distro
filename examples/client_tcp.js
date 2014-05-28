var distro = require("../index");

var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
var obj = distro.message(headers, "This is the payload");

distro.create('tcp', {log: function () {}}).server({port: 41235}).receive(cb);
distro.create('tcp', {log: function () {}}).client({port: 41234}).send(obj);

function cb(err, msg) {
  console.log("Client called back from the server: " + msg);
}