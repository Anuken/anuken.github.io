var stage;
var w, h;
var ease;
var center;

function init(){
    stage = new createjs.Stage("canvas");
    ease = createjs.Ease;

    createjs.Ticker.addEventListener("tick", tick);
    createjs.Ticker.setFPS(60);

    window.addEventListener('resize', resize, false);

    resize();

    setPrototypes();

    var dancer = new Dancer();
    var a = new Audio();
    dancer.load( document.getElementsByTagName('audio')[0] );

    var kick = dancer.createKick({
      onKick: shapeKick,
      threshold: 0.1,
      frequency: [0, 10]
    });

    kick.on();

    dancer.play();
    dancer.after(0, function(){
        center.scaleX = center.scaleY = 2.0 + 6*dancer.getFrequency(2, 9);
    });

    addShapes();
}

function shapeKick(mag){

    var rot = mag*100;

    var shape = shape(135, 206, 250, function(){
        shape.graphics.clear();

        shape.fill();

        shape.graphics.drawPolyStar(0, 0, 140, 3, 0, 180/6 + rot);
    });

    tween(shape).shrink(300);

    shape.x = w/2 + Math.cos(Math.PI / 180 * rot) * 200;
    shape.y = h/2 + Math.sin(Math.PI / 180 * rot) * 200;

    shape.update();

    stage.addChild(shape);
}

function setPrototypes(){
    createjs.Tween.prototype.shrink = function(time){
        this.to({ scaleX: 0, scaleY: 0 }, time, ease.getPowInOut(1.5));
    };

    createjs.Tween.prototype.fade = function(time){
        this.to({ scaleX: 0, scaleY: 0 }, time, ease.getPowInOut(1.5));
    };
}

function addShapes(){
    center = shape(135, 206, 250, function(){
        center.graphics.clear();

        center.fill();

        center.graphics.drawPolyStar(0, 0, 50, 3, 0, 180/6);
    });

    tween(center)
    .to({ scaleX: 2, scaleY: 2, r: 255}, 1000, ease.getPowInOut(1.5));

    center.x = w/2;
    center.y = h/2;

    stage.addChild(center);

    center.update();
}

function tween(shape, doloop){
    const t = createjs.Tween.get(shape, {loop: doloop == true});
    if(shape.update != undefined) t.addEventListener('change', shape.update);
    return t;
}

function shape(red, green, blue, updateFunction){
    const shape = new createjs.Shape();

    shape.r = red;
    shape.g = green;
    shape.b = blue;

    shape.modColor = function(){
        return createjs.Graphics.getRGB(parseInt(shape.r), parseInt(shape.g), parseInt(shape.b));
    }

    shape.fill = function(){
        shape.graphics.beginFill(shape.modColor());
    }

    shape.update = updateFunction;

    return shape;
}

function tick(){
    stage.update();
}

function resize() { 
    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;
    w = window.innerWidth;
    h = window.innerHeight;
}