var dgram = require('dgram');
var parser = require('./parser');
var message = require('./messages');
var UDP4 = 'udp4';
var UDP6 = 'udp6';

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
  var uriUpper = msg.headers.uri.toUpperCase();
  if (server[uriUpper]) {
    if (msg.headers.verb) {
      var handlersForVerb = server[uriUpper][msg.headers.verb.toUpperCase()];
      if (handlersForVerb && handlersForVerb.forEach) {
        server[uriUpper][msg.headers.verb.toUpperCase()].forEach(function (verbHandler) {
          verbHandler(null, msg);
        });
      }
    } else {
      server[uriUpper].GET.forEach(function (verbHandler) {
        verbHandler(null, msg);
      });
    }
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

function uriVerbOnHandler(server, uri, verb, msgHandler) {
  var uriUpper = uri.toUpperCase();
  if (!server[uriUpper]) {
    server[uriUpper] = {};
  }
  if (!server[uriUpper][verb]) {
    server[uriUpper][verb] = [];
  }
  server[uriUpper][verb].push(msgHandler);
  return server;
}

function server(type, logger) {
  return function (serverInfo) {    
    var server = createServer(type, serverInfo, logger);
    registerMessage(server);
    return {
      receive: function (msgHandler) {
        registerServerHandlers(server, msgHandler, logger);
      },
      head: function (uri, msgHandler) {
        uriVerbOnHandler(server, uri, "HEAD", msgHandler);
      },
      get: function (uri, msgHandler) {
        uriVerbOnHandler(server, uri, "GET", msgHandler);
      },
      post: function (uri, msgHandler) {
        uriVerbOnHandler(server, uri, "POST", msgHandler);
      },
      put: function (uri, msgHandler) {
        uriVerbOnHandler(server, uri, "PUT", msgHandler);
      },
      patch: function (uri, msgHandler) {
        uriVerbOnHandler(server, uri, "PATCH", msgHandler);
      },
      del: function (uri, msgHandler) {
        uriVerbOnHandler(server, uri, "DELETE", msgHandler);
      },
      close: function () {
        server.close();
      }
    };
  };
}

exports.udp4server = function (logger) {
  return server(UDP4, logger);
};

exports.udp6server = function (logger) {
  return server(UDP6, logger);
};


exports.udp4client = function (logger) {
  return function (serverInfo) {
    return {
      send: function (message, cb) {
        sendMsg(UDP4, message, serverInfo, logger, cb);
      }
    };
  };
};

exports.udp6client = function (logger) {
  return function (serverInfo) {
    return {
      send: function (message, cb) {
        sendMsg(UDP6, message, serverInfo, logger, cb);
      }
    };
  };
};