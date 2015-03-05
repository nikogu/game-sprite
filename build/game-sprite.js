(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
 * Game Sprite
 *
 * @url http://nikogu.github.io/game-sprite/
 * @date 2015-02-28
 * @author niko
 *
 */
var Transform = require('./mod/sprite-transform'),
    Timeline = require('./mod/sprite-timeline');

var U = require('./mod/sprite-util'),
    SpriteAnimation = require('./mod/sprite-animation'),
    SpriteRender = require('./mod/sprite-render');

function Sprite(_o) {

    var o = _o || {};

    //基本属性设置
    for (var prop in o) {
        if (o.hasOwnProperty(prop)) {
            this[prop] = o[prop];
        }
    }

    //一般情况指非tp数据使用
    //其中tp===texturepicker

    /**
     * 资源对象
     * 一般来说是图片路径，在canvas模式下是image对象
     * 如果是使用tp数据，则需要json数据和图片路径
     *
     * @property res
     * @type {Object}
     * @default {}
     */
    //this.res = o.res;

    /**
     * 一般情况下表示总帧数
     *
     * @property count
     * @type {Number}
     * @default 0
     */
    this.count = o.count || 0;

    /**
     * 动画SPF
     *
     * @property spf
     * @type {Number}
     * @default 100
     */
    this.spf = o.spf || 100;

    /**
     * 表示每帧的的宽度
     *
     * @property width
     * @type {Number}
     * @default 0
     */
    this.width = o.width || 0;

    /**
     * 表示每帧的的高度
     *
     * @property height
     * @type {Number}
     * @default 0
     */
    this.height = o.height || 0;

    /**
     * Sprite图片资源的行数
     * 可以通过设置row来设置一张图片的换行
     *
     * @property row
     * @type {Number}
     * @default 1
     */
    this.row = o.row || 1;

    /**
     * Sprite动画是否暂停
     *
     * @property isPause
     * @type {Boolean}
     * @default false
     */
    this.isPause = false;

    /**
     * Spirte帧数在图片中每行的个数
     *
     * @property rowNumber
     * @type {Number}
     * @default 1
     */
    this.rowNum = Math.ceil(this.count / this.row);

    /**
     * 一般情况下 Sprite动画信息对象
     *
     * @property anim
     * @type {Object}
     * @default undefined
     */
    //this.anim = o.anim || undefined;

    /**
     * 当前动画
     *
     * @property cAnim
     * @type {SpriteAnimation}
     * @default undefined
     */
    //this.cAnim = undefined;

    /**
     * 一般情况下 当前帧数
     *
     * @property cFrame
     * @type {Number}
     * @default 0
     */
    this.cFrame = 0;

    /**
     * 动画播放的次数
     *
     * @property playCount
     * @type {Number}
     * @default 0
     */
    this.playCount = 0;

    /**
     * 当前动画已经播放的次数
     *
     * @property playCurrentCount
     * @type {Number}
     * @default 0
     */
    this.playCurrentCount = 0;

    /**
     * 规定次数的动画播放完执行的回调
     *
     * @property playCallback
     * @type {Function}
     * @default undefined
     */
    this.playCallback = undefined;

    //私有成员变量
    /**
     * Sprite私有动画对象
     *
     * @property _animation
     * @type {Object}
     * @default {}
     * @private
     */
    this._animation = {};

    /**
     * Sprite当前动画队列
     *
     * @property _animQueue
     * @type {Object}
     * @default {}
     * @private
     */
    this._animQueue = {};

    /**
     * 缓存时间
     *
     * @property _otime
     * @property _ntime
     * @type {Number}
     * @default new Date().getTime()
     * @private
     */
    this._otime = new Date().getTime();
    this._ntime = this._otime;

    /**
     * 单个动画repeat次数
     *
     * @property _sRepeatCount
     * @type {Number}
     * @default 0
     * @private
     */
    this._sRepeatCount = 0;

    /**
     * 用于标示在渲染周期中是否更新视图
     * 主要兼容canvas的每帧渲染
     *
     * @property _isUpdate
     * @type {Boolean}
     * @default false
     * @private
     */
    this._isUpdate = false;

    /**
     * 用于标示Sprite是否已经渲染
     *
     * @property _isRendered
     * @type {Boolean}
     * @default false
     * @private
     */
    this._isRendered = false;


    /**
     * 表示Sprite是否销毁
     *
     * @property _isRendered
     * @type {Boolean}
     * @default false
     * @private
     */
    this._isRendered = false;

    /**
     * 渲染方式
     *
     * @property _renderType
     * @type {String}
     * @default ''
     * @private
     */
    this._renderType = '';

    /**
     * 内部timeline spf
     *
     * @property _SPF
     * @type {Number}
     * @default 1000/60
     * @private
     */
    this._SPF = 1000 / 60;

    //初始化
    //如果使用了texturepick
    if (this.res.json) {
        this._isTexturePicker = true;
        this._setData();
    }

}

//++++++++++++++++++++++
//私有方法
//++++++++++++++++++++++
U.method(Sprite, {
    /**
     * 整理texture导出的json数据便于操作
     *
     * @method _setDate
     * @return {this}
     * @private
     */
    _setData: function () {
        //私有
        this._data = this.res.json;

        var o = {},
            name = '',
            num = 0,
            frames = '',
            k = '';

        if (!this._data._gamasprite) {
            this._data._gamasprite = {};

            for (var anim in this._data.frames) {

                frames = this._data.frames[anim].frame;

                name = anim.replace(/\.\w*/ig, '');
                k = name.replace(/-\d+$/ig, '');

                if (!this._data._gamasprite[k]) {
                    this._data._gamasprite[k] = [];
                }

                num = /-(\d+)$/ig.exec(name);

                if (!num || num[1] === undefined) {
                    this._data._gamasprite[k][0] = frames;
                } else {
                    this._data._gamasprite[k][num[1]] = frames;
                }

            }
        }

        this.pickData = this._data._gamasprite;

        return this;
    },
    /**
     * 拼完整的anim数据
     * [0, 1, 'next', 100]
     */
    _perfectAnim: function (anims, spf) {
        var ao = U.clone(this.anim),
            res = {},
            count = 0,
            a,
            first;

        if (U.isString(anims)) {
            anims = [anims];
        }
        if (!anims || anims.length < 1) {
            throw new Error('need animation');
        }

        first = anims[0];

        for (var i = 0, len = anims.length; i < len; i++) {
            a = ao[anims[i]].concat();
            if (!a[1]) {
                a[1] = a[0];
            }
            if (anims[i + 1]) {
                a.push(anims[i + 1]);
            } else if (i == len - 1) {
                a.push(first);
            } else {
                a.push(anims[i]);
            }
            a.push(spf);

            //已存在此动画
            if (res[anims[i]]) {
                res[anims[i] + '_gcount_' + count] = a.concat();
                //修改上一个动画的下一个动画的名称
                if (res[anims[i - 1]]) {
                    res[anims[i - 1]][2] = anims[i] + '_gcount_' + count;
                }
                count++;
            } else {
                res[anims[i]] = a.concat();
            }
        }

        return {
            first: first,
            anims: res,
            length: len
        };

    },
    /**
     * 一般情况下，根据参数设置Sprite动画
     *
     * @method _setAnim
     * @return {this}
     * @private
     */
    _setAnim: function (anims, spf) {

        var perfectAnim = this._perfectAnim(anims, spf),
            ao = perfectAnim.anims,
            first = perfectAnim.first,
            next;

        if (ao) {
            for (var anim in ao) {
                this._animation[anim] = new SpriteAnimation(anim, ao);
            }

            //设置下一动画对象
            for (var anim in this._animation) {
                next = this._animation[anim].nextAnimationName;
                if (next) {
                    this._animation[anim].setNextAnim(this._animation[next]);
                }
            }
        }

        this.cAnim = this._animation[first];
        this._animation.length = perfectAnim.length;
        this.cFrame = this.cAnim.ocFrame + this.cAnim.firstFrame;

        return this;
    },
    /**
     * 适配texturepicker数据的动画
     *
     * @method _setAnimOfTP
     * @return {this}
     * @private
     */
    _setAnimOfTP: function (anims, spf) {

        this.anim = {};
        if (U.isString(anims)) {
            anims = [anims];
        }
        //转换anim
        for (var i = 0; i < anims.length; i++) {
            try {
                if (!this.anim[anims[i]]) {
                    this.anim[anims[i]] = [0, this.pickData[anims[i]].length - 1];
                }
            } catch (e) {
                throw new Error('there is no ' + anims[i] + ' animation');
            }
        }

        //设置动画
        this._setAnim(anims, spf);

        for (var a in this._animation) {
            this._animation[a]._data = this.pickData[a];
        }

        return this;
    },
    /**
     * 动画进行操作
     *
     * @method _playAnim
     * @return {this}
     * @private
     */
    _playAnim: function () {

        if (this.cAnim.rate < 0) {
            this.pause();
            this._update();
            return this;
        }
        this._ntime = new Date().getTime();
        //如果已经超过规定的速率，则进行下一帧
        if (this._ntime - this._otime >= this.cAnim.rate) {
            this._nextFrame();

            //更新时间
            this._otime = this._ntime;
        }

        return this;

    },
    //渲染器会重写两个方法
    _render: function () {
    },
    _update: function () {
    },
    /**
     * 进行下一帧的计算
     *
     * @method _nextFrame
     * @return {this}
     * @private
     */
    _nextFrame: function (callback) {

        this.cAnim.ocFrame++;

        //当前是最后一帧
        if (this.cAnim.ocFrame == this.cAnim.totalFrame - 1 || this.cAnim.totalFrame == 1) {
            this._sRepeatCount++;
            if (this._sRepeatCount % this._animation.length == 0) {
                //有计数需求
                if (this.playCount > 0) {
                    this.playCurrentCount++;
                    if (this.playCurrentCount >= this.playCount) {
                        this.playCurrentCount = 0;
                        this.playCount = 0;
                        this.stop();
                        this.cFrame = this.cAnim.lastFrame;
                        this._update();
                        this.playCallback.call(this);
                        return this;
                    }
                }
            }
        }

        //超过应有的帧数
        if (this.cAnim.ocFrame >= this.cAnim.totalFrame) {

            if (this.cAnim.nextAnimation) {
                this.cAnim = this.cAnim.nextAnimation;
                this.cAnim.ocFrame = 0;
                this.cFrame = this.cAnim.ocFrame + this.cAnim.firstFrame;
                this._update();
            } else {
                this.pause();
                this._update();
            }

            return this;

        }

        this.cFrame = this.cAnim.ocFrame + this.cAnim.firstFrame;
        this._update();

        return this;
    },
    /**
     * 创造动画序列
     */
    _createAnimQueue: function (anims, count, callback, spf) {
        var spf = spf || this.spf;

        this._sRepeatCount = 0;
        this.playCount = count;
        this.playCallback = callback || function () {
        };

        if (this._isTexturePicker) {
            this._setAnimOfTP(anims, spf);
        } else {
            this._setAnim(anims, spf);
        }

        return this;
    }
});

//++++++++++++++++++++++
//公有方法
//++++++++++++++++++++++
U.method(Sprite, {
    /**
     * 设置属性
     *
     * @method set
     * @return {this}
     */
    set: function (arg1, arg2) {
        Transform.set(this, arg1, arg2);
        return this;
    },
    /**
     * 读取属性
     *
     * @method get
     * @return {Object} 值
     */
    get: function (arg) {
        return Transform.get(this, arg);
    },
    /**
     * 方便用户直接跑起来
     *
     * @method run
     * @return {this}
     */
    run: function () {
        var that = this;

        that.play.apply(this, arguments);

        if (!that.tm) {
            that.tm = Timeline.use('gama-sprite-timeline').init(this._SPF);
        }
        if (!that.tk) {
            that.tk = that.tm.createTask({
                duration: -1,
                onTimeStart: function () {
                },
                onTimeUpdate: function () {
                    that.update();
                },
                onTimeEnd: function () {
                }
            });
        }

        that.tm.start();
    },
    /**
     * 渲染视图
     * 调用此方法就根据上下文绘制sprite
     * 通过SpritRender进行渲染处理
     *
     * @method draw
     * @param {Object} name 动画名称
     * @param {Function} [crender] 用户自定义渲染函数
     * @param {Function} [cdistroy] 用户自定义销毁函数
     * @return {this}
     */
    draw: function (name, crender, cdistroy) {

        if (this._isRendered) {
            return this;
        }
        this._isRendered = true;

        if (this.cAnim === undefined) {
            try {
                this.play(name);
            } catch (e) {
                throw new Error('need animation name');
            }
        }

        if (!this.ctx) {
            throw new Error('need render ctx');
        }

        SpriteRender.setRender.call(this, crender, cdistroy);

        this._render();

        if (this._gattr_) {
            this._gattr_._setTransform = undefined;
            Transform.setTransform(this);
        }

        this.update();

        return this;
    },
    /**
     * 销毁Sprite视图
     *
     * @method distroy
     * @return {this}
     */
    distroy: function () {
        this._isRendered = false;

        SpriteRender.setDistroy.call(this);

        this.stop();

        return this;
    },
    /**
     * 进行精灵动画
     *
     * @method play
     * @return {this}
     */
    play: function () {

        var args = arguments;

        if (U.isNumber(args[0])) {
            this._createAnimQueue(args[1], args[2], args[3], args[0]);
        } else {
            this._createAnimQueue(args[0], args[1], args[2]);
        }

        if (!this._isRendered) {
            this.draw();
        }

        this.start();

        return this;
    },
    /**
     * 开始动画
     *
     * @method start
     * @return {this}
     */
    start: function () {
        this.isPause = false;
        return this;
    },
    /**
     * 暂停动画
     *
     * @method pause
     * @return {this}
     */
    pause: function () {
        this.isPause = true;
        return this;
    },
    /**
     * 停止时间轴
     *
     * @method stop
     * @return {this}
     */
    stop: function () {

        this.pause();

        if (this.tk && this.tk.stop) {
            this.tk.stop();
            this.tk = undefined;
        }

        return this;
    },
    /**
     * 更新Sprite动画帧
     *
     * @method update
     * @return {this}
     */
    update: function (t) {
        if (!this._isRendered) {
            return this;
        }
        this._isUpdate = false;

        //针对于canvas没帧强制渲染
        if (this.isPause) {
            if (this._force) {
                this._update();
            }
            return this;
        }

        //播放动画
        if (this.cAnim) {
            this._playAnim();
        }

        if (this._force && !this._isUpdate) {
            this._update();
        }

        return this;
    }
});

Sprite.Timeline = Timeline;
Sprite.Transform = Transform;
if ( window ) {
    window.Sprite = Sprite;
}
module.exports = Sprite;

},{"./mod/sprite-animation":2,"./mod/sprite-render":4,"./mod/sprite-timeline":5,"./mod/sprite-transform":6,"./mod/sprite-util":7}],2:[function(require,module,exports){
/*
 * SpriteAnimation
 *
 * @date 2014-08-04
 * @author niko
 *
 */

var U = require('./sprite-util');

function SpriteAnimation(name, args) {

    this.args = args[name];

    /**
     * 动画名称
     *
     * @property name
     * @type {String}
     * @default ''
     */
    this.name = name || '';

    /**
     * 第一帧的帧数
     *
     * @property firstFrame
     * @type {Number}
     * @default 0
     */
    this.firstFrame = this.args[0] || 0;

    /**
     * 最后一帧的帧数
     *
     * @property lastFrame
     * @type {Number}
     * @default 0
     */
    this.lastFrame = this.args[1] || 0;

    /**
     * 下一动画名称
     *
     * @property nextAnimationName
     * @type {String}
     * @default ''
     */
    this.nextAnimationName = this.args[2];

    /**
     * 动画总帧数
     *
     * @property totalFrame
     * @type {Number}
     * @default 0
     */
    this.totalFrame = this.lastFrame - this.firstFrame + 1;

    /**
     * 动画当前定格的帧数，相对于动画本身
     *
     * @property ocFrame
     * @type {Number}
     * @default 0
     */
    this.ocFrame = 0;

    /**
     * 每帧动画的间隔数
     *
     * @property rate
     * @type {Number}
     * @default 100
     */
    this.rate = this.args[3] || 100;

}

U.method(SpriteAnimation, {
    /**
     * 设置下一动画
     *
     * @method setNextAnim
     * @return {this}
     */
    setNextAnim: function (anim) {
        this.nextAnimation = anim;
        return this;
    },
    getName: function () {
        return this.name.replace(/_gcount_[\d+]+/ig, '');
    }
});

module.exports = SpriteAnimation;


},{"./sprite-util":7}],3:[function(require,module,exports){
/**
 *
 * Sprite Matrix
 *
 * @author niko
 * @date 2014-07-27
 *
 */

function rad(deg) {
    return deg % 360 * PI / 180;
}

function deg(rad) {
    return rad * 180 / PI % 360;
}

var objectToString = Object.prototype.toString,
    Str = String,
    math = Math,
    PI = math.PI,
    E = "";

// Snap Matrix
// https://github.com/adobe-webplatform/Snap.svg/blob/master/src/matrix.js
function Matrix(a, b, c, d, e, f) {
    if (b == null && objectToString.call(a) == "[object SVGMatrix]") {
        this.a = a.a;
        this.b = a.b;
        this.c = a.c;
        this.d = a.d;
        this.e = a.e;
        this.f = a.f;
        return;
    }
    if (a != null) {
        this.a = +a;
        this.b = +b;
        this.c = +c;
        this.d = +d;
        this.e = +e;
        this.f = +f;
    } else {
        this.a = 1;
        this.b = 0;
        this.c = 0;
        this.d = 1;
        this.e = 0;
        this.f = 0;
    }
}
(function (matrixproto) {
    /*\
     * Matrix.add
     [ method ]
     **
     * Adds the given matrix to existing one
     - a (number)
     - b (number)
     - c (number)
     - d (number)
     - e (number)
     - f (number)
     * or
     - matrix (object) @Matrix
     \*/
    matrixproto.add = function (a, b, c, d, e, f) {
        var out = [
                [],
                [],
                []
            ],
            m = [
                [this.a, this.c, this.e],
                [this.b, this.d, this.f],
                [0, 0, 1]
            ],
            matrix = [
                [a, c, e],
                [b, d, f],
                [0, 0, 1]
            ],
            x, y, z, res;

        if (a && a instanceof Matrix) {
            matrix = [
                [a.a, a.c, a.e],
                [a.b, a.d, a.f],
                [0, 0, 1]
            ];
        }

        for (x = 0; x < 3; x++) {
            for (y = 0; y < 3; y++) {
                res = 0;
                for (z = 0; z < 3; z++) {
                    res += m[x][z] * matrix[z][y];
                }
                out[x][y] = res;
            }
        }
        this.a = out[0][0];
        this.b = out[1][0];
        this.c = out[0][1];
        this.d = out[1][1];
        this.e = out[0][2];
        this.f = out[1][2];
        return this;
    };
    /*\
     * Matrix.invert
     [ method ]
     **
     * Returns an inverted version of the matrix
     = (object) @Matrix
     \*/
    matrixproto.invert = function () {
        var me = this,
            x = me.a * me.d - me.b * me.c;
        return new Matrix(me.d / x, -me.b / x, -me.c / x, me.a / x, (me.c * me.f - me.d * me.e) / x, (me.b * me.e - me.a * me.f) / x);
    };
    /*\
     * Matrix.clone
     [ method ]
     **
     * Returns a copy of the matrix
     = (object) @Matrix
     \*/
    matrixproto.clone = function () {
        return new Matrix(this.a, this.b, this.c, this.d, this.e, this.f);
    };
    /*\
     * Matrix.translate
     [ method ]
     **
     * Translate the matrix
     - x (number) horizontal offset distance
     - y (number) vertical offset distance
     \*/
    matrixproto.translate = function (x, y) {
        return this.add(1, 0, 0, 1, x, y);
    };
    /*\
     * Matrix.scale
     [ method ]
     **
     * Scales the matrix
     - x (number) amount to be scaled, with `1` resulting in no change
     - y (number) #optional amount to scale along the vertical axis. (Otherwise `x` applies to both axes.)
     - cx (number) #optional horizontal origin point from which to scale
     - cy (number) #optional vertical origin point from which to scale
     * Default cx, cy is the middle point of the element.
     \*/
    matrixproto.scale = function (x, y, cx, cy) {
        y == null && (y = x);
        (cx || cy) && this.add(1, 0, 0, 1, cx, cy);
        this.add(x, 0, 0, y, 0, 0);
        (cx || cy) && this.add(1, 0, 0, 1, -cx, -cy);
        return this;
    };
    /*\
     * Matrix.rotate
     [ method ]
     **
     * Rotates the matrix
     - a (number) angle of rotation, in degrees
     - x (number) horizontal origin point from which to rotate
     - y (number) vertical origin point from which to rotate
     \*/
    matrixproto.rotate = function (a, x, y) {
        a = rad(a);
        x = x || 0;
        y = y || 0;
        var cos = +math.cos(a).toFixed(9),
            sin = +math.sin(a).toFixed(9);
        this.add(cos, sin, -sin, cos, x, y);
        return this.add(1, 0, 0, 1, -x, -y);
    };
    /*\
     * Matrix.x
     [ method ]
     **
     * Returns x coordinate for given point after transformation described by the matrix. See also @Matrix.y
     - x (number)
     - y (number)
     = (number) x
     \*/
    matrixproto.x = function (x, y) {
        return x * this.a + y * this.c + this.e;
    };
    /*\
     * Matrix.y
     [ method ]
     **
     * Returns y coordinate for given point after transformation described by the matrix. See also @Matrix.x
     - x (number)
     - y (number)
     = (number) y
     \*/
    matrixproto.y = function (x, y) {
        return x * this.b + y * this.d + this.f;
    };
    matrixproto.get = function (i) {
        return +this[Str.fromCharCode(97 + i)].toFixed(4);
    };
    matrixproto.toString = function () {
        return "matrix(" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)].join() + ")";
    };
    matrixproto.offset = function () {
        return [this.e.toFixed(4), this.f.toFixed(4)];
    };

    function norm(a) {
        return a[0] * a[0] + a[1] * a[1];
    }

    function normalize(a) {
        var mag = math.sqrt(norm(a));
        a[0] && (a[0] /= mag);
        a[1] && (a[1] /= mag);
    }

    /*\
     * Matrix.determinant
     [ method ]
     **
     * Finds determinant of the given matrix.
     = (number) determinant
     \*/
    matrixproto.determinant = function () {
        return this.a * this.d - this.b * this.c;
    };
    /*\
     * Matrix.split
     [ method ]
     **
     * Splits matrix into primitive transformations
     = (object) in format:
     o dx (number) translation by x
     o dy (number) translation by y
     o scalex (number) scale by x
     o scaley (number) scale by y
     o shear (number) shear
     o rotate (number) rotation in deg
     o isSimple (boolean) could it be represented via simple transformations
     \*/
    matrixproto.split = function () {
        var out = {};
        // translation
        out.dx = this.e;
        out.dy = this.f;

        // scale and shear
        var row = [
            [this.a, this.c],
            [this.b, this.d]
        ];
        out.scalex = math.sqrt(norm(row[0]));
        normalize(row[0]);

        out.shear = row[0][0] * row[1][0] + row[0][1] * row[1][1];
        row[1] = [row[1][0] - row[0][0] * out.shear, row[1][1] - row[0][1] * out.shear];

        out.scaley = math.sqrt(norm(row[1]));
        normalize(row[1]);
        out.shear /= out.scaley;

        if (this.determinant() < 0) {
            out.scalex = -out.scalex;
        }

        // rotation
        var sin = -row[0][1],
            cos = row[1][1];
        if (cos < 0) {
            out.rotate = deg(math.acos(cos));
            if (sin < 0) {
                out.rotate = 360 - out.rotate;
            }
        } else {
            out.rotate = deg(math.asin(sin));
        }

        out.isSimple = !+out.shear.toFixed(9) && (out.scalex.toFixed(9) == out.scaley.toFixed(9) || !out.rotate);
        out.isSuperSimple = !+out.shear.toFixed(9) && out.scalex.toFixed(9) == out.scaley.toFixed(9) && !out.rotate;
        out.noRotation = !+out.shear.toFixed(9) && !out.rotate;
        return out;
    };
    /*\
     * Matrix.toTransformString
     [ method ]
     **
     * Returns transform string that represents given matrix
     = (string) transform string
     \*/
    matrixproto.toTransformString = function (shorter) {
        var s = shorter || this.split();
        if (!+s.shear.toFixed(9)) {
            s.scalex = +s.scalex.toFixed(4);
            s.scaley = +s.scaley.toFixed(4);
            s.rotate = +s.rotate.toFixed(4);
            return (s.dx || s.dy ? "t" + [+s.dx.toFixed(4), +s.dy.toFixed(4)] : E) +
                (s.scalex != 1 || s.scaley != 1 ? "s" + [s.scalex, s.scaley, 0, 0] : E) +
                (s.rotate ? "r" + [+s.rotate.toFixed(4), 0, 0] : E);
        } else {
            return "m" + [this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5)];
        }
    };
})(Matrix.prototype);

