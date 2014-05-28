var redis = require('redis');
var parser = require('./parser');
var message = require('./messages');

function redisServer(serverInfo) {
  var port = serverInfo.port || 6379;
  var host = serverInfo.host || '127.0.0.1';

  var server = redis.createClient(port, host);
  if (serverInfo.auth) {
      server.auth(serverInfo.auth);
  }
  server.setMaxListeners(0);
  return server;
}

function sendMsg(message, serverInfo, logger) {
  var server = redisServer(serverInfo);
  var evName = eventName(message.headers.uri,  message.headers.verb || "GET");
  server.publish(evName, message.toString());
  server.publish("RECEIVE", message.toString());
}

function registerEvent(server, eventName, msgHandler) {
  server.psubscribe(eventName, function () {});
  server.on('pmessage', function (pattern, _channel, message) {
    if (eventName === pattern) {
      msgHandler(null, parser.parse(message));
    }
  });
}

function eventName(uri, verb) {
  return uri.toUpperCase() + "." + verb;
}

exports.server = function (logger) {
  return function (serverInfo) {
    var server = redisServer(serverInfo);
    return {
      receive: function (msgHandler) {
        registerEvent(server, "RECEIVE", msgHandler);
      },
      head: function (uri, msgHandler) {
        var evName = eventName(uri, "HEAD");
        registerEvent(server, evName, msgHandler);
      },
      get: function (uri, msgHandler) {
        var evName = eventName(uri, "GET");
        registerEvent(server, evName, msgHandler);
      },
      post: function (uri, msgHandler) {
        var evName = eventName(uri, "POST");
        registerEvent(server, evName, msgHandler);
      },
      put: function (uri, msgHandler) {
        var evName = eventName(uri, "PUT");
        registerEvent(server, evName, msgHandler);
      },
      patch: function (uri, msgHandler) {
        var evName = eventName(uri, "PATCH");
        registerEvent(server, evName, msgHandler);
      },
      del: function (uri, msgHandler) {
        var evName = eventName(uri, "DELETE");
        registerEvent(server, evName, msgHandler);
      },
      close: function () {
        server.quit();
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