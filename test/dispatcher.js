var expect = require('chai').expect;
var Dispatcher = require('../lib/dispatcher');

function noop() {}

describe('Dispatcher', function () {
  var eventName = 'event:test';
  var dispatcher;
  var events;

  beforeEach(function () {
    dispatcher = new Dispatcher();
    events = [];
  });

  describe('register', function () {
    it('should fail if no name is provided', function () {
      expect(function () {
        dispatcher.register(null, noop);
      }).to.throw();
    });

    it('should fail if no function is provided', function () {
      expect(function () {
        dispatcher.register(eventName, null);
      }).to.throw();

      expect(function () {
        dispatcher.register(eventName, 42);
      }).to.throw();
    });
  });

  describe('unregister', function () {
    it('should fail if no name is provided', function () {
      expect(function () {
        dispatcher.unregister(null, noop);
      }).to.throw();
    });

    it('should fail if no function is provided', function () {
      expect(function () {
        dispatcher.unregister(eventName, null);
      }).to.throw();

      expect(function () {
        dispatcher.unregister(eventName, 42);
      }).to.throw();
    });
  });

  describe('dispatch', function () {
    it('should fail if no name is provided', function () {
      expect(function () {
        dispatcher.dispatch(null);
      }).to.throw();
    });

    it('should fire all registered handlers', function () {
      function one() {
        events.push('one');
      }

      function two() {
        events.push('two');
      }

      dispatcher.register(eventName, one);
      dispatcher.register(eventName, two);
      dispatcher.dispatch(eventName);

      expect(events).to.contain('one');
      expect(events).to.contain('two');
    });

    it('should pass along one additional argument', function (done) {
      var value = { foo: 'bar' };

      function handler(arg) {
        expect(arguments.length).to.equal(1);
        expect(arg).to.deep.equal(value);
        done();
      }

      dispatcher.register(eventName, handler);
      dispatcher.dispatch(eventName, value);
    });

    it('should not fire unregistered handlers', function () {
      function one() {
        events.push('one');
      }

      function two() {
        events.push('two');
      }

      dispatcher.register(eventName, one);
      dispatcher.register(eventName, two);
      dispatcher.unregister(eventName, one);
      dispatcher.dispatch(eventName);

      expect(events).to.contain('two');
    });
  });
});
