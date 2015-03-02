# Game Sprite

The professional library for sprite of javascript.

[HOME PAGE](http://nikogu.github.io/game-sprite)

## Feature

- Easy to use

- Small -> 21kb

- Support [TexturePacker](https://www.codeandweb.com/texturepacker) tool

- Multiple render support
    - DOM Support
    - CANVAS Support
    - SVG [snapsvg.js](http://snapsvg.io/) Support

#Compatibility

| Render Context  |      IE      |  Chrome |  Safari | FireFox |
|-----------------|:------------:|--------:|--------:|--------:|
|       DOM       | 6+(no transform support)  9+(all functional)     |    *    |    *    |    *    |
|     CANVAS      |      9+      |    *    |    *    |    *    |
| SVG(snapsvg.js) |      9+      |    *    |    *    |    *    |

## How to use

### 1: Import

	<script src="./game-sprite.min.js"></script>

	//use
	var mySprite = new Sprite({...});

### 2：Setting render context

GameSprite Support Canvas、DOM、SnapSVG, you need tell GameSprite which one you need.
    
    //DOM: the dom which as sprite's container
    //Snap: Snap paper
    //Canvas: canvas.getContext('2d')
    var sister = new Sprite({
        ctx: 'set the render context here'
    });
    
### 3：Setting Sprite data resource
    
GameSprite Support 2 kind of data resource

- The image that every frames is in same size, ex：[image](http://gtms04.alicdn.com/tps/i4/TB11wd2FVXXXXcbXXXXo12dMVXX-6555-285.png)
- TexturePacker Tool, ex：[image](http://gtms03.alicdn.com/tps/i3/TB1nLrDFVXXXXaNXFXXrhejFFXX-1924-1022.png) [data](https://github.com/nikogu/game-sprite/blob/master/demo/res/data.js)

We recommend use the [TexturePacker](https://www.codeandweb.com/texturepacker) Tool.

### 4: Creating Sprite Instance

#### No TexturePacker tool
	var sister = new Sprite({
	    //dom render example
	    //render context
        ctx: document.getElementById('sprite-container'),

		//image url
		//if in canvas render context, here is the image object(new Image());
		res: 'http://gtms04.alicdn.com/tps/i4/TB11wd2FVXXXXcbXXXXo12dMVXX-6555-285.png',

		//total frame count
		count: 23,

		//every frame size
		width: 285,
		height: 285,

		//the resource image is multi row?
		row: 1,

		//default 100
		spf: 50,

		//setting the animation[beginFrame, endFrame]
		anim: {
			'runRight': [15, 22],
			'runLeft': [7, 14],
			'static': [1],
			'jump': [0],
			'falling': [2, 6]
		}
	});
	
#### Using TexturePacker tool

	var girl = new Sprite({
        ctx: document.getElementById('dom-sprite'),
		res: {
			image: '../res/gril.png',
			json: SPRITE_DATA
		}
	});

When you using the TexturePacker, the rule of animation is the image's name.

For example, if you have 5 picture for running animation, before you drag them into TexturePacker, you need name them like: run-0.png run-1.png...run-4.png。

### 5: Running Sprite Animation

    //run-left is the name of animation
    sister.run('run-left');
  
    //when you want to switch the animation, just run
    sister.run('jump');

    //if you want to run a series of animation
    sister.run(['run-left', 'run-right', 'jump', 'run-left', 'jump']);
    
    //you can set the count that animation play
    sister.run('run-left', 4, function(){
        //do something
    });
    
    //if first argument is number, it means the spf of this animation
    sister.run(20, 'run-left');

if you have the timer ticker

    //you can use play, ‘play’ method do not running a timer auto
    sister.play('run-left');

    //custom ticker
    requestAnimationFrame(function tick() {
        //to update the sprite's frames
        sister.update();
        requestAnimationFrame(tick);
    });

In a general way, in canvas render context, we recommend replace play+update for run method, because you need 'ctx.clearRect'.

### The difference between play and run
Sprite is running frame one to one, so it need timer ticker.

Run method will setting a timer by default.

But in some condition, you need play and manual updating.

## API

**run(name [,count] [,callback])**

- name
    - [String] default animation
    - [Array] a series of animation
    - [Number] spf of animation
    
- count [optional]
	- [Number] the iteration count of animation
	- [Function] callback

- callback [Function] [optional]
    
**play(name [,count] [,callback])** just like run, but no timer ticker

**draw(name [, crender])**

- name [String] animation name
- crender [Function] [optional] custom render function

**destroy**

**start** start the animation

**pause** pause the animation

**update** update frames of animation

**stop** stop the sprite's timer

## Property
**cFrame**: current frame

**cAnim**: current animation object
- getName() get animation's name

**rowNum**:

**row**:

**ctx**: render context

**view**: the view of sprite

## Using TexturePacker
[TexturePacker](http://www.codeandweb.com/texturepacker/)
`JSON HASH Type`

### 1: Download TexturePacker

google...

### 2: Splice images

TexturePacker using the image's name for json's key, so if you want to create a animation for running,
you need named images like: girl-run-0.png girl-run-1.png girl-run-2.png, and then:

	var girl = new Sprite({
        ctx: document.getElementById('dom-sprite'),
		res: {
			//the TexturePacker's image
			image: '../res/gril.png',
			//the TexturePacker's data
			json: SPRITE_DATA
		},
		sfp: 50
	});

    //the order is 0-1-2
	girl.run('girl-run');

**IMPORTANT** the name must not has "." & must begin from "0".

if you only has one frame, you can name 'girl-run.png',  not necessary 'girl-run-0.png'.

## Advanced
###	custom render function

	sprite.draw('custom render context',

	function(){

		this._render = function(){};
		this._update = function(){};

	});

    //for example
    //dom render
    //this._render = domRender;
    function domRender() {

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

            s.backgroundImage = 'url("' + this.res + '")';
            s.backgroundRepeat = 'no-repeat';

            setPos.call(this);

            this.ctx.appendChild(this.view);

        };

        this._update = function () {
            setPos.call(this);
        };

    }

## ISSUE
If you have any questions with GameSprite, [Just open an issue](https://github.com/nikogu/game-sprite/issues).
