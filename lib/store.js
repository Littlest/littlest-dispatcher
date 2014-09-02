/**
 * Stores are responsible for storing a specific domain of application state.
 * They subscribe to updates from Actions through the Dispatcher, emitting
 * "change" events whenever their state changes.
 *
 * Two kinds of change events are fired:
 * - `change`: Indicates any value has changed on this Store. The Store is the
 *    only argument provided.
 * - `change:key` Indicates `key` has changed on this Store. The new value of
 *    `key` is the only argument provided.
 */
var EventEmitter = require('events').EventEmitter;
var util = require('util');

/**
 * Creates a new Store. If provided, `properties` is expected to be an Object
 * of property names to their initial values. Additionally, `dispatcher` may
 * be provided to associate this Store with a specific Dispatcher, granting use
 * of the `handle` method.
 */
function Store(properties, dispatcher) {
  if (!(this instanceof Store)) {
    return new Store(properties, dispatcher);
  }

  EventEmitter.call(this);

  this.dispatcher = dispatcher;

  this._db = {};
  this._init(properties);
}
util.inherits(Store, EventEmitter);
Store.createStore = Store;

/**
 * Defines a new property named `name` on the Store. If provided, `value` sets
 * the initial value of the property. No `"change"` event is fired for this
 * initial value.
 */
Store.prototype.define = function define(name, value) {
  var self = this;

  self._db[name] = value;

  Object.defineProperty(self, name, {
    get: function () {
      return self._db[name];
    },
    set: function (value) {
      self._db[name] = value;

      self.emit('change', self);
      self.emit('change:' + name, value);

      return value;
    }
  });

  return self;
};

/**
 * If `dispatcher` has been set (presumably by the constructor argument), this
 * registers `fn` as a `name` event handler on the Dispatcher. This makes
 * creating Stores extremely expressive, as multiple `define` and `handle`
 * calls can be chained to completely define the Store in one large statement.
 *
 * When `fn` is finally called, `this` will be the Store handling the event.
 *
 * If `dispatcher` has not been set, this method will throw a ReferenceError.
 */
Store.prototype.handle = function handle(name, fn) {
  if (!this.dispatcher) {
    throw new ReferenceError('Store has no dispatcher defined.');
  }

  this.dispatcher.register(name, fn.bind(this));

  return this;
};

/**
 * Internal helper to add all `properties` by key and initial value.
 */
Store.prototype._init = function _init(properties) {
  var self = this;

  if (properties && typeof properties === 'object') {
    Object.keys(properties).forEach(function (key) {
      self.define(key, properties[key]);
    });
  }

  return self;
};

/*!
 * Export `Store`.
 */
module.exports = Store;
