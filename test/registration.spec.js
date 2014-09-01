/*global describe,it,beforeEach */
var Operation;
if (!assert) { // node.js tests
    var assert = require('chai').assert;
    Operation = require('../src/operation').Operation;
}
else { // Browser tests
    Operation = op.Operation;
}

describe('registration', function () {
    describe('of operations', function () {

        it('xyz', function (done) {
            var op = new Operation(function (done) {
                setTimeout(function () {
                    done();
                }, 50);
            });
            op.completion = function () {
                assert.notInclude(Operation.running, op);
                done();
            };
            op.start();

            assert.include(Operation.running, op);
        });

    });
});

