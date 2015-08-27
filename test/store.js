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


  describe('get', function () {
    it('should return undefined for properties that have not been set', function () {
      expect(store.get(name)).to.equal(undefined)
    })

    it('should return the property when set', function () {
      store.set(name, value)

      expect(store.get(name)).to.deep.equal(value)
    })
  })

  describe('define', function () {
    it('should create a new property on the Store', function () {
      expect(store.has(name)).to.equal(false);
      store.define(name);
      expect(store.has(name)).to.equal(true);
    });

    it('should accept a value', function () {
      expect(store.get(name)).to.equal(undefined);
      store.define(name, value);
      expect(store.get(name)).to.deep.equal(value);
    });

    it('should not fire a change event', function (done) {
      var firedChangeEvent = false;

      store.on('change', function () {
        firedChangeEvent = true;
      });

      setTimeout(function () {
        expect(firedChangeEvent).to.equal(false);
        done();
       }, 5);

      store.define(name, value);
    });

    it('should not fail if the property is already set', function () {
      store.define(name, value);

      expect(function () {
        store.define(name, value);
      }).to.not.throw();
    });
  });


  describe('set', function () {
    it('should create a new property on the Store', function () {
      expect(store.has(name)).to.equal(false);
      store.set(name);
      expect(store.has(name)).to.equal(true);
    });

    it('should accept a value', function () {
      expect(store.get(name)).to.equal(undefined);
      store.set(name, value);
      expect(store.get(name)).to.deep.equal(value);
    });

    it('should fire a change event', function (done) {
      store.on('change', function () {
        done();
      });

      store.set(name, value);
    });

    it('should not fail if the property is already set', function () {
      store.set(name, value);

      expect(function () {
        store.set(name, value);
      }).to.not.throw();
    });
  });

  describe('update', function () {
    it('should change the store value', function () {
      store.set(name, { foo: 'bar' });
      store.update(name, function (x) { x.baz = true })

      expect(store.get(name)).to.deep.equal({
        foo: 'bar',
        baz: true
      });
    });

    it('should fire a change event', function (done) {
      store.on('change', function () {
        done();
      });

      store.update(name, function () {});
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

      expect(store.has(name)).to.equal(true);
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
      store.set(name, value);

      var expected = {};
      expected[name] = value;

      expect(store.toObject()).to.deep.equal(expected);
    });
  });

  describe('JSON', function () {
    it('should contain only all defined fields', function () {
      store.set(name, value);

      var expected = {};
      expected[name] = value;

      expect(JSON.stringify(store)).to.equal(JSON.stringify(expected));
    });
  });

  describe('fromObject', function () {
    it('should set all cached fields', function () {
      store.set(name, value);
      var obj = store.toObject();

      store.set(name, null);
      store.fromObject(obj);

      expect(store.has(name));
      expect(store.get(name)).to.equal(value);
    });

    it('should define missing fields', function () {
      store.set(name, value);

      var newStore = new Store();

      newStore.fromObject(store.toObject());

      expect(newStore.has(name));
      expect(newStore.get(name)).to.equal(value);
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
