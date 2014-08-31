/*global describe,it,beforeEach */
var BaseOperation;
if (!assert) { // node.js tests
    var assert = require('chai').assert;
    BaseOperation = require('../src/base').BaseOperation;
}
else { // Browser tests
    BaseOperation = op.BaseOperation;
}

describe('BaseOperation', function () {

    var op;

    beforeEach(function () {
        op = new BaseOperation('op');
    });

    describe('initial state', function () {
        it('should not be completed', function () {
            assert.notOk(op.completed);
        });

        it('should be no result', function () {
            assert.notOk(op.result);
        });

        it('should not be running', function () {
            assert.notOk(op.running);
        });

        it('should not have an error', function () {
            assert.notOk(op.error);
        });

        it('should have a name', function () {
            assert.equal(op.name, 'op');
        });

        it('should not have failed', function () {
            assert.notOk(op.failed);
        })
    });

    describe('running state', function () {

        beforeEach(function () {
            op.work = function (callback) {
                setTimeout(function () {
                    callback();
                }, 50);
            };
            op.start();
        });

        it('should not be completed', function () {
            assert.notOk(op.completed);
        });

        it('should be no result', function () {
            assert.notOk(op.result);
        });

        it('should be running', function () {
            assert.ok(op.running);
        });

        it('should not have an error', function () {
            assert.notOk(op.error);
        });

        it('should not have failed', function () {
            assert.notOk(op.failed);
        })

    });

    describe('completion state', function () {

        describe('no error', function () {
            beforeEach(function (done) {
                op.work = function (callback) {
                    callback(null, 'xyz');
                };
                op.completionCallback = function () {
                    done();
                };
                op.start();
            });

            it('should be completed', function () {
                assert.ok(op.completed);
            });

            it('should have a result', function () {
                assert.equal(op.result, 'xyz');
            });

            it('should not be running', function () {
                assert.notOk(op.running);
            });

            it('should not have an error', function () {
                assert.notOk(op.error);
            });

            it('should not have failed', function () {
                assert.notOk(op.failed);
            })
        });

        describe('error', function () {
            beforeEach(function (done) {
                op.work = function (callback) {
                    callback('error');
                };
                op.completionCallback = function () {
                    done();
                };
                op.start();
            });

            it('should be completed', function () {
                assert.ok(op.completed);
            });

            it('should not have a result', function () {
                assert.notOk(op.result);
            });

            it('should not be running', function () {
                assert.notOk(op.running);
            });

            it('should have an error', function () {
                assert.equal(op.error, 'error');
            });

            it('should have failed', function () {
                assert.ok(op.failed);
            })
        });

    });

});
