/**
 * Actions are reponsible for performing the bulk of the "work" around a user
 * interaction. Any asynchronous logic (e.g. server calls) should live inside
 * of an Action, and the Action should result in one or more changes to state.
 * These changes are made through events broadcast on a Dispatcher.
 *
 * Materially-speaking, Actions are nothing more than functions. What is
 * provided by this module is a simple decorator to make integrating simple
 * Actions with a Dispatcher easier.
 */
var when = require('when');

/**
 * Decorates `fn(data)` with events most important for downstream Stores
 * listening through the `dispatcher`. For simple association between Actions
 * and Stores, `fn` must accept only one Object with all the data required
 * to perform the action. These Stores will listen on the `name`, with the
 * following three suffixes:
 *
 * If `fn` wishes to perform asynchronous work, it should return a Promise that
 * will be fulfilled with its result or rejected with an appropriate Error.
 *
 * - `name:pending`: The action has started, but has yet to complete. The
 *    original `data` is passed along to the Stores.
 * - `name:failed`: The action has failed. The reason String is passed along
 *    to the Stores.
 * - `name`: The action has completed. The result of `fn` is passed along to
 *    the Stores.
 */
function action(dispatcher, name, fn) {
  return function (data) {
    dispatcher.dispatch(name + ':pending', data);

    return when(data, fn)
      .then(function (result) {
        dispatcher.dispatch(name, result);
      }, function (err) {
        dispatcher.dispatch(name + ':failed', err.message || String(err));
      });
  };
}

/*!
 * Export `action`.
 */
module.exports = action;
