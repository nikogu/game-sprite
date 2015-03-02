/*
 * SpriteUtil
 *
 * @date 2014-08-04
 * @author niko
 *
 */

var toString = Object.prototype.toString;

var Util = {
    method: function (o, fns) {
        var p = o.prototype;
        for (var fn in fns) {
            if (fns.hasOwnProperty(fn)) {
                o.prototype[fn] = fns[fn];
            }
        }
    },
    proxy: function (fn, context) {
        return function () {
            fn.apply(context, arguments);
        }
    },
    isObject: function (n) {
        return toString.call(n) === '[object Object]';
    },
    isArray: function (n) {
        return toString.call(n) === '[object Array]';
    },
    isNumber: function (n) {
        return toString.call(n) === '[object Number]';
    },
    isString: function (n) {
        return toString.call(n) === '[object String]';
    },
    isFunction: function (n) {
        return toString.call(n) === '[object Function]';
    },
    clone: function (o) {
        var _o = {};

        if (Util.isArray(o)) {
            _o = o.concat();
        } else if (Util.isObject(o)) {
            for (var p in o) {
                if (o.hasOwnProperty(p)) {
                    if (Util.isObject(o[p])) {
                        _o[p] = Util.clone(o[p]);
                    } else if (Util.isArray(o[p])) {
                        _o[p] = o[p].concat();
                    } else {
                        _o[p] = o[p];
                    }
                }
            }
        } else {
            _o = o;
        }

        return _o;
    }
};

module.exports = Util;
