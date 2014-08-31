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

//        var order;
//        var completion;
//
//        order = [];
//        completion  = function () {
//            order.push(this.name);
//        };


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



    })




});
