
var stage;
var background;
var center;
var time = 0;
var bcolor = "SteelBlue";
var incolor = "LightSkyBlue";
var title = "Welcome.";
var tabtext = ["things", "contact", "projects"];

function init() {
    stage = new createjs.Stage("canvas");

    stage.enableMouseOver();
    stage.mouseMoveOutside = true;

    createjs.Ticker.addEventListener("tick", handleTick);
    createjs.Ticker.addEventListener("tick", stage);
    createjs.Ticker.setFPS(40);

    window.addEventListener('resize', resize, false);

    resize();

    var w = stage.canvas.width/2;
    var h = stage.canvas.height/2;

    background = new createjs.Shape();
    stage.addChild(background);

    var titletext = new createjs.Text(title, "bold 30px Overpass Mono", "#e7f5fe");
    titletext.x = w;
    titletext.y = h*0.1;
    titletext.textAlign = "center";

    stage.addChild(titletext);

    background.graphics.beginFill(bcolor);

    var tsize = 40;
    var xscl = 1.73/2.1;
    var maxx = stage.canvas.width/(tsize*(xscl))+2;
    var maxy = stage.canvas.height/tsize;

    for(var x = 0; x < maxx; x ++){
        for(var y = -1; y < maxy; y ++){
            background.graphics.beginFill( createjs.Graphics.getHSL((1.3+x/maxx/2 + y/maxy/2)*120, 50+x/maxx*50, 25+y/maxy*25));
            background.graphics.drawPolyStar(x*(tsize*xscl) + ((y%2 == 0 && x%2==0) || (y%2 == 1 && x%2==1) ? 0 : -xscl*tsize), y*tsize*1.5 + (x % 2 == 0 ? tsize : 0), tsize, 3, 0, x%2 == 0 ? -180/6 : 180/6);
        }   
    }

    var pad = 30;
    var scl = 70;

    //circle.graphics.drawRoundRect(pad-w,pad-h, w*2-pad*2, h*2-pad*2, 20);



    background.graphics.beginFill(incolor);

    //circle.graphics.drawRoundRect(pad-w + pad, pad - h + pad, w*2-pad*4, pad*2, 20);

    //circle.graphics.drawCircle(0,0,100);

    var offset = 60;

    background.graphics.drawPolyStar(w, h-offset, 210, 3, 0, 180/6);

    background.cache(0, 0, w*2, h*2);

    center = newShape(135, 206, 250, function(){
        center.graphics.clear();

        center.fill();

        center.graphics.drawPolyStar(0, 0, 50, 3, 0, 180/6);
    });

    center.x = w;
    center.y = h-offset;
    center.rotation = 180;

    center.update();

    stage.addChild(center);
        
    var tabs = 3;
    var spacing = 210;
    var rad = 150;
    var smooth = 190;
    var containers = {};

    for(var i = 0; i < tabs; i ++){

        var ang = 2*Math.PI/tabs*i;

        const container = new createjs.Container();
        container.x = stage.canvas.width/2;
        container.y = stage.canvas.height/2 - offset;
        container.name = "tab" + i;

        const shape = newShape(135, 206, 250, function(){
            shape.graphics.clear();
            
            shape.fill();

            shape.graphics.drawPolyStar(0, 0, rad, 3, 0, -180/6);
        });

        shape.cursor = "pointer";
        shape.x = Math.sin(2*Math.PI/tabs*i)*spacing;
        shape.y = Math.cos(2*Math.PI/tabs*i)*spacing;

        shape.update();

        const index = i;

        shape.on("mouseover", function(evt){
            tween(container)
            .to({ scaleX: 1.1, scaleY: 1.1 }, smooth, createjs.Ease.getPowInOut(1.5));

            tween(shape)
            .to({ r: 255 }, smooth, createjs.Ease.getPowInOut(1.5));

            tween(center)
            .to({ r: 255, b: 250, rotation: 0, scaleX: 2, scaleY : 2}, smooth*1.5, createjs.Ease.getPowInOut(1.5));
        });

        shape.on("mouseout", function(evt){
            createjs.Tween.removeTweens(container);
            createjs.Tween.removeTweens(center);

            tween(container)
            .to({ scaleX: 1, scaleY: 1 }, smooth/1.5, createjs.Ease.getPowInOut(1.5));

            tween(shape)
            .to({ r: 135 }, smooth, createjs.Ease.getPowInOut(1.5));

            tween(center)
            .to({ r: 135, b: 250, rotation: 180, scaleX: 1, scaleY : 1}, smooth*1.5, createjs.Ease.getPowInOut(1.5));
        });

        container.addChild(shape);
        stage.addChild(container);

        const text = new createjs.Text(tabtext[i], "bold 20px Overpass Mono", "#e7f5fe");
        text.x = Math.sin(ang)*spacing;
        text.y = Math.cos(ang)*spacing - 20;
        text.textAlign = "center";

        container.addChild(text);
    }

    stage.update();
}

function tween(shape){
    const t = createjs.Tween.get(shape);
    if(shape.update != undefined)
    t.addEventListener('change', shape.update);
    return t;
}

function newShape(red, green, blue, updateFunction){
    const shape = new createjs.Shape();

    shape.r = red;
    shape.g = green;
    shape.b = blue;

    shape.modColor = function(){
        return createjs.Graphics.getRGB( 
        parseInt(shape.r), 
        parseInt(shape.g), 
        parseInt(shape.b), 
        1);
    }

    shape.fill = function(){
        shape.graphics.beginFill(shape.modColor());
    }

    shape.update = updateFunction;

    return shape;
}

function handleTick() {
    time ++;

    /*
    circle.graphics.clear();
    circle.graphics.beginFill("DeepSkyBlue");

    var w = stage.canvas.width/2;
    var h = stage.canvas.height/2;
    var pad = 30 + Math.sin(time/20.0)*6.0;

    circle.graphics.drawRoundRect(pad-w,pad-h, w*2-pad*2, h*2-pad*2, 20);
    */

    //circle.graphics.beginFill("White");

    //circle.graphics.moveTo(0,0);
    //circle.graphics.quadraticCurveTo(0,  200,  200,  200);

    //circle.graphics.drawPolyStar(0, 0, 70, 5, 2, 0);

    stage.update();
}

function resize() { 
    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;
}

function openTab(name) {
    var i;
    var x = document.getElementsByClassName("tab");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none"; 
    }
    document.getElementById(name).style.display = "block"; 
}

