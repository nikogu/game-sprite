/*
 * Sprite Render
 *
 * @date 2014-08-04
 * @author niko
 *
 */

var U = require('./sprite-util'),
    Transform = require('./sprite-transform');

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

var toString = Object.prototype.toString;

/**
 * 是否支持css3 transform 以及 3d
 */
var KEY = '';
var isSupportTransform = isSupport('transform', function (prop) {
    KEY = prop;
});
var isSupportTransform3D = isSupport('transformOriginZ');

/**
 * 根据Sprite的渲染上下文环境获取渲染类型
 *
 * @method getRenderType
 * @return {String} 渲染类型
 */
function getRenderType() {
    var o = this.ctx;

    if (this._isTexturePicker) {

        //canvas
        if (/canvas/ig.test(toString.call(o))) {
            return 'canvas-tp';
            //snap & raphael
        } else if (o.node && /svg/ig.test(toString.call(o.node))) {
            return 'snap-tp';
            //dom
        } else if (o.nodeType) {
            if (isSupportTransform) {
                return 'dom-tp-t';
            } else {
                return 'dom-tp';
            }
        } else {
            return '';
        }

    }

    //dom
    if (/element/ig.test(toString.call(o))) {
        if (isSupportTransform) {
            return 'dom-t';
        } else {
            return 'dom';
        }
        //canvas
    } else if (/canvas/ig.test(toString.call(o))) {
        return 'canvas';
        //snap & raphael
    } else if (o.node && /svg/ig.test(toString.call(o.node))) {
        return 'snap';
        //null
    } else {
        return '';
    }
};

