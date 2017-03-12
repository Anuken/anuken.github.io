var stage;
var w, h;
var ease;
var center;
var sclr = 1.0;
var sclg = 1.0;
var sclb = 1.0;
var scls = []

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
    dancer.load( document.getElementsByTagName('audio')[0]);

    for(i in [0, 1, 2])
    scls[i] = {r: 1.0, g: 1.0, b: 1.0}

    
    
   

    

    dancer.createKick({
      onKick: function(mag){
          stri(mag, 4.0, 231, 245, 254, 0.3, 1/1.4, 440, 2);
      },
      threshold: 0.06,
      frequency: [10, 40]
    }).on();

    dancer.createKick({
      onKick: function(mag){
          stri(mag, 4.0, 255, 127, 80, 0.5, 1.0, 340, 2);
      },
      threshold: 0.06,
      frequency: [10, 25]
    }).on();

    dancer.createKick({
      onKick: function(mag){
          stri(mag, 3.0, 255, 206, 250, 0.5, 1.0, 300, 1);
      },
      threshold: 0.06,
      frequency: [5, 30]
    }).on();

    dancer.createKick({
      onKick: function(mag){
          stri(mag, 1, 135, 206, 250, 0.7, 1.0/1.1, 200, 0);
      },
      threshold: 0.2,
      frequency: [0, 15]
    }).on();
    

    var tris = []

    var bars = 18;
    var size = 48;

    for(side in [0, 1])
    for(index = 0; index < bars; index ++){
        (function(i, s){
        
        var tri = shape(135, 206, 250, function(){
            tri.graphics.clear();

            tri.fill();
            tri.graphics.drawRect(-size/2, -size/2, size, size);
        });


        tri.x = w*s;
        tri.y = i*size + size/2;

        tri.update();

        stage.addChild(tri);

        tris[i + s*bars] = tri;

        }(index, side));
    }

    dancer.play();
    dancer.after(0, function(){
        center.scaleX = center.scaleY = 2.0 + 11*dancer.getFrequency(2, 9);
        for(i = 0; i < bars; i ++){
            tris[i].scaleX =  1 + Math.pow(dancer.getFrequency(i*16, i*16 + 16)*120.0, 1.1);
            tris[i + bars].scaleX = tris[i].scaleX;
        }
    });

    addShapes();
}

function stri(mag, rotscl, r, g, b, scloffset, sclscl, length, index){
    tri(mag, rotscl, r, g, b, scloffset, sclscl, length, index);
    tri(-mag, rotscl, r, g, b, scloffset, sclscl, length, index);

    /*
    if(Math.random() < 0.5){
        scls[index].r = Math.random()*1.2+0.2;
        scls[index].b = Math.random()*1.2+0.2;
        scls[index].r = Math.random()*1.2+0.2;
    }
    */
}

function tri(mag, rotscl, r, g, b, scloffset, sclscl, length, index){
    var scl = 180*rotscl;
    var rot = mag*scl + 90;

    var tri = shape(r*scls[index].r, g*scls[index].g, b*scls[index].b, function(){
        tri.graphics.clear();

        tri.fill();

        tri.graphics.drawPolyStar(0, 0, 140, 3, 0, 180/6 + rot + 90);
    });

    tri.scaleX = tri.scaleY = scloffset + Math.abs(mag)*sclscl;

    tween(tri).shrink(270);

    tri.x = w/2 + Math.cos(Math.PI / 180 * rot) * length;
    tri.y = h/2 + Math.sin(Math.PI / 180 * rot) * length;

    tri.update();

    stage.addChild(tri);
}

function shapeKick3(mag){

    var scl = 180*4;
    var rot = mag*scl + 90;

    var tri = shape(135, 206, 250, function(){
        tri.graphics.clear();

        tri.fill();

        tri.graphics.drawPolyStar(0, 0, 140, 3, 0, 180/6 + rot + 90);
    });

    tri.scaleX = tri.scaleY = 0.5 + Math.abs(mag);

    tween(tri).shrink(270);

    tri.x = w/2 + Math.cos(Math.PI / 180 * rot) * 340;
    tri.y = h/2 + Math.sin(Math.PI / 180 * rot) * 340;

    tri.update();

    stage.addChild(tri);
}

function shapeKick2(mag){

    var scl = 180*3;
    var rot = mag*scl + 90;

    var tri = shape(255, 206, 250, function(){
        tri.graphics.clear();

        tri.fill();

        tri.graphics.drawPolyStar(0, 0, 140, 3, 0, 180/6 + rot + 90);
    });

    tri.scaleX = tri.scaleY = 0.5 + Math.abs(mag);

    tween(tri).shrink(270);

    tri.x = w/2 + Math.cos(Math.PI / 180 * rot) * 300;
    tri.y = h/2 + Math.sin(Math.PI / 180 * rot) * 300;

    tri.update();

    stage.addChild(tri);
}

function setPrototypes(){
    Number.prototype.clamp = function() {
        return Math.min(Math.max(this, 0.1), 1.0);
    };

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
    center.update();
}

function resize() { 
    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;
    w = window.innerWidth;
    h = window.innerHeight;
}