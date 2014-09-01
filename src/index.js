var Operation = require('./operation').Operation;
var OperationQueue = require('./queue').OperationQueue;
var Logger = require('./log');
var _ = require('underscore');


if (window) {
    window.op = {
        Operation: Operation,
        OperationQueue: OperationQueue,
        Logger: Logger
    };
}