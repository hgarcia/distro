var distro = require("../index");

var server = distro.create('tcp', {log: function () {}}).server({port: 41234});
server.receive(cb);
server.receive(cb2);
server.post(post);

function cb(err, msg) {
  console.log("First handlers: " + msg);
}

function cb2(err, msg) {
  console.log("Second handler: " + msg);
}

function post(err, msg) {
  console.log("POST handler: " + msg);
}