var parser = require('./parser');
var message = require('./messages');

function validateTransport(transportParam) {
  if (transportParam.substr) {
    try {
      return require('./' + transportParam);
    } catch (e) {
      throw new Error("'" + transportParam + "' is not a valid transport. Valid transports are: udp4, udp6, tcp and redis.");
    }
  }
  if(!transportParam.server || !transportParam.client) {
    throw new Error("Provide a valid transport."); 
  }
  return transportParam;
}

function validateLogger(logger) {
  if (!logger) {
    return console;
  }
  if (!logger.log) {
    throw new Error("Provide a valid logger.");
  }
  return logger;
}

exports.parse = parser.parse;
exports.message = message.createMessage;

exports.create = function (transportParam, _logger) {
  if (!arguments[0]) {
    throw new Error("Indicate the transport to use or provide your own.");
  }
  var transport = validateTransport(transportParam);
  var logger = validateLogger(_logger);
  return {
    server: transport.server(logger),
    client: transport.client(logger)
  };
};