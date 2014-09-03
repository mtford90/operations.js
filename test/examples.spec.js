/*global describe,it,beforeEach */


var Operation, OperationQueue, _;

if (typeof require == 'undefined') {
    Operation = op.Operation;
    assert = chai.assert;
    _ = getUnderscore(); // Shim.
    OperationQueue = op.OperationQueue;
}
else { // NodeJS
    assert = require('chai').assert;
    Operation = require('../src/operation').Operation;
    OperationQueue = require('../src/queue').OperationQueue;
    _ = require('underscore');
}


describe('examples', function () {

    describe('spawn lots', function () {

        this.timeout(3000);

        var myQueue;
        var order;
        var logOp;

        function createUselessOperation() {
            return new Operation('My Useless Operation', function (done) {
                var finished = false;
                var self = this;
                var interval = setInterval(function () {
                    if (self.cancelled || finished) {
                        clearInterval(interval);
                        if (finished) done();
                    }
                }, 10);
                setTimeout(function () {
                    finished = true;
                }, 100);
            });
        }

        function createLogOperation() {
            return new Operation('My Logger Operation', function (done) {
                console.log('Finished!');
                done();
            });
        }

        beforeEach(function (done) {
            myQueue = new OperationQueue(2);
            order = [];
            logOp = createLogOperation();
            for (var i = 0; i < 10; i++) {
                var uselessOp = createUselessOperation();
                uselessOp.onCompletion(function () {
                    order.push(this)
                });
                myQueue.addOperation(uselessOp);
                logOp.addDependency(uselessOp);
            }
            logOp.onCompletion(function (){
                order.push(logOp);
                done();
            });
            myQueue.addOperation(logOp);
            myQueue.start();
        });

        it('finishes', function () {
            // Do nothing. We just want to see that it finishes.
        });

        it('last one to finish is the log operation', function () {
            assert.equal(order[order.length-1], logOp);
        })

    });





});