module.exports = Matrix;


},{}],4:[function(require,module,exports){
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

    var o = this.ctx, result = '';

    //canvas
    if (/canvas/ig.test(toString.call(o))) {
        result = 'canvas';
        //snap & raphael
    } else if (o.node && /svg/ig.test(toString.call(o.node))) {
        result = 'snap';
        //dom
    } else if (/element/ig.test(toString.call(o))) {
        if (isSupportTransform) {
            result = 'dom-t';
        } else {
            result = 'dom';
        }
    } else {
        result = '';
    }

    if (this._isTexturePicker && result) {
        result += '-tp';
    }

    return result;

}

//渲染选择器
//每个渲染器复写 render 和 update 方法
//会在Sprite的调用这两个方法
var RenderMachine = {
    //Snap渲染器
    snap: function () {
        var offsetX,
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
        var pos,
            id,
            cp,
            cpStr;

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
        }

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
        }

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
    'dom-t-tp': function () {

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

},{"./sprite-transform":6,"./sprite-util":7}],5:[function(require,module,exports){
/**
 * a easy timeline manager
 * @version 1.4.1
 * @author dron
 *
 * Basic usage:
 *
 * // get a timeline instance.
 * // as long as you are willing, you can create an unlimited number of Timeline instance.
 * // but we don't suggest you to do so.
 * var timeline = Timeline.use( timelineKey ).init( ms ); // ms defaults to 1e3/60
 *
 * // create a task.
 * // you can create an unlimited number of task in the same timeline.
 * var task = timeline.createTask( {
 *   // start time, defaults to 0.
 *   start: ms,
 *   // duration of task, defaults to 0, if specify to -1, task will always run.
 *   duration: ms,
 *   // who all events call with.
 *   object: obj,
 *   // event listener, it will trigger when task start.
 *   onStart: fn,
 *   // event listener, it ongoing trigger after the start. argument 't' values range from 0 to duration.
 *   onUpdate: function( t ){},
 *   // event listener, it will trigger when task end.
 *   onEnd: fn,
 *   // event listener, it will trigger when task stop.
 *   onStop: fn
 * } );
 *
 * // stop a task, and trigger the 'stop' event.
 * task.stop();
 *
 * Advanced Usage:
 *
 * Timeline static functions:
 *
 * // for stopping all timeline instances, it can be used for making the game pause.
 * Timeline.stopAllTimer();
 * // start all timeline instances.
 * Timeline.startAllTimer();
 * // stop all tasks of all timeline instances.
 * Timeline.clearAllTasks();
 *
 * Timeline instance methods:
 *
 * // stop all tasks of a timeline instance.
 * timeline.clearTasks();
 * // create a task for delayed callback, it simulated window.setTimeout.
 * timeline.setTimeout( fn, time );
 * // stop a task for delayed callback.
 * timeline.clearTimeout( timer );
 */
//hack
if (!Function.prototype.bind) {
    Function.prototype.bind = function (ctx) {
        var fn = this;
        return function () {
            fn.apply(ctx, arguments);
        }
    }
}

var Timeline = (function () {

    var speed = 1;
    var blank = new Function;

    /**
     * ClassTask
     */

    var ClassTask = new Function;

    ClassTask.prototype.startAt = 0;
    ClassTask.prototype.duration = 0;
    ClassTask.prototype.object = null;
    ClassTask.prototype.startHandle = blank;
    ClassTask.prototype.updateHandle = blank;
    ClassTask.prototype.endHandle = blank;
    ClassTask.prototype.stopHandle = blank;
    ClassTask.prototype.started = false;
    ClassTask.prototype.stopped = false;

    ClassTask.prototype.handleStart = function (fn) {
        this.startHandle = fn.bind(this.object);
        return this;
    };

    ClassTask.prototype.handleUpdate = function (fn) {
        this.updateHandle = fn.bind(this.object);
        return this;
    };

    ClassTask.prototype.handleEnd = function (fn) {
        this.endHandle = fn.bind(this.object);
        return this;
    };

    ClassTask.prototype.handleStop = function (fn) {
        this.stopHandle = fn.bind(this.object);
        return this;
    };

    ClassTask.prototype.handleEndStop = function (fn) {
        this.endHandle = this.stopHandle = fn.bind(this.object);
        return this;
    };

    ClassTask.prototype.start = function () {
        this.startHandle();
        this.updateHandle(0);
        this.started = true;
    };

    ClassTask.prototype.update = function (time) {
        this.updateHandle(time);
    };

    ClassTask.prototype.stop = function () {
        this.stopHandle();
        this.stopped = true;
    };

    ClassTask.prototype.end = function () {
        this.updateHandle(this.duration);
        this.endHandle();
        this.stopped = true;
    };

    ClassTask.create = function () {
        return new this;
    };

    /**
     * ClassTimeline
     */

    var ClassTimeline = new Function;

    ClassTimeline.prototype.running = false;
    ClassTimeline.prototype.initTime = -1;
    ClassTimeline.prototype.intervalTime = 1e3 / 60;
    ClassTimeline.prototype.interval = -1;
    ClassTimeline.prototype.deductionTime = 0;
    ClassTimeline.prototype.tasks = null;
    ClassTimeline.prototype.addingTasks = null;
    ClassTimeline.prototype.adding = false;
    ClassTimeline.prototype.intervalFn = null;
    ClassTimeline.prototype.lastStopTime = -1;

    ClassTimeline.prototype.init = function (ms) {
        if (this.initTime < 0) {
            this.initTime = now();

            if (ms)
                this.intervalTime = ms;

            this.start();
        }

        return this;
    };

    /**
     * create a task
     * @param  {Object} conf  the config
     * @return {Task}       a task instance
     */
    ClassTimeline.prototype.createTask = function (conf) {
        var task = ClassTask.create(),
            f;

        if (conf.start)
            task.startAt = conf.start + now() - this.deductionTime;
        else
            task.startAt = now() - this.deductionTime;

        if (conf.duration == -1)
            task.duration = Infinity;
        else if (conf.duration)
            task.duration = conf.duration;

        if (conf.object)
            task.object = conf.object;

        if (f = conf.onStart || conf.onTimeStart)
            task.handleStart(f);

        if (f = conf.onUpdate || conf.onTimeUpdate)
            task.handleUpdate(f);

        if (f = conf.onEnd || conf.onTimeEnd)
            task.handleEnd(f);

        if (f = conf.onStop || conf.onTimeStop)
            task.handleStop(f);

        this.addingTasks.unshift(task);
        this.adding = true;

        return task;
    };

    /**
     * create a task for delayed callback
     * @param {Function} fn   callback function
     * @param {Number}   time   time, unit: ms
     */
    ClassTimeline.prototype.setTimeout = function (fn, time) {
        return this.createTask({
            start: time
        }).handleStart(fn);
    };

    /**
     * stop a timer for delayed callback
     * @param  {ClassTask} task task instance
     */
    ClassTimeline.prototype.clearTimeout = function (task) {
        task.stop();
    };

    /**
     * create a timer for ongoing callback
     * @deprecated
     * @param {Function} fn   callback function
     * @param {Number}   time   time, unit: ms
     */
    ClassTimeline.prototype.setInterval = function (fn, time) {
        // e.g. setInterval(fn, time);
        var timer = setInterval(fn, time);
        return {
            stop: function () {
                clearInterval(timer);
            }
        };
    };

    ClassTimeline.create = function () {
        var timeline = new this;

        timeline.tasks = [];
        timeline.addingTasks = [];

        timeline.intervalFn = function () {
            timeline.update(now());
        };

        return timeline;
    };

    ClassTimeline.prototype.start = function () {
        if (!this.running) {
            if (this.lastStopTime > 0) {
                this.deductionTime += now() - this.lastStopTime;
                this.lastStopTime = -1;
            }

            this.interval = setInterval(this.intervalFn, this.intervalTime);
            this.running = true;
        }
    };

    ClassTimeline.prototype.stop = function () {
        if (this.running) {
            clearInterval(this.interval);
            this.lastStopTime = now();
            this.running = false;
        }
    };

    ClassTimeline.prototype.clearTasks = function () {
        var tasks = this.tasks,
            addingTasks = this.addingTasks;

        for (var i = tasks.length - 1; i >= 0; i--)
            tasks[i].stop();

        tasks.length = 0;

        if (this.adding) {
            for (var i = addingTasks.length - 1; i >= 0; i--)
                addingTasks[i].stop();

            addingTasks.length = 0;
            this.adding = false;
        }
    };

    ClassTimeline.prototype.update = function (time) {
        var t, task;
        var tasks = this.tasks;
        var addingTasks = this.addingTasks;
        var i = tasks.length;

        time -= this.deductionTime;

        while (i--) {
            task = tasks[i];
            t = time - task.startAt;

            if (task.stopped) {
                tasks.splice(i, 1);
            } else if (t >= 0) {
                if (!task.started)
                    task.start();

                if (t < task.duration) {
                    task.update(t);
                } else {
                    task.end();
                    tasks.splice(i, 1);
                }
            }
        }

        if (addingTasks.length) {
            unshift.apply(tasks, addingTasks);
            addingTasks.length = 0;
        }
    };

    /**
     * exports
     */

    var exports = {};

    exports.caches = {};

    exports.use = function (name) {
        var timeline;

        if (timeline = exports.caches[name])
            return timeline;
        else
            return exports.caches[name] = ClassTimeline.create();
    };

    exports.stopAllTimer = function () {
        var caches = exports.caches;

        for (var name in caches)
            caches[name].stop();
    };

    exports.startAllTimer = function () {
        var caches = exports.caches;

        for (var name in caches)
            caches[name].start();
    };

    exports.clearAllTasks = function () {
        var caches = exports.caches;

        for (var name in caches)
            caches[name].clearTasks();
    };

    exports.registry = function (namespace) {
        namespace.Timeline = exports;
    };

    /**
     * @functions
     */

    var unshift = [].unshift;

    var now = function () {
        return new Date().getTime() * speed;
    };

    return exports;

})();

module.exports = Timeline;

},{}],6:[function(require,module,exports){
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

},{"./sprite-matrix":3}],7:[function(require,module,exports){
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

},{}]},{},[1]);
