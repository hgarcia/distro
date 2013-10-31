var distro = require("../index");

var server = distro.create({log: function () {}}).udp4Server({port: 41234});
server.receive(cb);
server.receive(cb2);

function cb(err, msg) {
	console.log("First handlers: " + msg);
}

function cb2(err, msg) {
	console.log("Second handler: " + msg);
}