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

describe.only('OperationQueue', function () {

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

    describe('notifications', function () {
        it('add observer', function () {
            var observer = function () {};
            q.addObserver(observer);
            assert.include(q.observers, observer);
        });

        it('remove observer', function () {
            var observer = function () {};
            q.addObserver(observer);
            assert.include(q.observers, observer);
            q.removeObserver(observer);
            assert.notInclude(q.observers, observer);
        });

        it('observes on queue start', function (done) {
            var observer = function (changes) {
                assert.equal(this, q);
                assert.equal(changes.length, 1);
                var change = changes[0];
                assert.equal(change.property, 'running');
                assert.equal(change.old, false);
                assert.equal(change.new, true);
                done();
            };
            q.addObserver(observer);
            q.start();
        });

        it('observes on queue stop', function (done) {
            var observer = function (changes) {
                assert.equal(this, q);
                assert.equal(changes.length, 1);
                var change = changes[0];
                assert.equal(change.property, 'running');
                assert.equal(change.old, true);
                assert.equal(change.new, false);
                done();
            };
            q.start();
            q.addObserver(observer);
            q.stop();
        });

        it('observes on enqueued', function (done) {
            var observer = function (changes) {
                assert.equal(this, q);
                assert.equal(changes.length, 1);
                var change = changes[0];
                assert.equal(change.property, 'numQueuedOperations');
                assert.equal(change.old, 0);
                assert.equal(change.new, 1);
                done();
            };
            q.addObserver(observer);
            q.addOperation(new Operation());
        });


        it('observes on running and when finished', function (done) {
            var changes = [];
            var observer = function (_changes) {
                assert.equal(this, q);
                _.each(_changes, function (c) {changes.push(c)});
                if (changes.length == 2) {
                    var firstChange = changes[0];
                    assert.equal(firstChange.property, 'numRunningOperations');
                    assert.equal(firstChange.old, 0);
                    assert.equal(firstChange.new, 1);
                    var secondChange = changes[1];
                    assert.equal(secondChange.property, 'numRunningOperations');
                    assert.equal(secondChange.old, 1);
                    assert.equal(secondChange.new, 0);
                    done();
                }
            };
            q.start();
            q.addObserver(observer);
            q.addOperation(new Operation(function (done) {
                setTimeout(function () {
                    done();
                },10);
            }));
        });



    });

    describe('completion', function () {
        beforeEach(function (done) {
            var op = new Operation('op1', function (finished) {
                setTimeout(function () {
                    finished();
                }, 10)
            });
            q.start();
            q.addOperation(op);
            q.addObserver(function (changes) {
                var change = changes[0];
                if (change.property == 'numRunningOperations') {
                    if (change.new == 0) done();
                }
            })
        });

        it('should remove from running when completed', function () {
            assert.notOk(q.numRunningOperations);
        });
    });



});
