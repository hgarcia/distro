var message = require('./messages');

function parseMsg(str) {
  var parsed = JSON.parse(str);
  return new message.Message(parsed.id, parsed.headers, parsed.payload);
}

exports.parse = parseMsg;