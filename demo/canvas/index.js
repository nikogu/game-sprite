var canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');

var img = new Image();
img.src = '../res/all.png';
img.onload = function () {

    init();

}

function init() {

    //Init the Sprite
    var sister = new Sprite({
        ctx: ctx,
        res: {
            image: img,
            json: SPRITE_DATA
        },
        duration: 100
    });

    //transform the Sprite
    sister.set({
        regX: 50,
        y: 200
    });

    //play
    sister.play('normal-cowherd-stand');

    //Sprite Timeline
    var tm = Sprite.Timeline.use('tm').init(1000 / 60);
    tm.createTask({
        duration: -1,
        onTimeStart: function () {

        },
        //简单的运动物体
        onTimeUpdate: function () {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            //in canvas render
            //update is necessary
            sister.update();

            switch (sister.status) {
                case 'run-left':
                    sister.set('x', sister.get('x') - 4);
                    break;
                case 'run-right':
                    sister.set('x', sister.get('x') + 4);
                    break;
                default:
                    break;
            }
        },
        onTimeEnd: function () {

        }
    });

    //Interaction
    window.addEventListener('keydown', function (e) {
        //39 ->
        //37 <-
        //38 u
        //40 d
        var x,
            y;

        switch (e.keyCode) {
            case 39:
                sister.status = 'run-right';
                if (sister.cAnim.name != 'normal-cowherd-run') {
                    sister.set('scaleX', 1);
                    sister.play('normal-cowherd-run');
                }
                break;
            case 37:
                sister.status = 'run-left';
                if (sister.cAnim.name != 'normal-cowherd-run') {
                    sister.set('scaleX', -1);
                    sister.play('normal-cowherd-run');
                }
                break;
            case 38:
                break;
            case 40:
                break;
            default:
                break;
        }

    });

    //Interaction
    window.addEventListener('keyup', function (e) {

        switch (e.keyCode) {
            case 39:
                sister.status = 'static';
                sister.play('normal-cowherd-stand');
                break;
            case 37:
                sister.status = 'static';
                sister.play('normal-cowherd-stand');
                break;
            case 38:
                break;
            case 40:
                break;
            default:
                break;
        }

    });
};

