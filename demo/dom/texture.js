var Mike = new Sprite({
    ctx: document.getElementById('dom-sprite'),
    res: {
        image: '../res/open.png',
        json: SPRITE_DATA
    },
    spf: 100
});

Mike.run('open', -1);
