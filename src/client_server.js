var dgram = require('dgram');

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
		var msg = parseMsg(message)
		if (msg.headers && msg.headers.address && msg.headers.port) {
			var headers = {uri: "RECEIVED"};
			sendMsg(getTypeForClient(rinfo), createMessage(headers, {msgId: msg.id}), msg.headers);
		} 
	});
}

function registerServerHandlers(server, msgHandler, logger) {

	server.on("message", function (message, rinfo) {
		var msg = parseMsg(message)
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

function getUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
}

function createMessage(headers, payload) {
	return new Message(getUUID(), headers, payload);
}

function parseMsg(str) {
	var parsed = JSON.parse(str);
	return new Message(parsed.id, parsed.headers, parsed.payload);
}

function Message(id, headers, payload) {
  this.id = id;
	this.headers = headers;
	this.payload = payload;
}

Message.prototype.toString = function () {
	var _serializable_ = {
		id: this.id,
		headers: this.headers,
		payload: this.payload
	};
	return JSON.stringify(_serializable_);
}

Message.prototype.toBuffer = function () {
	return new Buffer(this.toString());
};

exports.parse = parseMsg;

exports.create = function (_logger) {
	var logger = _logger || console;
	var udp4 = 'udp4';
	var udp6 = 'udp6';
	return {
		message: createMessage,
		udp4Server: server(udp4, logger),
		udp6Server: server(udp6, logger),
		udp4Client: client(udp4, logger),
		udp6Client: client(udp6, logger)
	};
};