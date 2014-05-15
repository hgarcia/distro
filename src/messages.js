function getUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
  });
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
};

Message.prototype.toBuffer = function () {
  return new Buffer(this.toString());
};

exports.createMessage = function (headers, payload) {
  return new Message(getUUID(), headers, payload);
};

exports.Message = Message;