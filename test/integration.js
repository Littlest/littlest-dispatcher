var expect = require('chai').expect;
var Dispatcher = require('../lib/dispatcher');

describe('Integration', function () {
  it('Suite 1', function (done) {
    var dispatcher = Dispatcher.createDispatcher();
    var navigate = dispatcher.createAction('navigate', function (state) {
      return state;
    });
    var store = dispatcher.createStore()
      .define('state', 'splash')
      .handle('navigate:succeeded', function (state) {
        this.set('state', state);
      });

    expect(store.get('state')).to.equal('splash');

    store.on('change:state', function (state) {
      expect(state).to.equal('login');
      expect(store.get('state')).to.equal('login');
      done();
    });

    navigate('login');
  });
});
