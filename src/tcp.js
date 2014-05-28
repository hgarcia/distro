var net = require('net');
var parser = require('./parser');
var message = require('./messages');

function sendMsg(message, serverInfo, logger) {
  var client = net.connect(serverInfo,
      function() {
        logger.log('client connected');
        client.write(message.toBuffer());
    });

  client.on('data', function (data) {
    logger.log(data.toString());
    client.end();
  });

  client.on('error', function (err) {
    logger.log("server error:\n", err.stack);
  });
}

function createServer(serverInfo, logger, handlers) {
  var server = net.createServer(function (connection) {
    connection.on('end', function() {
      logger.log('server disconnected');
    });
    registerMessage(connection, handlers, logger);
  });
  server.listen(serverInfo.port, function () {
    logger.log('server bound', server.address());
  });
  return server;
}

function registerMessage(server, handlers, logger) {
  server.on("data", function (data) {
    var msg = parser.parse(data);
    handleVerbs(handlers, msg);
    if (msg.headers && msg.headers.address && msg.headers.port) {
      var headers = {uri: "RECEIVED"};
      sendMsg(message.createMessage(headers, {msgId: msg.id}), msg.headers, logger);
    } 
  });

  server.on("error", function (err) {
    msgHandler(err, null);
    logger.log("server error:\n", err.stack);
    server.destroy();
  });
}

function handleVerbCb(msg) {
  return function (verbHandler) {
    verbHandler(null, msg);
  };
}

function handleVerbs(handlers, msg) {
  var uriUpper = msg.headers.uri.toUpperCase();
  var uriHandlers = handlers[uriUpper];
  if (uriHandlers) {
    if (msg.headers.verb) {
      var verbHandlers = uriHandlers[msg.headers.verb.toUpperCase()];
      if (verbHandlers && verbHandlers.forEach) {
        verbHandlers.forEach(handleVerbCb(msg));
      }
    } else {
      uriHandlers.GET.forEach(handleVerbCb(msg));
    }
  }
  handlers.RECEIVE.forEach(handleVerbCb(msg));
}

function checkLogger(logger) {
  if (!logger || !logger.log) {
    throw new Error('Please provide a logger that implements the log method');
  }
}

function checkPort(serverInfo) {
  if (isNaN(serverInfo.port)) {
    throw new Error('Port is mandatory');
  }
}

function uriVerbOnHandler(handlers, uri, verb, msgHandler) {
  var uriUpper = uri.toUpperCase();
  if (!handlers[uriUpper]) {
    handlers[uriUpper] = {};
  }
  if (!handlers[uriUpper][verb]) {
    handlers[uriUpper][verb] = [];
  }
  handlers[uriUpper][verb].push(msgHandler);
  return handlers;
}

exports.server = function (logger) {
  checkLogger(logger);
  return function (serverInfo) {
    checkPort(serverInfo);
    var handlers = {RECEIVE: []};
    var server = createServer(serverInfo, logger, handlers);
    return {
      receive: function (msgHandler) {
        handlers.RECEIVE.push(msgHandler);
      },
      head: function (uri, msgHandler) {
        handlers = uriVerbOnHandler(handlers, uri, "HEAD", msgHandler);
      },
      get: function (uri, msgHandler) {
        handlers = uriVerbOnHandler(handlers, uri, "GET", msgHandler);
      },
      post: function (uri, msgHandler) {
        handlers = uriVerbOnHandler(handlers, uri, "POST", msgHandler);
      },
      put: function (uri, msgHandler) {
        handlers = uriVerbOnHandler(handlers, uri, "PUT", msgHandler);
      },
      patch: function (uri, msgHandler) {
        handlers = uriVerbOnHandler(handlers, uri, "PATCH", msgHandler);
      },
      del: function (uri, msgHandler) {
        handlers = uriVerbOnHandler(handlers, uri, "DELETE", msgHandler);
      },
      close: function () {
        server.close();
      }
    };
  };
};

exports.client = function (logger) {
  checkLogger(logger);
  return function (serverInfo) {
    checkPort(serverInfo);
    if (!serverInfo.address) {
      throw new Error('Address is mandatory');
    }
    return {
      send: function (message, cb) {
        sendMsg(message, serverInfo, logger, cb);
      }
    };
  };
};