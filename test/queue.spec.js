/*global describe,it,beforeEach */
var Operation, OperationQueue;
if (!assert) { // node.js tests
    var assert = require('chai').assert;
    Operation = require('../src/operation').Operation;
    OperationQueue = require('../src/queue').OperationQueue;
    _ = require('underscore');
}
else { // Browser tests
    Operation = op.Operation;
    OperationQueue = op.OperationQueue;
}

describe('OperationQueue', function () {

    var q;

    beforeEach(function () {
        q = new OperationQueue(2);
    });

    describe('initial state', function () {
        it('2 max concurrent', function () {
            assert.equal(q.maxConcurrentOperations, 2);
        });
        it('no queued operations', function () {
            assert.equal(q._queuedOperations.length, 0);
        });
        it('no running operations', function () {
            assert.equal(q._runningOperations.length, 0);
            assert.equal(q.numRunningOperations, 0)
        });
        it('should not be running', function () {
            assert.notOk(q.running);
        });
    });

    it('adding an operation when not running should put to the queue', function () {
        var op = new Operation();
        q.addOperation(op);
        assert.include(q._queuedOperations, op);
        assert.notInclude(q._runningOperations, op);
    });

    it('adding an operation when running should put to running', function () {
        var op = new Operation(function (done) {
            setTimeout(function () {
                done();
            }, 10)
        });
        q.start();
        q.addOperation(op);
        assert.notInclude(q._queuedOperations, op);
        assert.include(q._runningOperations, op);
    });

    it('adding an operation whilst paused and then running should put to running', function () {
        var op = new Operation(function (done) {
            setTimeout(function () {
                done();
            }, 10)
        });
        q.addOperation(op);
        q.start();
        assert.notInclude(q._queuedOperations, op);
        assert.include(q._runningOperations, op);
    });

    it('adding multiple operations whilst paused and then running should put only max concurrent to running', function () {
        var op = new Operation('op1', function (done) {setTimeout(done, 100) });
        var op1 = new Operation('op2', function (done) {setTimeout(done, 100) });
        var op2 = new Operation('op3', function (done) {setTimeout(done, 100) });
        q.addOperation(op);
        q.addOperation(op1);
        q.addOperation(op2);
        assert.equal(q._queuedOperations.length, 3);
        q.start();
        assert.equal(q._runningOperations.length, 2);
        assert.equal(q._queuedOperations.length, 1);
    });

    it('adding multiple operations whilst running should put only max concurrent to running', function () {
        var op = new Operation('op1', function (done) {setTimeout(done, 100) });
        var op1 = new Operation('op2', function (done) {setTimeout(done, 100) });
        var op2 = new Operation('op3', function (done) {setTimeout(done, 100) });
        q.start();
        q.addOperation(op);
        q.addOperation(op1);
        q.addOperation(op2);
        assert.equal(q._runningOperations.length, 2);
        assert.equal(q._queuedOperations.length, 1);
    });

    it('num running operations property is valid', function () {
        assert.equal(q.numRunningOperations, 0);
        q._runningOperations.push({});
        q._runningOperations.push({});
        assert.equal(q.numRunningOperations, 2);
    });

    describe('events', function () {

        it('observes on queue start', function (done) {
            q.onStart(function () {
                assert.equal(this, q);
                assert.ok(this.running);
                done();
            });
            q.start();
        });

        it('observes on queue stop', function (done) {
            var observer = function () {
                assert.equal(this, q);
                assert.notOk(this.running);
                done();
            };
            q.start();
            q.onStop(observer);
            q.stop();
        });

    });

});
