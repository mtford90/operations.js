/*global describe,it,beforeEach */
var Operation;
if (!assert) { // node.js tests
    var assert = require('chai').assert;
    Operation = require('../src/operation').Operation;
    _ = require('underscore');
}
else { // Browser tests
    Operation = op.Operation;
}

describe('Cancellation', function () {
    var op;

    beforeEach(function () {
        op = new Operation('op');
    });

    describe('single', function () {
        it('cancels', function (done) {
            op.work = function (finished) {
                var token = setInterval(function () {
                     if (op.cancelled) {
                         clearTimeout(token);
                         finished();
                     }
                }, 20);
            };
            op.completion = function () {
                assert.ok(op.cancelled);
                assert.notOk(op.failed);
                assert.ok(op.completed);
                assert.notOk(op.running);
                done();
            };
            op.start();
            setTimeout(function () {
                op.cancel();
            }, 50);
        });
    });

    describe('composite', function () {
        var op;
        beforeEach(function () {
            op = new Operation([new Operation(), new Operation(), new Operation()]);
            op.cancel();
        });
        it('composite op is cancelled', function () {
            assert.ok(op.cancelled);
            assert.notOk(op.failed);
            assert.ok(op.completed);
            assert.notOk(op.running);
        });
        it('all subops are cancelled', function () {
            _.each(op.work, function (subOp) {
                assert.ok(subOp.cancelled);
                assert.notOk(subOp.failed);
                assert.ok(subOp.completed);
                assert.notOk(subOp.running);
            })
        })
    });

    describe('dependencies', function () {
        it('fails if dependency is cancelled', function (done) {
            var dependency = new Operation('dependent');
            op.addDependency(dependency, true);
            dependency.cancel();
            op.completion = function () {
                assert.ok(op.failedDueToDependency);
                assert.include(op.failedDueToCancellationOfDependency, dependency);
                done();
            };
            op.start();
        });
    });

});
