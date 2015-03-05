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
