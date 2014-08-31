/*global describe,it,beforeEach */
var Operation, OperationQueue;
if (!assert) { // node.js tests
    var assert = require('chai').assert;
    Operation = require('../src/operation').Operation;
}
else { // Browser tests
    Operation = op.Operation;
}

describe('Notifications', function () {

    it('add observer', function () {
        var op1 = new Operation('op1');
        var observer = function () {};
        op1.addObserver(observer);
        assert.include(op1.observers, observer);
    });

    it('remove observer', function () {
        var op1 = new Operation('op1');
        var observer = function () {};
        op1.addObserver(observer);
        assert.include(op1.observers, observer);
        op1.removeObserver(observer);
        assert.notInclude(op1.observers, observer);
    });

    it('observe', function (done) {
        var op1 = new Operation('op1');
        op1.addObserver(done);
        assert.include(op1.observers, done);
        op1.start();
    });

});