//渲染选择器
//每个渲染器复写 render 和 update 方法
//会在Sprite的调用这两个方法
var RenderMachine = {
    //Snap渲染器
    snap: function () {
        var s,
            offsetX,
            offsetY,
            cp;

        function setPos() {
            offsetX = -((this.cFrame % this.rowNum) * this.width);
            offsetY = -(Math.floor(this.cFrame / this.rowNum) * this.height);

            this.view.attr({
                'x': offsetX,
                'y': offsetY
            });
        }

        this._render = function () {
            this.view = this.ctx.image(this.res, 0, 0);

            cp = this.ctx.rect(0, 0, this.width, this.height);

            this.view.attr({
                'clip-path': cp
            });

            setPos.call(this);
        };

        this._update = function () {
            setPos.call(this);
        };
    },
    'snap-tp': function () {
        var s,
            pos,
            id,
            cp,
            cpStr,
            g = document.getElementById,
            body = document.body;

        function setPos() {

            cpStr = this.view.attr('clip-path');

            if (cpStr && cpStr != 'none') {
                id = cpStr.replace(/url\(|\)/ig, '');
                id = id.replace('#', '');
                document.getElementById(id).remove();
            }

            pos = this.pickData[this.cAnim.getName()][this.cAnim.ocFrame];

            this.width = pos.w;
            this.height = pos.h;

            cp = this.ctx.rect(0, 0, pos.w, pos.h);

            this.view.attr({
                'clip-path': cp
            });

            this.view.attr({
                'x': -pos.x,
                'y': -pos.y
            });

        }

        this._render = function () {
            this.view = this.ctx.image(this.res.image, 0, 0);

            setPos.call(this);
        };

        this._update = function () {
            setPos.call(this);
        };
    },
    //dom方式的渲染器
    dom: function () {

        var s,
            offsetX,
            offsetY;

        function setPos() {
            offsetX = -((this.cFrame % this.rowNum) * this.width);
            offsetY = -(Math.floor(this.cFrame / this.rowNum) * this.height);
            this.view.style.backgroundPosition = offsetX + 'px ' + offsetY + 'px';
        };

        this._render = function () {
            this.view = document.createElement('div');

            s = this.view.style;
            s.width = this.width + 'px';
            s.height = this.height + 'px';
            s.position = 'absolute';
            s.top = 0;
            s.left = 0;

            s.backgroundImage = 'url("' + this.res + '")';
            s.backgroundRepeat = 'no-repeat';

            setPos.call(this);

            this.ctx.appendChild(this.view);

        };

        this._update = function () {
            setPos.call(this);
        };

    },
    //利用transform+overflow做切换的dom渲染模式
    'dom-t': function () {
        var s,
            img,
            offsetX,
            offsetY;

        var _set;
        if (isSupportTransform3D) {
            _set = function () {
                img.style[KEY] = 'translate3d(' + offsetX + 'px,' + offsetY + 'px,0px)';
            }
        } else {
            _set = function () {
                img.style[KEY] = 'translate(' + offsetX + 'px,' + offsetY + 'px)';
            }
        }
        function setPos() {
            offsetX = -((this.cFrame % this.rowNum) * this.width);
            offsetY = -(Math.floor(this.cFrame / this.rowNum) * this.height);

            _set();
        };

        this._render = function () {
            img = new Image();
            img.src = this.res;

            this.view = document.createElement('div');

            s = this.view.style;
            s.width = this.width + 'px';
            s.height = this.height + 'px';
            s.overflow = 'hidden';
            s.position = 'absolute';
            s.top = 0;
            s.left = 0;

            setPos.call(this);

            this.view.appendChild(img);
            this.ctx.appendChild(this.view);

        };

        this._update = function () {
            setPos.call(this);
        };
    },
    //dom texturepicker渲染器
    'dom-tp': function () {

        var s,
            pos;

        function setPos() {
            s = this.view.style;

            pos = this.pickData[this.cAnim.getName()][this.cAnim.ocFrame];
            this.width = pos.w;
            this.height = pos.h;
            s.width = pos.w + 'px';
            s.height = pos.h + 'px';
            s.backgroundPosition = (-pos.x) + 'px ' + (-pos.y) + 'px';
        }

        this._render = function () {
            if (!this.cAnim) {
                return;
            }
            animData = this.pickData[this.cAnim.getName()];

            this.view = document.createElement('div');

            s = this.view.style;

            s.backgroundImage = 'url("' + this.res.image + '")';
            s.backgroundRepeat = 'no-repeat';
            s.position = 'absolute';
            s.top = 0;
            s.left = 0;

            setPos.call(this);

            this.ctx.appendChild(this.view);

        };
        this._update = function () {
            setPos.call(this);
        };
    },
    'dom-tp-t': function () {

        var s,
            img,
            pos;

        var _set;

        if (isSupportTransform3D) {
            _set = function (pos) {
                img.style[KEY] = 'translate3d(' + (-pos.x) + 'px,' + (-pos.y) + 'px,0px)';
            }
        } else {
            _set = function (pos) {
                img.style[KEY] = 'translate(' + (-pos.x) + 'px,' + (-pos.y) + 'px)';
            }
        }

        function setPos() {
            s = this.view.style;

            pos = this.pickData[this.cAnim.getName()][this.cAnim.ocFrame];
            this.width = pos.w;
            this.height = pos.h;
            s.width = pos.w + 'px';
            s.height = pos.h + 'px';

            _set(pos);
        }

        this._render = function () {
            if (!this.cAnim) {
                return;
            }

            animData = this.pickData[this.cAnim.getName()];

            img = new Image();
            img.src = this.res.image;

            this.view = document.createElement('div');
            s = this.view.style;
            s.overflow = 'hidden';
            s.position = 'absolute';
            s.top = 0;
            s.left = 0;

            setPos.call(this);

            this.view.appendChild(img);
            this.ctx.appendChild(this.view);

        };
        this._update = function () {
            setPos.call(this);
        };

    },
    canvas: function () {

        var offsetX,
            offsetY;

        var that = this;

        function setPos() {
            offsetX = ((this.cFrame % this.rowNum) * this.width);
            offsetY = (Math.floor(this.cFrame / this.rowNum) * this.height);

            if (this._gattr_) {
                Transform.setTransform(this, U.proxy(function () {
                    this.ctx.drawImage(this.res, offsetX, offsetY, this.width, this.height, 0, 0, this.width, this.height);
                }, this));
            } else {
                this.ctx.drawImage(this.res, offsetX, offsetY, this.width, this.height, 0, 0, this.width, this.height);
            }
        }

        this._render = function () {
            this._force = true;
            setPos.call(this);
        };

        this._update = function () {
            setPos.call(this);
            this._isUpdate = true;
        };
    },
    'canvas-tp': function () {

        var pos;

        function setPos() {

            pos = this.pickData[this.cAnim.getName()][this.cAnim.ocFrame];

            this.width = pos.w;
            this.height = pos.h;

            if (this._gattr_) {
                Transform.setTransform(this, U.proxy(function () {
                    this.ctx.drawImage(this.res.image, pos.x, pos.y, pos.w, pos.h, 0, 0, pos.w, pos.h);
                }, this));

            } else {
                this.ctx.drawImage(this.res.image, pos.x, pos.y, pos.w, pos.h, 0, 0, pos.w, pos.h);
            }
        }

        this._render = function () {
            this._force = true;
            setPos.call(this);
        };

        this._update = function () {
            setPos.call(this);
            this._isUpdate = true;
        };


    }
};

//返回的publish对象
var Render = {
    /**
     * 设置Sprite渲染方式
     *
     * @method setRedner
     * @param {Function} crender 用户自定义渲染方式
     * @param {Function} cdistroy 用户自定义销毁方式
     * @return undefined
     */
    setRender: function (crender, cdistroy) {
        //获取渲染类型
        var type = getRenderType.call(this);
        this._renderType = type;

        //适配Transform的canvas
        if (/canvas/ig.test(type)) {
            this._gctx = this.ctx;
        }

        //自定义渲染
        if (crender) {
            this.crender.call(this);
            this.distroy = cdistroy;
        } else {
            //根据渲染类型，选择渲染器
            RenderMachine[type].call(this);
        }
    },
    /**
     * 设置Sprite销毁方式
     *
     * @method setDistroy
     * @return undefined
     */
    setDistroy: function () {
        if (this._renderType == 'dom' || this._renderType == 'dom-tp') {
            this.ctx.removeChild(this.view);
        } else if (this._renderType == 'snap') {
            this.view.remove();
        } else if (this._renderType == 'canvas') {

        } else {
        }
    }
};

module.exports = Render;
