/**
 *
 * Sprite Transform
 *
 * @author niko
 * @date 2014-07-29
 *
 */

var toString = Object.prototype.toString;

var Matrix = require('./sprite-matrix');

/**
 * 判断是否支持一些css属性
 *
 * @method isSupport
 * @parma [String] key 支持的属性名
 * @parma [Function] callback 知道支持以后需要做的操作
 */
function isSupport(key, callback) {

    var t = {},
        k = key.replace(/(\w){1}/i, function ($1) {
            return $1.toUpperCase();
        });

    t['webkit' + k] = '';
    t['Moz' + k] = '';
    t['ms' + k] = '';
    t[key] = '';

    var a = document.createElement('div');

    for (var prop in t) {
        if (prop in a.style) {
            if (callback) {
                callback(prop, a, t);
            }
            return true;
        }
    }
    return false;
}

//css3的矩阵变化
function css3Transform(o, matrix) {
    //console.log(formatMatrix(matrix));
    o.style.webkitTransform = formatMatrix(matrix);
    o.style.msTransform = formatMatrix(matrix);
    o.style.transform = formatMatrix(matrix);
}

//设置初始化默认值
function setGAttr(o) {
    if (!o._gattr_) {
        o._gattr_ = {
            x: 0,
            y: 0,
            regX: 0,
            regY: 0,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
            transform: undefined,
            matrix: new Matrix(1, 0, 0, 1, 0, 0)
        };
    }
}

//设置属性
function setAttr(o, k, v) {
    if (k === 'scale') {
        o._gattr_['scaleX'] = v;
        o._gattr_['scaleY'] = v;
    } else {
        o._gattr_[k] = v;
    }
}

//初始化矩阵
function clearMatrix(matrix) {
    matrix.a = 1;
    matrix.b = 0;
    matrix.c = 0;
    matrix.d = 1;
    matrix.e = 0;
    matrix.f = 0;
}

//格式化矩阵为css3方式
function formatMatrix(matrix) {
    var m = 'matrix(';
    m += matrix.a + ',';
    m += matrix.b + ',';
    m += matrix.c + ',';
    m += matrix.d + ',';
    m += matrix.e + ',';
    m += matrix.f;
    m += ')';
    return m;
}

//设置变化矩阵，根据对象的属性值
function setMatrix(o) {

    clearMatrix(o._gattr_.matrix);

    if (o._gattr_.transform) {
        o._gattr_.matrix = o._gattr_.transform.transform.clone();
    }
    o._gattr_.matrix.translate(o._gattr_.x, o._gattr_.y).
        rotate(o._gattr_.rotation, o._gattr_.regX, o._gattr_.regY).
        scale(o._gattr_.scaleX, o._gattr_.scaleY, o._gattr_.regX, o._gattr_.regY);
}

//设置变化
function setTransform(o, callback) {
    if (!o._gattr_._setTransform) {

        //canvas
        if (o._gctx) {

            o._gattr_._setTransform = function (o, callback) {

                setMatrix(o);

                o._gctx.save();
                o._gctx.transform(o._gattr_.matrix.a,
                    o._gattr_.matrix.b,
                    o._gattr_.matrix.c,
                    o._gattr_.matrix.d,
                    o._gattr_.matrix.e,
                    o._gattr_.matrix.f);
                if (callback) {
                    callback();
                }
                o._gctx.restore();
            }

            //snap & raphael
        } else if ((o.node && /svg/ig.test(toString.call(o.node))) ||
            (o.view && o.view.node && /svg/ig.test(toString.call(o.view.node)) )) {

            o._gattr_._setTransform = function (o) {

                setMatrix(o);

                if (o.view) {
                    o.view.transform(o._gattr_.matrix.toTransformString());
                } else {
                    o.transform(o._gattr_.matrix.toTransformString());
                }
            }

            //dom
        } else if (o.nodeType ||
            (o.view && o.view.nodeType)) {

            if (isSupport('transform')) {

                o._gattr_._setTransform = function (o) {

                    setMatrix(o);

                    if (o.view) {
                        css3Transform(o.view, o._gattr_.matrix);
                    } else {
                        css3Transform(o, o._gattr_.matrix);
                    }
                }

            } else {

                if (o.view) {
                    if (o.view.style) {
                        o.view.style.position = 'absolute';
                    }
                } else {
                    if (o.style) {
                        o.style.position = 'absolute';
                    }
                }

                o._gattr_._setTransform = function (o) {

                    if (o.view) {
                        if (o.view.style) {
                            o.view.style.top = o._gattr_.y + 'px';
                            o.view.style.left = o._gattr_.x + 'px';
                        }
                    } else {
                        if (o.style) {
                            o.style.top = o._gattr_.y + 'px';
                            o.style.left = o._gattr_.x + 'px';
                        }
                    }
                }

            }

            //null
        } else {
            o._gattr_._setTransform = function () {
            };
        }

    }

    o._gattr_._setTransform(o, callback);

}

//返回对象
var Transform = {
    set: function (o, arg1, arg2, arg3) {
        setGAttr(o);
        if (toString.call(arg1) == '[object Object]') {
            for (var prop in arg1) {
                if (arg1.hasOwnProperty(prop)) {
                    setAttr(o, prop, arg1[prop]);
                }
            }
        } else {
            setAttr(o, arg1, arg2);
        }

        if (toString.call(arg2) == '[object Function]') {
            setTransform(o, arg2);
        } else {
            setTransform(o, arg3);
        }
    },
    get: function (o, arg) {
        setGAttr(o);
        return o._gattr_[arg];
    },
    reset: function (o) {
        o._gattr_ = undefined;
        setGAttr(o);
    },
    setTransform: setTransform,
    Matrix: Matrix
};

module.exports = Transform;
