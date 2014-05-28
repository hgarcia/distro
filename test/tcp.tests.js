var should = require("should");
var sinon = require('sinon');
var logger = {log: sinon.spy()};

describe('server', function() {
  
  describe("errors", function () {
    var server = require('../src/tcp').server(logger);
  
    it("should throw if no port given", function () {
      (function () { server({}); }).should.throw();
    });
    
    it("should throw if logger doesn't responds to log", function () {
      (function () {
        require('../src/tcp_client_server.js').server({});
      }).should.throw();
    });
  });
});

describe('client', function() {
  
  describe("errors", function () {
    var client = require('../src/tcp').client(logger);
  
    it("should throw if no port given", function () {
      (function () { client({}); }).should.throw();
    });

    it("should throw if no address given", function () {
      (function () { client({port: 8080}); }).should.throw();
    });

    it("should throw if logger doesn't responds to log", function () {
      (function () {
        require('../src/tcp_client_server.js').client({});
      }).should.throw();
    });
  })

});

