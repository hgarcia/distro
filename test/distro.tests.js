var should = require("should");
var distro = require('../index');
var sinon = require('sinon');
var logger = {log: sinon.spy()};

describe('distro', function() {

  it('should throw if not transport is provided', function () {
    (function () {
      distro.create();
    }).should.throw("Indicate the transport to use or provide your own.");
  });

  it('should throw if the transport name is not valid', function () {
    (function () {
      distro.create('smoke-signals');
    }).should.throw("'smoke-signals' is not a valid transport. Valid transports are: udp4, udp6, tcp and redis.");
  });

  it('should throw if is not a valid transport', function () {
    (function () {
      distro.create({});
    }).should.throw("Provide a valid transport.");
  });

  it('should throw if logger is invalid', function () {
    (function () {
      distro.create({client: function () {}, server: function () {}}, {});
    }).should.throw("Provide a valid logger.");
  });

  describe('udp4', function () {
    var factory = distro.create('udp4', logger);
    var serverInfo = {port: 41234};

    it('should receive a message', function (done) {
      var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "payload");
      var server = factory.server(serverInfo);
      server.receive(function (err, msg) {
        msg.payload.should.equal("payload");
        server.close();
        done();
      });
      factory.client(serverInfo).send(obj);
    });

    it('should handle HEAD', function (done) {
      var headers = {uri: "MSG", verb: 'HEAD', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "head-payload");
      var server = factory.server(serverInfo);
      server.head("MSG", function (err, msg) {
        msg.payload.should.equal("head-payload");
        server.close();
        done();
      });
      factory.client(serverInfo).send(obj);
    });

    it('should handle GET', function (done) {
      var headers = {uri: "MSG", verb: 'GET', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "get-payload");
      var server = factory.server(serverInfo);
      server.get("MSG", function (err, msg) {
        msg.payload.should.equal("get-payload");
        server.close();
        done();
      });
      factory.client(serverInfo).send(obj);
    });

    it('should handle POST', function (done) {
      var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "post-payload");
      var server = factory.server(serverInfo);
      server.post("MSG", function (err, msg) {
        msg.payload.should.equal("post-payload");
        server.close();
        done();
      });
      factory.client(serverInfo).send(obj);
    });
    
    it('should handle PUT', function (done) {
      var headers = {uri: "MSG", verb: 'PUT', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "put-payload");
      var server = factory.server(serverInfo);
      server.put("MSG", function (err, msg) {
        msg.payload.should.equal("put-payload");
        server.close();
        done();
      });
      factory.client(serverInfo).send(obj);
    });
    
    it('should handle DELETE', function (done) {
      var headers = {uri: "MSG", verb: 'DELETE', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "del-payload");
      var server = factory.server(serverInfo);
      server.del("MSG", function (err, msg) {
        msg.payload.should.equal("del-payload");
        server.close();
        done();
      });
      factory.client(serverInfo).send(obj);
    });

    it('should not handle POST in the wrong URL', function (done) {
      var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "post-payload");
      var server = factory.server(serverInfo);
      var spyCb = sinon.spy();
      server.post("NON", spyCb);
      factory.client(serverInfo).send(obj);
      setTimeout(function() {
        spyCb.called.should.be.false;
        done();
      }, 50);
    });

    it('should not handle if no registration for the verb', function (done) {
      var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "post-payload");
      var server = factory.server(serverInfo);
      var spyCb = sinon.spy();
      server.get("MSG", spyCb);
      factory.client(serverInfo).send(obj);
      setTimeout(function() {
        spyCb.called.should.be.false;
        done();
      }, 50);
    });
  });

  describe('udp6', function () {
    var factory = distro.create('udp6', logger);
    var serverInfo = {port: 41234};

    it('should receive a message', function (done) {
      var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "payload");
      var server = factory.server(serverInfo);
      server.receive(function (err, msg) {
        msg.payload.should.equal("payload");
        done();
      });
      factory.client(serverInfo).send(obj);
    });

    it('should handle POST', function (done) {
      var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "post-payload");
      var server = factory.server(serverInfo);
      server.post("MSG", function (err, msg) {
        msg.payload.should.equal("post-payload");
        done();
      });
      factory.client(serverInfo).send(obj);
    });

    it('should not handle POST in the wrong URL', function (done) {
      var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "post-payload");
      var server = factory.server(serverInfo);
      var spyCb = sinon.spy();
      server.post("NON", spyCb);
      factory.client(serverInfo).send(obj);
      setTimeout(function() {
        spyCb.called.should.be.false;
        done();
      }, 50);
    });

    it('should not handle if no registration for the verb', function (done) {
      var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "post-payload");
      var server = factory.server(serverInfo);
      var spyCb = sinon.spy();
      server.get("MSG", spyCb);
      factory.client(serverInfo).send(obj);
      setTimeout(function() {
        spyCb.called.should.be.false;
        done();
      }, 50);
    });
  });

  describe('tcp', function () {
    var factory = distro.create('tcp', logger);
    var serverInfo = {port: 41234, address: "127.0.0.1"};

    it('should receive a message', function (done) {
      var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "payload");
      var server = factory.server(serverInfo);
      server.receive(function (err, msg) {
        msg.payload.should.equal("payload");
        server.close();
        done();
      });
      factory.client(serverInfo).send(obj);
    });

    it('should handle HEAD', function (done) {
      var headers = {uri: "MSG", verb: 'HEAD', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "head-payload");
      var server = factory.server(serverInfo);
      server.head("MSG", function (err, msg) {
        msg.payload.should.equal("head-payload");
        server.close();
        done();
      });
      factory.client(serverInfo).send(obj);
    });

    it('should handle GET', function (done) {
      var headers = {uri: "MSG", verb: 'GET', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "get-payload");
      var server = factory.server(serverInfo);
      server.get("MSG", function (err, msg) {
        msg.payload.should.equal("get-payload");
        server.close();
        done();
      });
      factory.client(serverInfo).send(obj);
    });

    it('should handle POST', function (done) {
      var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "post-payload");
      var server = factory.server(serverInfo);
      server.post("MSG", function (err, msg) {
        msg.payload.should.equal("post-payload");
        server.close();
        done();
      });
      factory.client(serverInfo).send(obj);
    });
    
    it('should handle PUT', function (done) {
      var headers = {uri: "MSG", verb: 'PUT', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "put-payload");
      var server = factory.server(serverInfo);
      server.put("MSG", function (err, msg) {
        msg.payload.should.equal("put-payload");
        server.close();        
        done();
      });
      factory.client(serverInfo).send(obj);
    });
    
    it('should handle DELETE', function (done) {
      var headers = {uri: "MSG", verb: 'DELETE', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "del-payload");
      var server = factory.server(serverInfo);
      server.del("MSG", function (err, msg) {
        msg.payload.should.equal("del-payload");
        server.close();
        done();
      });
      factory.client(serverInfo).send(obj);
    });

    it('should not handle POST in the wrong URL', function (done) {
      var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "post-payload");
      var server = factory.server(serverInfo);
      var spyCb = sinon.spy();
      server.post("NON", spyCb);
      factory.client(serverInfo).send(obj);
      setTimeout(function() {
        spyCb.called.should.be.false;
        server.close();
        done();
      }, 50);
    });

    it('should not handle if no registration for the verb', function (done) {
      var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
      var obj = distro.message(headers, "post-payload");
      var server = factory.server(serverInfo);
      var spyCb = sinon.spy();
      server.get("MSG", spyCb);
      factory.client(serverInfo).send(obj);
      setTimeout(function() {
        spyCb.called.should.be.false;
        server.close();
        done();
      }, 50);
    });
  });

  // describe('redis', function () {
  //   var factory = distro.create('redis');
  //   var serverInfo = {port: 6379};

  //   it('should receive a message', function (done) {
  //     var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 6379};
  //     var obj = distro.message(headers, "payload");
  //     var server = factory.server(serverInfo);
  //     server.receive(function (err, msg) {
  //       msg.payload.should.equal("payload");
  //       server.close();
  //       done();
  //     });
  //     setTimeout(function () {
  //       factory.client(serverInfo).send(obj);
  //     }, 50);
  //   });

  //   it('should handle HEAD', function (done) {
  //     var headers = {uri: "MSG", verb: 'HEAD', address: "127.0.0.1", port: 41235};
  //     var obj = distro.message(headers, "head-payload");
  //     var server = factory.server(serverInfo);
  //     server.head("MSG", function (err, msg) {
  //       msg.payload.should.equal("head-payload");
  //       server.close();
  //       done();
  //     });
  //     setTimeout(function () {
  //       factory.client(serverInfo).send(obj);
  //     }, 50);
  //   });

  //   it('should handle GET', function (done) {
  //     var headers = {uri: "MSG", verb: 'GET', address: "127.0.0.1", port: 41235};
  //     var obj = distro.message(headers, "get-payload");
  //     var server = factory.server(serverInfo);
  //     server.get("MSG", function (err, msg) {
  //       msg.payload.should.equal("get-payload");
  //       server.close();
  //       done();
  //     });
  //     setTimeout(function() {
  //       factory.client(serverInfo).send(obj);
  //     }, 50);
  //   });

  //   it('should handle POST', function (done) {
  //     var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
  //     var obj = distro.message(headers, "post-payload");
  //     var server = factory.server(serverInfo);
  //     server.post("MSG", function (err, msg) {
  //       msg.payload.should.equal("post-payload");
  //       server.close();
  //       done();
  //     });
  //     setTimeout(function() {
  //       factory.client(serverInfo).send(obj);
  //     }, 50);
  //   });
    
  //   it('should handle PUT', function (done) {
  //     var headers = {uri: "MSG", verb: 'PUT', address: "127.0.0.1", port: 41235};
  //     var obj = distro.message(headers, "put-payload");
  //     var server = factory.server(serverInfo);
  //     server.put("MSG", function (err, msg) {
  //       msg.payload.should.equal("put-payload");
  //       server.close();        
  //       done();
  //     });
  //     setTimeout(function() {
  //       factory.client(serverInfo).send(obj);
  //     }, 50);
  //   });
    
  //   it('should handle DELETE', function (done) {
  //     var headers = {uri: "MSG", verb: 'DELETE', address: "127.0.0.1", port: 41235};
  //     var obj = distro.message(headers, "del-payload");
  //     var server = factory.server(serverInfo);
  //     server.del("MSG", function (err, msg) {
  //       msg.payload.should.equal("del-payload");
  //       server.close();
  //       done();
  //     });
  //     setTimeout(function() {
  //       factory.client(serverInfo).send(obj);
  //     }, 50);
  //   });

  //   it('should not handle POST in the wrong URL', function (done) {
  //     var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
  //     var obj = distro.message(headers, "post-payload");
  //     var server = factory.server(serverInfo);
  //     var spyCb = sinon.spy();
  //     server.post("NON", spyCb);
  //     factory.client(serverInfo).send(obj);
  //     setTimeout(function() {
  //       spyCb.called.should.be.false;
  //       server.close();
  //       done();
  //     }, 50);
  //   });

  //   it('should not handle if no registration for the verb', function (done) {
  //     var headers = {uri: "MSG", verb: 'POST', address: "127.0.0.1", port: 41235};
  //     var obj = distro.message(headers, "post-payload");
  //     var server = factory.server(serverInfo);
  //     var spyCb = sinon.spy();
  //     server.get("MSG", spyCb);
  //     factory.client(serverInfo).send(obj);
  //     setTimeout(function() {
  //       spyCb.called.should.be.false;
  //       server.close();
  //       done();
  //     }, 50);
  //   });
  // });

  describe('message({uri: "/hello/"}, payload)', function () {

    describe("should create a message with", function () {
      var message = distro.message({uri: "/hello/"},'This is the payload');
      
      it('id', function () {
        message.should.have.property("id");
      });
      
      it('headers', function () {
        message.should.have.property("headers");
      });
      
      it('headers.uri', function () {
        message.headers.should.have.property("uri");
      });
      
      it('headers.uri === "/hello/"', function () {
        message.headers.uri.should.equal("/hello/");
      });
      
      it('payload', function () {
        message.should.have.property("payload");
      });
      
      it('payload === "This is the payload"', function () {
        message.payload.should.equal("This is the payload");
      });
    });

    describe('and without', function () {
      var message = distro.message({uri: "/hello/"},'This is the payload');

      it('headers.address', function () {
        message.headers.should.not.have.property("address");
      });
      
      it('headers.port', function () {
        message.headers.should.not.have.property("port");
      });
      
      it('headers.verb', function () {
        message.headers.should.not.have.property("verb");
      });
    });
  });

  describe('message({uri: "/hello", address: "my.domain.com", port: 442200}, "this is the payload")', function () {
    var headers = {uri: "/hello/", address: "my.domain.com", port: 442200};
    var message = distro.message(headers,'This is the payload');

    describe("should create a message with", function () {
      
      it('headers.port', function () {
        message.headers.should.have.property("port");
      });
      
      it('headers.port === 442200', function () {
        message.headers.port.should.equal(442200);
      });
      
      it('headers.address', function () {
        message.headers.should.have.property("address");
      });
      
      it('headers.address === "my.domain.com"', function () {
        message.headers.address.should.equal("my.domain.com");
      });
    });
  });
});