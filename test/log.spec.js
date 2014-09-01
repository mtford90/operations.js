/*global describe,it,beforeEach */
var Operation, OperationQueue, Logger;
if (!assert) { // node.js tests
    var assert = require('chai').assert;
    Operation = require('../src/operation').Operation;
    OperationQueue = require('../src/queue').OperationQueue;
    Logger = require('../src/log');
    _ = require('underscore');
}
else { // Browser tests
    Operation = op.Operation;
    Logger = op.Logger;
    OperationQueue = op.OperationQueue;
}

describe('Logger', function () {
    it('set level', function () {
        var logger = Logger.loggerWithName('myLogger');
        var myOtherLogger = Logger.loggerWithName('myOtherLogger');
        assert.ok(logger.info.isEnabled);
        assert.ok(myOtherLogger.info.isEnabled);
        logger.setLevel(Logger.Level.warning);
        assert.notOk(logger.info.isEnabled);
    })
});
