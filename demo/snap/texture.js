var s = Snap('#dom-wrap');

var sister = new Sprite({
    ctx: s,
    res: {
        image: '../res/all.png',
        json: SPRITE_DATA
    },
    duration: 100
});

sister.play('power-cowherd-run', 5);

window.addEventListener('keyup', function (e) {
    //39 ->
    //37 <-
    //38 u
    //40 d
    switch (e.keyCode) {
        case 39:
            sister.play('normal-cowherd-run');
            break;
        case 37:
            sister.play('power-cowherd-run');
            break;
        case 38:
            sister.play('power-cowherd-jump');
            break;
        case 40:
            sister.play('normal-cowherd-dropdown');
            break;
        case 32:
            sister.play('normal-cowherd-dropdown', 2, function () {
                this.distroy();
            });
            break;
        default:
            sister.play('normal-cowherd-stand');
            break;
    }

});

requestAnimationFrame(function tick() {
    requestAnimationFrame(tick);

    sister.update();

});

