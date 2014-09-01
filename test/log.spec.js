/*global describe,it,beforeEach */
var Operation, OperationQueue, Logger, _;

if (typeof require == 'undefined') {
    Operation = op.Operation;
    assert = chai.assert;
    _ = getUnderscore(); // Shim.
    OperationQueue = op.OperationQueue;
    Logger = op.Logger;
}
else { // NodeJS
    assert = require('chai').assert;
    Operation = require('../src/operation').Operation;
    OperationQueue = require('../src/queue').OperationQueue;
    _ = require('underscore');
    Logger = require('../src/log');
}


describe('Logger', function () {
    it('set level', function () {
        var logger = Logger.loggerWithName('myLogger');
        var myOtherLogger = Logger.loggerWithName('myOtherLogger');
        assert.ok(logger.info.isEnabled);
        assert.ok(myOtherLogger.info.isEnabled);
        logger.setLevel(Logger.Level.warning);
        assert.notOk(logger.info.isEnabled);
    });

    it('override operation', function (done) {
        var op = new Operation();
        op.logLevel = Logger.Level.error;
        op.completion = function () {
            done();
        };
        op.start();
    });

    it('override queue', function () {
        var q = new OperationQueue();
        q.logLevel = Logger.Level.error;
        q.start();
    });
});
