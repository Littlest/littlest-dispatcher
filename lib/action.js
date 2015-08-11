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
var assert = require('assert');
var when = require('when');

/**
 * Decorates `fn(data)` with events most important for downstream Stores
 * listening through the `dispatcher`. For simple association between Actions
 * and Stores, `fn` must accept only one Object with all the data required
 * to perform the action. These Stores will listen on the `name`, with the
 * following three suffixes:
 *
 * - `name:pending`: The action has started, but has yet to complete.
 * - `name:failed`: The action has failed.
 * - `name:succeeded`: The action has completed.
 *
 * In all three cases, a "Scene" object is passed along with the following
 * properties:
 *
 * - `name` - The full name of the action in question.
 * - `params` - The `params` object provided to the original Action.
 * - `result` - The value returned from a successful Action, `null` otherwise.
 * - `error` - The error thrown from a failed Action, `null` otherwise.
 *
 * If `fn` wishes to perform asynchronous work, it should return a Promise that
 * will be fulfilled with its result or rejected with an appropriate Error.
 */
function makeAction(dispatcher, name, fn) {
  assert(dispatcher && typeof dispatcher.dispatch === 'function', 'Invalid Dispatcher');
  assert(name, 'Missing name');
  assert(typeof fn === 'function', 'Invalid Action');

  return function act(params) {
    var self = this;
    var scene = {
      name: name,
      params: params,
      result: null,
      error: null
    };

    dispatcher.dispatch(name + ':pending', scene);

    var promise = when()
      .then(function () {
        return fn.call(self, scene);
      });

    promise.then(function (result) {
      scene.result = result;
      dispatcher.dispatch(name + ':succeeded', scene);
    }, function (err) {
      scene.error = err;
      dispatcher.dispatch(name + ':failed', scene);
    });

    return promise;
  };
}

/*!
 * Export `makeAction`.
 */
module.exports = makeAction;
