function getUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
}

exports.create = function (resourceUri, payload, serverInfo) {
	return new Message(getUUID(), resourceUri, payload, serverInfo);
};

function Message(id, resourceUri, payload, serverInfo) {
  this.id = id;
	this.resourceUri = resourceUri;
	this.payload = payload;
	this.origin = serverInfo;
}

Message.prototype.toString = function () {
	var _serializable_ = {
		id: this.id,
		resourceUri: this.resourceUri,
		payload: this.payload,
		origin: this.origin
	};
	return JSON.stringify(_serializable_);
}

Message.prototype.toBuffer = function () {
	return new Buffer(this.toString());
};

exports.parse = function (str) {
	var parsed = JSON.parse(str);
	return new Message(parsed.id, parsed.resourceUri, parsed.payload, parsed.origin);
};