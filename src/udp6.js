var udp = require('./udp_client_server');

exports.server = udp.udp6server;
exports.client = udp.udp6client;