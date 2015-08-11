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
var assert = require('assert');
var EventEmitter = require('eventemitter2').EventEmitter2;
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

  EventEmitter.call(this, {
    wildcard: true,
    delimiter: ':',
    maxListeners: 0
  });

  this.dispatcher = dispatcher;

  this._db = {};
  this._init(properties);
}
util.inherits(Store, EventEmitter);
Store.createStore = Store;

/**
 * Gets the value of the `name` property on the store.
 */
Store.prototype.get = function get(name) {
  return this._db[name];
};

/**
 * Defines a property on the store, optionally with an initial value.
 * Does not fire a change event.
 */
Store.prototype.define = function define(name, value) {
  this._db[name] = value;

  return this;
};

/**
 * Sets a new value for the `name` property on the store. Always fires a
 * `"change"` event.
 */
Store.prototype.set = function set(name, value) {
  var self = this;

  self._db[name] = value;

  process.nextTick(function () {
    self.emit('change', self);
    self.emit('change:' + name, value);
  });

  return self;
};

/**
 * Passes the `name` property to `updateInPlace` in the expectation that
 * it will modify it. Always fires a `"change"` event.
 */
Store.prototype.update = function update(name, updateInPlace) {
  var self = this;

  updateInPlace(this._db[name]);

  process.nextTick(function () {
    self.emit('change', self);
    self.emit('change:' + name, self._db[name]);
  });

  return self;
};

/**
 * Returns true if the property has been defined on this Store, false otherwise.
 */
Store.prototype.has = function has(name) {
  return this._db.hasOwnProperty(name);
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

  assert(name, 'Missing name');
  assert(typeof fn === 'function', 'Invalid function');

  this.dispatcher.register(name, fn.bind(this));

  return this;
};

/**
 * Returns a Plain Old JavaScript Object with the same keys and values as this
 * Store. This is a shallow copy, but changes to this Object should be
 * discouraged.
 */
Store.prototype.toObject = function toObject() {
  var obj = {};
  util._extend(obj, this._db);
  return obj;
};

/**
 * Returns a JSON representation of the Store.
 */
Store.prototype.toJSON = function toJSON() {
  return this.toObject();
};

/**
 * Re-populates the Store from a previously-cached version.
 */
Store.prototype.fromObject = function fromObject(obj) {
  var self = this;

  if (!obj || typeof obj === 'undefined') {
    return self;
  }

  assert(typeof obj === 'object', 'Invalid object');

  Object.keys(obj).forEach(function (key) {
    self.set(key, obj[key]);
  });

  return self;
};

/**
 * Internal helper to add all `properties` by key and initial value.
 */
Store.prototype._init = function _init(properties) {
  var self = this;

  if (properties && typeof properties === 'object') {
    Object.keys(properties).forEach(function (key) {
      self.set(key, properties[key]);
    });
  }

  return self;
};

/*!
 * Export `Store`.
 */
module.exports = Store;
