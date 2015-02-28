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
