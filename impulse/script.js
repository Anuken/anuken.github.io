var stage;
var w, h;
var ease;
var center;
var sclr = 1.0;
var sclg = 1.0;
var sclb = 1.0;
var scls = []
var tris = []
var dancer;
var bars = 32;
var filter;
var lastc;
var basec = {r: 115, g: 255, b: 180};

function init(){
    stage = new createjs.Stage("canvas");
    ease = createjs.Ease;

    createjs.Ticker.addEventListener("tick", tick);
    createjs.Ticker.setFPS(60);

    window.addEventListener('resize', resize, false);

    resize();
    setupFiles();
    setPrototypes();

    dancer = new Dancer();
    dancer.load(document.getElementsByTagName('audio')[0]);

    var size = 48/1.2;

    var color = 0x00FFFF;
	var alpha = 1;
	var blurX = 32;
	var blurY = 32;
	var strength = 1;
	var quality = 1;
	var inner = false;
	var knockout = false;
	filter = new createjs.GlowFilter(color, alpha, blurX, blurY, strength, quality, inner, knockout);

    for(side in [0, 1])
    for(index = 0; index < bars; index ++){
        (function(i, s){
        
        var tri = shape(135, 206, 250, function(){
            tri.x = w*s;
            tri.y = i*size + size/2;

            tri.graphics.clear();

            tri.fill();
            tri.graphics.drawRect(-size/2, -size/2, size, size);
        });

        tri.update();

        stage.addChild(tri);

        tris[i + s*bars] = tri;

        }(index, side));
    }

    setupDancer();

    addShapes();
}

function setupDancer(){

    for(i in [0, 1, 2, 3, 4])
    scls[i] = {r: 1.0, g: 1.0, b: 1.0}

    dancer.createKick({
      onKick: function(mag){
          stri(mag, 0.8, 110, 226, 255, 1.1, 1.0/1.1, 500, 0);

          var s = 50.0;

          //basec.r += Math.random()*s*2-s;
          //basec.g += Math.random()*s*2.0-s;
          //basec.b += Math.random()*s*2.0-s;
      },
      threshold: 0.6,
      frequency: [0, 15]
    }).on();

    dancer.createKick({
      onKick: function(mag){
          stri(mag, 4.0, 231, 245, 254, 0.3, 1/1.4, 440, 3);
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
    

    dancer.after(0, function(){
        center.scaleX = center.scaleY = 2.0 + 11*dancer.getFrequency(2, 9);
        var sc = 14;
        for(i = 0; i < bars*2; i ++){
            var index = i%bars;

            var t1 = tris[i];

            t1.scaleX =  1 + Math.pow(dancer.getFrequency(index*sc, (index+1)*sc)*120.0*(1+index/8.0), 1.1);
            
            var scl = dancer.getFrequency(index*sc, (index+1)*sc)*20.0*(1+index*1.0);

            var c = mix(scl, 135, 206, 250, basec.r, basec.g, basec.b);
            c = mix(index/bars*4, c.r, c.g, c.b, 70, 130, 250);

            if(i == 0)
            lastc = c;

            t1.r = c.r;
            t1.g = c.g;
            t1.b = c.b;

            t1.update();
        }
    });

    dancer.play();
}

function mix(scl, r1, g1, b1, r2, g2, b2){
    var s = 1.0-scl;
    return {r: r1*s+r2*scl, g: g1*s+g2*scl, b: b1*s+b2*scl};
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

        //tri.fill();
        var s = 1.5;

        tri.graphics.beginFill(tri.genColor(1.7-(lastc.r/255.0*2.0), 0.9+lastc.g/255.0, 2.0-(lastc.b/255.0*2.0)));

        tri.graphics.drawPolyStar(0, 0, 140, 3, 0, 180/6 + rot + 90);
    });

    //tri.filters = [filter];

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
        center.x = w/2;
        center.y = h/2;

        center.graphics.clear();

        center.fill();

        center.graphics.drawCircle(0, 0, 30);
    });

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

    shape.genColor = function(nr, ng, nb){
        return createjs.Graphics.getRGB(parseInt(nr*shape.r), parseInt(ng*shape.g), parseInt(nb*shape.b));
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

function setupFiles(){
    var dropbox;

    dropbox = document.getElementById("over");
    dropbox.addEventListener("dragenter", dragenter, false);
    dropbox.addEventListener("dragleave", dragexit, false);
    dropbox.addEventListener("dragexit", dragexit, false);
    dropbox.addEventListener("dragover", dragover, false);
    dropbox.addEventListener("drop", drop, false);
}

function handleFiles(files){
    var file = files[0];
    var reader = new FileReader();
    var audio = document.getElementById('audio');

    dancer.pause();
    audio.src = URL.createObjectURL(file);
    dancer.play();
}

function dragenter(e) {
  e.stopPropagation();
  e.preventDefault();

  unfade(document.getElementById("over"));
  unfade(document.getElementById("back"));
}

function dragexit(e) {
  fade(document.getElementById("back"));
  fade(document.getElementById("over"));
}

function dragover(e) {
  e.stopPropagation();
  e.preventDefault();
}

function drop(e) {
  e.stopPropagation();
  e.preventDefault();
  dragexit(e);
  var dt = e.dataTransfer;
  var files = dt.files;

  handleFiles(files);
}

function fade(element) {
    var op = 1;  // initial opacity
    var timer = setInterval(function () {
        if (op <= 0.01){
            element.style.opacity = 0;
            element.style.filter = 'alpha(opacity=0)';
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op -= op * 0.4;
    }, 50);
}

function unfade(element) {
    var op = 0.1;  // initial opacity
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.1;
    }, 10);
}