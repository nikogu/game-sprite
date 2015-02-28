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

