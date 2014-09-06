/*
 * Contains functions from underscore.js which are used in operation.js
 */

var FuncProto = Function.prototype,
        ArrayProto = Array.prototype,
        nativeBind = FuncProto.bind,
        slice = ArrayProto.slice,
        hasEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        nonEnumerableProps = ['constructor', 'valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'],
        reduceError = 'Reduce of empty array with no initial value',
        Ctor = function(){};

function Utils() {
    if (!this) {
        return new Utils();
    }
}

if (typeof /./ !== 'function') {
    Utils.isFunction = function(obj) {
        return typeof obj == 'function' || false;
    };
}

Utils.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

Utils.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!this.isFunction(func)) throw new TypeError('Bind must be called on a function');
    args = slice.call(arguments, 2);
    bound = function() {
        if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
        Ctor.prototype = func.prototype;
        var self = new Ctor;
        Ctor.prototype = null;
        var result = func.apply(self, args.concat(slice.call(arguments)));
        if (this.isObject(result)) return result;
        return self;
    };
    return bound;
};

//Doesn't _ placeholder
Utils.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
        var position = 0;
        var args = boundArgs.slice();
        while (position < arguments.length) args.push(arguments[position++]);
        return func.apply(this, args);
    };
};

Utils.each = function(obj, iteratee, context) {
    if (obj == null) return obj;
    iteratee = createCallback(iteratee, context);
    var i, length = obj.length;
    if (length === +length) {
        for (i = 0; i < length; i++) {
            iteratee(obj[i], i, obj);
        }
    } else {
        var keys = this.keys(obj);
        for (i = 0, length = keys.length; i < length; i++) {
            iteratee(obj[keys[i]], keys[i], obj);
        }
    }
    return obj;
  };

Utils.map = function(obj, iteratee, context) {
    if (obj == null) return [];
    iteratee = this.iteratee(iteratee, context);
    var keys = obj.length !== +obj.length && this.keys(obj),
        length = (keys || obj).length,
        results = Array(length),
        currentKey;
    for (var index = 0; index < length; index++) {
        currentKey = keys ? keys[index] : index;
        results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
};

Utils.reduce = function(obj, iteratee, memo, context) {
    if (obj == null) obj = [];
    iteratee = createCallback(iteratee, context, 4);
    var keys = obj.length !== +obj.length && this.keys(obj),
        length = (keys || obj).length,
        index = 0, currentKey;
    if (arguments.length < 3) {
        if (!length) throw new TypeError(reduceError);
        memo = obj[keys ? keys[index++] : index++];
    }
    for (; index < length; index++) {
        currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
    }
    return memo;
  };

Utils.pluck = function(obj, key) {
    return this.map(obj, this.property(key));
};

Utils.some = function(obj, predicate, context) {
    if (obj == null) return false;
    predicate = this.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && this.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
        currentKey = keys ? keys[index] : index;
        if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

Utils.filter = function(obj, predicate, context) {
    var results = [];
    if (obj == null) return results;
    predicate = this.iteratee(predicate, context);
    this.each(obj, function(value, index, list) {
        if (predicate(value, index, list)) results.push(value);
    });
    return results;
};

Utils.property = function(key) {
    return function(obj) {
        return obj == null ? void 0 : obj[key];
    };
};

Utils.iteratee = function(value, context, argCount) {
    if (value == null) return this.identity;
    if (this.isFunction(value)) return createCallback(value, context, argCount);
    if (this.isObject(value)) return this.matches(value);
    return this.property(value);
};

Utils.matches = function(attrs) {
    var pairs = this.pairs(attrs), length = pairs.length;
    return function(obj) {
        if (obj == null) return !length;
        obj = new Object(obj);
        for (var i = 0; i < length; i++) {
            var pair = pairs[i], key = pair[0];
            if (pair[1] !== obj[key] || !(key in obj)) return false;
        }
        return true;
    };
};

Utils.identity = function(value) {
    return value;
};

Utils.pairs = function(obj) {
    var keys = this.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
        pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
};

Utils.keys = function(obj) {
    if (!this.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (this.has(obj, key)) keys.push(key);

    if (hasEnumBug) {
        var nonEnumIdx = nonEnumerableProps.length;
        while (nonEnumIdx--) {
            var prop = nonEnumerableProps[nonEnumIdx];
            if (this.has(obj, prop) && !this.contains(keys, prop)) keys.push(prop);
        }
    }
    return keys;
};

Utils.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
};

Utils.contains = function(obj, target) {
    if (obj == null) return false;
    if (obj.length !== +obj.length) obj = this.values(obj);
    return this.indexOf(obj, target) >= 0;
};

Utils.values = function(obj) {
    var keys = this.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
        values[i] = obj[keys[i]];
    }
    return values;
  };

Utils.indexOf = function(array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, length = array.length;
    if (isSorted) {
        if (typeof isSorted == 'number') {
            i = isSorted < 0 ? Math.max(0, length + isSorted) : isSorted;
        } else {
            i = this.sortedIndex(array, item);
            return array[i] === item ? i : -1;
        }
    }
    for (; i < length; i++) if (array[i] === item) return i;
    return -1;
};

Utils.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = this.iteratee(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = array.length;
    while (low < high) {
        var mid = low + high >>> 1;
        if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
};


var createCallback = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
        case 1: return function(value) {
            return func.call(context, value);
        };
        case 2: return function(value, other) {
            return func.call(context, value, other);
        };
        case 3: return function(value, index, collection) {
            return func.call(context, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
            return func.call(context, accumulator, value, index, collection);
        };
    }
    return function() {
      return func.apply(context, arguments);
    };
};

module.exports = Utils;