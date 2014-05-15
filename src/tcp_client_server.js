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

function handleVerbs(handlers, msg) {
  if (msg.headers.verb) {
    handlers[msg.headers.verb.toUpperCase()].forEach(function (verbHandler) {
      verbHandler(null, msg);
    });
  } else {
    handlers.GET.forEach(function (verbHandler) {
      verbHandler(null, msg);
    });
  }
  handlers.RECEIVE.forEach(function (verbHandler) {
    verbHandler(null, msg);
  });
}

exports.server = function (logger) {
  return function (serverInfo) {
    var handlers = {
      HEAD: [],
      GET: [],
      POST: [],
      PUT: [],
      PATCH: [],
      DELETE: [],
      RECEIVE: []
    };
    var server = createServer(serverInfo, logger, handlers);
    return {
      receive: function (msgHandler) {
        handlers.RECEIVE.push(msgHandler);
      },
      head: function (msgHandler) {
        handlers.HEAD.push(msgHandler);
      },
      get: function (msgHandler) {
        handlers.GET.push(msgHandler);
      },
      post: function (msgHandler) {
        handlers.POST.push(msgHandler);
      },
      put: function (msgHandler) {
        handlers.PUT.push(msgHandler);        
      },
      patch: function (msgHandler) {
        handlers.PATCH.push(msgHandler);
      },
      del: function (msgHandler) {
        handlers.DELETE.push(msgHandler);
      }
    };
  };
};

exports.client = function (logger) {
  return function (serverInfo) {
    return {
      send: function (message, cb) {
        sendMsg(message, serverInfo, logger, cb);
      }
    };
  };
};