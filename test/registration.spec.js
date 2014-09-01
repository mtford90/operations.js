/*global describe,it,beforeEach */

var Operation, _, assert;

if (typeof require == 'undefined') {
    Operation = op.Operation;
    assert = chai.assert;
    _ = getUnderscore(); // Shim.
}
else { // NodeJS
    assert = require('chai').assert;
    Operation = require('../src/operation').Operation;
    _ = require('underscore');
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

