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
      onKick: split,
      threshold: 0.2,
      frequency: [0, 10]
    });

    kick.on();

    var tris = []

    var bars = 18;
    var size = 48;

    for(side in [0, 1])
    for(index = 0; index < bars; index ++){
        (function(i, s){
        
        var tri = shape(135, 206, 250, function(){
            tri.graphics.clear();

            tri.fill();

            //tri.graphics.drawPolyStar(0, 0, 120, 3, 0, 180/6 + 90 - s*180);
            tri.graphics.drawRect(-size/2, -size/2, size, size);
        });


        tri.x = w*s;
        tri.y = i*size + size/2;

        tri.update();

        stage.addChild(tri);
        
        var skick = dancer.createKick({
            onKick: function(mag){
            //    createjs.Tween.removeTweens(tri);
            //    tween(tri).to({ scaleX: 1 + mag*100.0, scaleY: 1 + mag*100.0 }, 50, ease.getPowInOut(1.5));
            },
            threshold: 0.0,
            frequency: [i*16, (i+1)*16]
        });

        skick.on();

        tris[i + s*bars] = tri;

        }(index, side));
    }

    dancer.play();
    dancer.after(0, function(){
        center.scaleX = center.scaleY = 2.0 + 6*dancer.getFrequency(2, 9);
        for(i = 0; i < bars; i ++){
            tris[i].scaleX =  1 + dancer.getFrequency(i*16, i*16 + 16)*100.0;
            tris[i + bars].scaleX = 1 + dancer.getFrequency(i*16, i*16 + 16)*100.0;
        }
    });

    addShapes();
}

function split(mag){
    shapeKick(mag);
    shapeKick(-mag);
}

function shapeKick(mag){

    var rot = mag*180 - 90;

    var tri = shape(135, 206, 250, function(){
        tri.graphics.clear();

        tri.fill();

        tri.graphics.drawPolyStar(0, 0, 140, 3, 0, 180/6 + rot + 90);
    });

    tri.scaleX = tri.scaleY = 0.7 + Math.abs(mag)/2.0;

    tween(tri).shrink(300);

    tri.x = w/2 + Math.cos(Math.PI / 180 * rot) * 200;
    tri.y = h/2 + Math.sin(Math.PI / 180 * rot) * 200;

    tri.update();

    stage.addChild(tri);
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

        center.graphics.drawCircle(0, 0, 30);
    });

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