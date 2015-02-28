var s = Snap('#dom-wrap');

var sister = new Sprite({
    ctx: s,
    res: 'http://gtms04.alicdn.com/tps/i4/TB11wd2FVXXXXcbXXXXo12dMVXX-6555-285.png',
    count: 23,
    width: 285,
    height: 285,
    row: 1,
    anim: {
        'runRight': [15, 22, 'runRight', 100],
        'static': [1, 1, 'static', -1],
        'jump': [0, 0, 'jump', 100],
        'falling': [2, 6, 'falling', 100],
        'runLeft': [7, 14, 'runLeft', 100]
    }
});

sister.play('static');

window.addEventListener('keyup', function (e) {
    switch (e.keyCode) {
        case 39:
            sister.play('runRight');
            break;
        case 37:
            sister.play('runLeft');
            break;
        case 38:
            sister.play('jump');
            break;
        case 40:
            sister.play('falling');
            break;
        case 32:
            sister.play('falling', 2);
            break;
        default:
            sister.play('static');
            break;
    }

});

requestAnimationFrame(function tick() {
    requestAnimationFrame(tick);

    sister.update();

});

