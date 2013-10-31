var should = require("should");
var sinon = require('sinon');
var distro = require('../index');

describe('distro', function() {

  describe('.create() should return a factory for', function () {
    var factory = distro.create();

    it('message', function () {
      factory.should.have.property('message');
    });
    it('udp4Server', function () {
      factory.should.have.property('udp4Server');
    });
    it('udp6Server', function () {
      factory.should.have.property('udp6Server');
    });
    it('udp4Client', function () {
      factory.should.have.property('udp4Client');
    });
    it('udp6Client', function () {
      factory.should.have.property('udp6Client');
    });
  });

  describe('factory', function () {
    var factory = distro.create();

    describe('message({uri: "/hello/"}, payload)', function () {

      describe("should create a message with", function () {
        var message = factory.message({uri: "/hello/"},'This is the payload');
        
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
        var message = factory.message({uri: "/hello/"},'This is the payload');

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
      var message = factory.message(headers,'This is the payload');

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
});