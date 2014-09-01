operations.js
=============
A library for managing complex chains of asynchronous operations in Javascript. 

Libraries such as async.js are awesome, but when attempting to define complex dependencies between your asynchronous callbacks things can quickly get out of hand. 

Inspired by the NSOperation and NSOperationQueue classes in Apple's Cocoa framework, this library is an attempt to solve this problem.

## Usage

### Simple

Operations can be created as follows:
```javascript
var operation = new Operation(function (done) {
	setTimeout(function () {
		done(null, 'result');
	}, 1000);
});

// Fired on completion, errors or otherwise.
operation.completion = function () {
	console.log(this.error); // null
	console.log(this.result); // 'result'
};

operation.start();
```


We can also give our operations a name:

```javascript
var operation = new Operation('Do some stuff...', function (done) {
	// Do some stuff...
});
````

This is useful for logging and debugging.

### Composite

#### Operations

```javascript
var op1 = new Operation(function (done) {
	// Do something.
	done('error');
});

var op2 = new Operation(function (done) {
	// Do something else.
	done(null, 'result of something else');
});

var compositeOperation = new Operation([op1, op2]);

console.log(compositeOperation.isComposite); // true

compositeOperation.completion = function () {
	console.log(this.result); // [undefined, 'result of something else'];
	console.log(this.error); // ['error', undefined];
	console.log(this.failed); // true
}

compositeOperation.start();
```

#### Functions

Composite operations can also be constructed using functions:

```javascript
var op1 = function (done) {
    // Do something.
    console.log(this); // Reference to automatically generated Operation object.
    done('error');
};

var op2 = function (done) {
    // Do something else.
    console.log(this); // Reference to automatically generated Operation object.
    done(null, 'result of something else');
};

var compositeOperation = new Operation([op1, op2]);
```
### Cancellation

Operations can be cancelled by calling `cancel`. You must handle this within the function that defines your operation, otherwise the operation will just run to completion.

```javascript
var op1 = new Operation(function (done) {
	while(!this.cancelled) {
		// ... do some stuff.
		if (finished) done();
	}
});

op.cancel(function () {
	// Called on cancel if operation handled cancellation, otherwise called on completion.
});
```

### Dependencies

Operations can depend on other operations before starting.

```javascript
var op1 = new Operation(function (done) {
	// Do something.
	done('error');
});

var op2 = new Operation(function (done) {
	// Do something else.
	done(null, 'result of something else');
});

op2.addDependency(op1);

op1.start();
op2.start();
```

We can also indicate that a dependency must succeed:

```javascript
op2.addDependency(op1, true);

op1.start();
op2.start();
```
In this case, `op2` would fail if `op1` failed.

### Queues

We can construct queues of operations using an `OperationQueue`.

```javascript
var queue = new OperationQueue(2); // Maximum 2 concurrent operations.
queue.addOperation(op1, op2, op3, op4);
queue.start();
```

We can have multiple queues, with dependencies between operations on different queues:

```javascript
var queue = new OperationQueue('A queue', 2);
var anotherQueue = new OperationQueue('Another queue', 4);

op2.addDependency(op4);

queue.addOperation(op1, op2, op3);
anotherQueue(op4, op5);

queue.start();
anotherQueue.start();
```

### Observing

Changes in properties on the observation object can be observed:

```javascript
operation.addObserver(function (changes) {
	_.each(changes, function(change) {
		if (change.property == 'failed') {
			if (change.new) // Operation has just failed.
		}
		else if (change.property == 'completed') {
			if (change.new) // Operation has just completed.
		}
		else if (change.property == 'running') {
			if (change.new) // Operation has just started.
		}
	});
});
```

As well as on the queues:

```javascript
queue.addObserver(function(changes) {
	_.each(changes, function (change) {
		if (change.property == 'running') {
			// Queue has started or stopped.
		}
		else if (change.property == 'numRunningOperations') {
			// Queue has started running an operation, or one has finished.
		}
		else if (change.property == 'numQueuedOperations') {
			// Queue has upgraded an operation to running status.
		}
	});
});
```

### Subclassing

For really complex operations it's probably more appropriate to subclass `Operation` so that logic can be seperated out into multiple functions.

```javascript
function MyOperation(completion) {
    if (!this) return new MyOperation(completion);
    Operation.call(this, 'My Awesome Operation', this._start, completion);
}

MyOperation.prototype = Object.create(Operation.prototype);

MyOperation.prototype._start = function (done) {
	this.doSomething();
	this.doSomethingElse();
	done();
};

MyOperation.prototype.doSomething = function () {
	// ...
};

MyOperation.prototype.doSomethingElse = function () {
	// ...
};

var op = new MyOperation(function () {
	// Completion.
});

op.start();
```

### Logging

We can enable logging at multiple levels enabling us to monitor things such as num operations running, num operations running per queue and the success and failure of operations.

#### Operation

```javascript
Operation.logLevel = Log.Levels.Info; // Global log level for operations.
op1.logLevel = Log.Levels.Info; // Override on a per operation basis.
```

Example logs:

```
INFO [Operation]: "My operation" has started. 
INFO [Operation]: "My other operation" has started. 
INFO [Operation]: "My operation" was cancelled.
INFO [Operation]: "My other operation" failed due to failure/cancellation of dependencies: ["My operation"]
```

#### Queue

```javascript
OperationQueue.logLevel = Log.Levels.info; // Global log level for queues.
queue.logLevel = Log.Levels.Info; // Override on a per queue basis.
```

Example logs:

```
INFO [OperationQueue]: "My queue" now has 1 running operation.
INFO [OperationQueue]: "My queue" now has 2 running operations.
INFO [OperationQueue]: "My queue" now has 2 running operations and 1 queued operation.
```

### Testing

When testing code using operations its usually a good idea to ensure that tests do not clobber each other:

```javascript
afterEach(function () {
	var numOperationsRunning = Operation.numOperationsRunning;
	assert(!numOperationsRunning, 'There are still ' + numOperationsRunning.toString() + ' operations running);
});
```

## Installation

### Browser

Include using script tag as normal:

```html
<script type="text/javascript" src="http://underscorejs.org/underscore-min.js"></script>
<script type="text/javascript" src="operations.min.js"></script>
```

Can also be installed via bower:

```bash
bower install operations --save
```

The classes are made available in the `op` property of `window` and hence are available globally as follows within the browser:
 
```javascript
var Operation       = op.Operation,
    OperationQueue  = op.OperationQueue,
    Log             = op.Log;
```

### NodeJS

Install via npm:

```bash
npm install operations --save
```

And then use as normal:

```javascript
var operations          = require('operations'),
	Operation           = operations.Operation,
	OperationQueue      = operations.OperationQueue,
	Log                 = operations.Log;
```

## Contributing

To get started first clone the repository:

```bash
git clone git@github.com:mtford90/operations.js.git
```

Then install the dependencies:

```bash
cd operations.js
npm install
npm install grunt-cli -g
```

### node.js tests

We can run the standard batch of tests for node.js by running:

```bash
grunt test
```

And run them in the browser using:

```bash
grunt testBrowser
```

The browser target can be configured in `karma/karma-unit.tpl.js`.

### Watch

We can watch for changes and run the tests automatically by running:

```bash
grunt watch
grunt watchBrowser
```

Run these commands in two seperate console instances and on any change we can then run the tests against node and the browser simultaneously.


## AngularJS bindings

An AngularJS version is available [here](https://github.com/mtford90/operations.angular.js).