/*global describe,it,beforeEach */
var BaseOperation, CompositeOperation, OperationQueue;
if (!assert) { // node.js tests
    var assert = require('chai').assert;
    BaseOperation = require('../src/base').BaseOperation;
    CompositeOperation = require('../src/composite').CompositeOperation;
    OperationQueue = require('../src/queue').OperationQueue;
}
else { // Browser tests
    BaseOperation = op.BaseOperation;
    CompositeOperation = op.CompositeOperation;
    OperationQueue = op.OperationQueue;
}

describe('OperationQueue', function () {
    it('xyz', function () {

    })
});
