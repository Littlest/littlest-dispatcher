/**
 * The Dispatcher is responsible for managing the many-to-many relationship
 * between Actions and Stores. When an Action should result in changes to
 * application state, it emits events through the pub-sub Dispatcher. Stores,
 * then, may listen for these events and perform the actual state updates
 * accordingly.
 *
 * Because of its role, the behaviour of both the Action and Store modules are
 * provided as convenient methods directly on the Dispatcher instance.
 *
 * NOTE: Though the original intention of this Dispatcher is to be shared
 * universally, _this is by no means required_. Multiple dispatchers can be
 * made domain-specific, for example.
 */
var assert = require('assert');
var EventEmitter = require('eventemitter2').EventEmitter2;
var action = require('./action');
var Store = require('./store');

/**
 * Creates a new, empty Dispatcher. This should be called once per application,
 * and the resulting Dispatcher should be held in memory and made available
 * to all Stores and Actions.
 */
function Dispatcher(options) {
  if (!(this instanceof Dispatcher)) {
    return new Dispatcher(options);
  }

  options = options || {};

  this.logger = options.logger || { info: function () {} };

  this._emitter = new EventEmitter({
    wildcard: true,
    delimiter: ':',
    maxListeners: 0
  });
}
Dispatcher.createDispatcher = Dispatcher;

/**
 * Registers `handler` to be called for the `name` event. Returns `this`
 * for cascading.
 */
Dispatcher.prototype.register = function register(name, handler) {
  assert(name, 'Missing event name');
  assert(typeof handler === 'function', 'Missing handler');

  this._emitter.addListener(name, handler);
  return this;
};

/**
 * Unregisters previously-registered `handler`. It will no longer be called
 * for subsequent `name` events. Returns `this` for cascading.
 */
Dispatcher.prototype.unregister = function unregister(name, handler) {
  assert(name, 'Missing event name');
  assert(typeof handler === 'function', 'Missing handler');

  this._emitter.removeListener(name, handler);
  return this;
};

/**
 * Dispatches a `name` event with the single argument `value` to all
 * registered handlers. Returns `this` for cascading.
 */
Dispatcher.prototype.dispatch = function dispatch(name, value) {
  assert(name, 'Missing event name');

  this.logger && this.logger.info('D %s', name, value);

  this._emitter.emit(name, value);
  return this;
};

/**
 * Returns a freshly-decorated Action with the provided `name` and `fn`.
 *
 * See `action` for more details.
 */
Dispatcher.prototype.createAction = function createAction(name, fn) {
  return action(this, name, fn);
};

/**
 * Returns a freshly-created Store with the provided `properties`.
 *
 * See `Store for more details.
 */
Dispatcher.prototype.createStore = function createStore(properties) {
  return Store.createStore(properties, this);
};

/*!
 * Export `Dispatcher`.
 */
module.exports = Dispatcher;
