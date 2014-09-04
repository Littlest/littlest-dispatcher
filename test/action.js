var chai = require('chai');
var when = require('when');
var makeAction = require('../lib/action');
var Dispatcher = require('../lib/dispatcher');

var expect = chai.expect;

function noop() {}

describe('Action', function () {
  var name = 'test';
  var dispatcher = new Dispatcher();

  it('should require a valid Dispatcher', function () {
    expect(function () {
      makeAction(null, name, noop);
    }).to.throw();

    expect(function () {
      makeAction({}, name, noop);
    }).to.throw();
  });

  it('should require a name', function () {
    expect(function () {
      makeAction(dispatcher, null, noop);
    }).to.throw();
  });

  it('should require a function', function () {
    expect(function () {
      makeAction(dispatcher, name, null);
    }).to.throw();

    expect(function () {
      makeAction(dispatcher, name, {});
    }).to.throw();
  });

  it('should return a function', function () {
    expect(makeAction(dispatcher, name, noop)).to.be.a('function');
  });

  describe('return value', function () {
    it('should return a Promise', function () {
      var result = makeAction(dispatcher, name, noop)();

      expect(result.then).to.be.a('function');
    });

    it('should preserve this when called', function (done) {
      var self = this;

      function action() {
        expect(this).to.equal(self);
        done();
      }

      makeAction(dispatcher, name, action.bind(this))();
    });

    it('should pass through exactly one argument', function (done) {
      function action(params) {
        expect(arguments.length).to.equal(1);
        expect(params).to.equal('answer');
        done();
      }

      makeAction(dispatcher, name, action)('answer', 42);
    });

    it('should notify the Dispatcher when called', function (done) {
      var dispatcher = new Dispatcher();

      dispatcher.register(name + ':pending', function (data) {
        expect(data).to.deep.equal({ foo: 'bar' });
        done();
      });

      makeAction(dispatcher, name, noop)({ foo: 'bar' });
    });

    it('should notify the Dispatcher when it completes', function (done) {
      var dispatcher = new Dispatcher();

      dispatcher.register(name + ':succeeded', function (data) {
        expect(data).to.deep.equal({ bar: 'foo' });
        done();
      });

      function swap(params) {
        var retval = {};

        Object.keys(params).forEach(function (key) {
          retval[params[key]] = key;
        });

        return retval;
      }

      makeAction(dispatcher, name, swap)({ foo: 'bar' });
    });

    it('should notify the Dispatcher when it fails', function (done) {
      var dispatcher = new Dispatcher();
      var message = 'Belgium!';

      dispatcher.register(name + ':failed', function (reason) {
        expect(reason).to.equal(message);
        done();
      });

      function fail() {
        throw new Error(message);
      }

      makeAction(dispatcher, name, fail)()
        .then(noop, noop);
    });
  });
});
