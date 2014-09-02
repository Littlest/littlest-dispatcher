var action = require('./action');
var Dispatcher = require('./dispatcher');
var Store = require('./store');

module.exports = {
  action: action,
  createAction: action,
  Dispatcher: Dispatcher,
  createDispatcher: Dispatcher.createDispatcher,
  Store: Store,
  createStore: Store.createStore
};
