var expect = require('chai').expect;
var Dispatcher = require('../lib/dispatcher');
var Store = require('../lib/store');

function noop() {}

describe('Store', function () {
  var name = 'test';
  var value = { foo: 'bar' };
  var store;

  beforeEach(function () {
    store = new Store();
  });

  describe('define', function () {
    it('should create a new property on the Store', function () {
      expect(name in store).to.equal(false);
      store.define(name);
      expect(name in store).to.equal(true);
    });

    it('should accept an initial value', function () {
      expect(store[name]).to.equal(undefined);
      store.define(name, value);
      expect(store[name]).to.deep.equal(value);
    });

    it('should fire a change event', function (done) {
      store.on('change', function () {
        done();
      });

      store.define(name, value);
    });

    it('should not fail if the property is already defined', function () {
      store.define(name, value);

      expect(function () {
        store.define(name, value);
      }).to.not.throw();
    });
  });

  describe('field', function () {
    it('should fire a change event when set', function (done) {
      store.define(name);

      store.on('change', function (arg) {
        expect(store[name]).to.deep.equal(value);
        expect(arg).to.equal(store);
        done();
      });

      store[name] = value;
    });

    it('should fire a change:name event when set', function (done) {
      store.define(name);

      store.on('change:' + name, function (arg) {
        expect(store[name]).to.deep.equal(value);
        expect(arg).to.deep.equal(value);
        done();
      });

      store[name] = value;
    });
  });

  describe('constructor/factory', function () {
    it('should return a Store', function () {
      expect(Store.createStore()).to.be.an.instanceof(Store);
    });

    it('should accept key:value properties', function () {
      var props = {};

      props[name] = value;

      var store = new Store(props);

      expect(name in store).to.equal(true);
    });
  });

  describe('handle', function () {
    var eventName = 'event:test';
    var dispatcher = new Dispatcher();

    it('should fail if no dispatcher is attached', function () {
      expect(function () {
        store.handle(eventName, noop);
      }).to.throw(ReferenceError);
    });

    it('should fail if no name is provided', function () {
      store.dispatcher = dispatcher;

      expect(function () {
        store.handle(null, noop);
      }).to.throw();
    });

    it('should fail if no function is provided', function () {
      store.dispatcher = dispatcher;

      expect(function () {
        store.handle(eventName, null);
      }).to.throw();

      expect(function () {
        store.handle(eventName, 42);
      }).to.throw();
    });
  });

  describe('toObject', function () {
    it('should return an Object', function () {
      expect(store.toObject()).to.exist;
      expect(store.toObject()).to.be.an('object');
    });

    it('should return an Object with the same keys:values', function () {
      expect(store.toObject()).to.deep.equal({});
      store.define(name, value);

      var expected = {};
      expected[name] = value;

      expect(store.toObject()).to.deep.equal(expected);
    });
  });

  describe('JSON', function () {
    it('should contain only all defined fields', function () {
      store.define(name, value);

      var expected = {};
      expected[name] = value;

      expect(JSON.stringify(store)).to.equal(JSON.stringify(expected));
    });
  });

  describe('fromObject', function () {
    it('should set all cached fields', function () {
      store.define(name, value);
      var obj = store.toObject();

      store[name] = null;
      store.fromObject(obj);

      expect(name in store);
      expect(store[name]).to.equal(value);
    });

    it('should define missing fields', function () {
      store.define(name, value);

      var newStore = new Store();

      newStore.fromObject(store.toObject());

      expect(name in newStore);
      expect(newStore[name]).to.equal(value);
    });

    it('should not fail with no Object', function () {
      store.fromObject();
      store.fromObject(null);
    });

    it('should fail with non-Object', function () {
      expect(function () {
        store.fromObject(42);
      }).to.throw();
    });
  });
});
