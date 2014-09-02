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
 * of property names to their initial values.
 */
function Store(properties) {
  if (!(this instanceof Store)) {
    return new Store(properties);
  }

  EventEmitter.call(this);

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
 * Internal helper to add all `properties` by key and initial value.
 */
Store.prototype._init = function _init(properties) {
  var self = this;

  Object.keys(properties).forEach(function (key) {
    self.define(key, properties[key]);
  });

  return self;
};

/*!
 * Export `Store`.
 */
module.exports = Store;
