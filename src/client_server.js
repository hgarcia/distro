var dgram = require('dgram');
var tcp = require('./tcp_client_server');
var parser = require('./parser');
var message = require('./messages');

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

function registerMessage(server) {
  server.on("message", function (data, rinfo) {
    var msg = parser.parse(data);
    handleVerbs(server, msg);
    if (msg.headers && msg.headers.address && msg.headers.port) {
      var headers = {uri: "RECEIVED"};
      sendMsg(getTypeForClient(rinfo), message.createMessage(headers, {msgId: msg.id}), msg.headers);
    } 
  });
}

function handleVerbs(server, msg) {
  if (msg.headers.verb) {
    server[msg.headers.verb.toUpperCase()].forEach(function (verbHandler) {
      verbHandler(null, msg);
    });
  } else {
    server.GET.forEach(function (verbHandler) {
      verbHandler(null, msg);
    });
  }
}

function registerServerHandlers(server, msgHandler, logger) {

  server.on("message", function (message, rinfo) {
    var msg = parser.parse(message);
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
    server.HEAD = [];
    server.GET = [];
    server.POST = [];
    server.PUT = [];
    server.PATCH = [];
    server.DELETE = [];
    registerMessage(server);
    return {
      receive: function (msgHandler) {
        registerServerHandlers(server, msgHandler, logger);
      },
      head: function (msgHandler) {
        server.HEAD.push(msgHandler);
      },
      get: function (msgHandler) {
        server.GET.push(msgHandler);
      },
      post: function (msgHandler) {
        server.POST.push(msgHandler);
      },
      put: function (msgHandler) {
        server.PUT.push(msgHandler);        
      },
      patch: function (msgHandler) {
        server.PATCH.push(msgHandler);
      },
      del: function (msgHandler) {
        server.DELETE.push(msgHandler);
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

exports.parse = parser.parse;

exports.create = function (_logger) {
  var logger = _logger || console;
  var udp4 = 'udp4';
  var udp6 = 'udp6';
  return {
    message: message.createMessage,
    udp4Server: server(udp4, logger),
    udp6Server: server(udp6, logger),
    udp4Client: client(udp4, logger),
    udp6Client: client(udp6, logger),
    tcpClient: tcp.client(logger),
    tcpServer: tcp.server(logger),
    redisServer:  function () {},
    redisClient: function () {}
  };
};