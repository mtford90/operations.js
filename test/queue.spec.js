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

describe('OperationQueue', function () {
    it('xyz', function () {

    })
});
