var dgram = require('dgram');
var distroMsg = require('./message');

function sendMsg(type, message, serverInfo, logger, cb) {
	var client = dgram.createSocket(type);
	var msg = message.toBuffer();

	client.send(msg, 0, msg.length, serverInfo.port,  (serverInfo.address || "localhost"), function (err, bytes) {
		if (cb) {
			cb(err, bytes);
		}
	  client.close();
	});
}

function createServer(type, serverInfo, logger) {

	var server = dgram.createSocket(type);
	server.on("listening", function () {
	  var address = server.address();
	  logger.log("server listening " + address.address + ":" + address.port);
	});

	server.bind(serverInfo.port, serverInfo.address || "localhost");
	return server;
}

function getTypeForClient(rinfo) {
	return (rinfo.family.toLowerCase() === 'ipv4') ? 'udp4' : 'udp6';
}

function registerNotification(server) {
	server.on("message", function (message, rinfo) {
		var msg = distroMsg.parse(message)
		if (msg.origin) {
			sendMsg(getTypeForClient(rinfo), distroMsg.create("RECEIVED", {msgId: msg.id}), msg.origin);
		} 
	});
}

function registerServerHandlers(server, msgHandler, logger) {

	server.on("message", function (message, rinfo) {
		var msg = distroMsg.parse(message)
		msgHandler(null, msg);
		logger.log("server got: " + message + " from " + rinfo.address + ":" + rinfo.port);
	});
	
	server.on("error", function (err) {
		msgHandler(err, null);
	  logger.log("server error:\n", err.stack);
	  server.close();
	});
}

function server(type, logger) {
	return function (serverInfo) {		
		var server = createServer(type, serverInfo, logger);
		registerNotification(server);
		return {
			receive: function (msgHandler) {
				registerServerHandlers(server, msgHandler, logger);
			}
		};
	};
}

function client(type, logger) {
	return function (serverInfo) {
		return {
			send: function (message, cb) {
				sendMsg(type, message, serverInfo, logger, cb);
			}
		};
	};
}

exports.create = function (_logger) {
	var logger = _logger || console;
	var udp4 = 'udp4';
	var udp6 = 'udp6';
	return {
		udp4Server: server(udp4, logger),
		udp6Server: server(udp6, logger),
		udp4Client: client(udp4, logger),
		udp6Client: client(udp6, logger)
	};
};