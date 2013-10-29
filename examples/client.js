var distro = require("../src/client_server");
var msg = require("../src/message");

var obj = msg.create("MSG", "This is the payload", {address: "127.0.0.1", port: 41235});

distro.create({log: function () {}}).udp4Server({port: 41235}).receive(cb);
distro.create({log: function () {}}).udp4Client({port: 41234}).send(obj);

function cb(err, msg) {
	console.log("Client called back from the server: " + msg);
}