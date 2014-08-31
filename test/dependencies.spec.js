/*global describe,it,beforeEach */
var Operation, OperationQueue;
if (!assert) { // node.js tests
    var assert = require('chai').assert;
    Operation = require('../src/operation').Operation;
    OperationQueue = require('../src/queue').OperationQueue;
}
else { // Browser tests
    Operation = op.Operation;
    OperationQueue = op.OperationQueue;
}

describe('Dependencies', function () {


    describe('add dependencies', function () {


        it('add a single dependency', function () {
            var op1, op2;
            op1 = new Operation('op1');
            op2 = new Operation('op2');
            op1.addDependency(op2);
            assert.include(op1.dependencies, op2);
        });

        it('add multiple dependencies', function () {
            var op1 = new Operation('op1');
            var op2 = new Operation('op2');
            var op3 = new Operation('op2');
            op1.addDependency(op2, op3);
            assert.include(op1.dependencies, op2);
            assert.include(op1.dependencies, op3);
        });

        it('add a single dependency, specifying success', function () {
            var op1, op2;
            op1 = new Operation('op1');
            op2 = new Operation('op2');
            op1.addDependency(op2, true);
            assert.include(op1.dependencies, op2);
            assert.notInclude(op1.dependencies, true);
            assert.include(op1._mustSucceed, op2);
        });

        it('add multiple dependencies, specifying success', function () {
            var op1 = new Operation('op1');
            var op2 = new Operation('op2');
            var op3 = new Operation('op2');
            op1.addDependency(op2, op3, true);
            assert.include(op1.dependencies, op2);
            assert.include(op1.dependencies, op3);
            assert.include(op1._mustSucceed, op2);
            assert.include(op1._mustSucceed, op3);
        });


    });

    describe('simple', function () {
        var order, completion;

        var op1, op2;

        beforeEach(function () {
            order = [];
            completion = function () {
                assert.instanceOf(this, Operation);
                order.push(this.name);
            };
            op1 = new Operation('op1');
            op2 = new Operation('op2');
            op1.addDependency(op2);
        });

        it('op2 shouldnt be able to run', function () {
            assert.notOk(op1.canRun);
        });

        it('on op2 completion, op1 should be able to run', function () {
            op2.completed = true;
            assert.ok(op1.canRun);
        });

        describe('dependency hasnt finished', function () {
            beforeEach(function (done) {
                op1.work = function (finished) {
                    setTimeout(function () {
                        finished();
                        if (order.length == 2) done();
                    }, 20);
                };
                op1.completion = completion;
                op2.work = function (finished) {
                    setTimeout(function () {
                        finished();
                        if (order.length == 2) done();
                    }, 20);
                };
                op2.completion = completion;
                op1.start();
                op2.start();
            });
            it('should have finished in the correct order', function () {
                assert.equal(order[0], 'op2');
                assert.equal(order[1], 'op1');
            });
        });





    });

});
