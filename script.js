
var stage;
var background;
var foreground;
var sides;
var center;
var time = 0;
var bcolor = "SteelBlue";
var incolor = "LightSkyBlue";
var title = "Title";
var font = "Ubuntu";
var tabtext = ["things", "contact", "projects"];
var shadow;

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

    var titletext = new createjs.Text(title, "bold 34px " + font, "coral");
    titletext.x = w;
    titletext.y = h*0.07;
    titletext.textAlign = "center";

    stage.addChild(titletext);

    background.update = function(){
        var tsize = 100;
        var xscl = 1.73/2.02;
        var maxx = stage.canvas.width/(tsize*(xscl))+3;
        var maxy = stage.canvas.height/tsize;

        background.graphics.clear();

        for(var x = 0; x < maxx; x ++){
            for(var y = -1; y < maxy; y ++){
                //if(maxy-4-y > Math.sin(time/10 + x)*2+1) continue;
                    
                
                background.graphics.beginFill(
                     createjs.Graphics.getHSL(
                         (1.2+x/maxx/2 + y/maxy/2)*120 + Math.sin(time/20 + x/10 + y/20)*12+Math.cos(time/10+3)*9 + Math.sin(x/2+time/20)*18+Math.cos(y+time/25)*8,
                         50+x/maxx*50, 
                         20+(y/maxy)*25)
                         );

                background.graphics.drawPolyStar(-50+x*(tsize*xscl) + ((y%2 == 0 && x%2==0) || (y%2 == 1 && x%2==1) ? 0 : -xscl*tsize), y*tsize*1.5 + (x % 2 == 0 ? tsize : 0), tsize, 3, 0, x%2 == 0 ? -180/6 : 180/6);
            }   
        }

        background.updateCache();
    }
    
    background.cache(0, 0, w*2, h*2);

    background.update();

    var offset = 50;
    

    //background.graphics.drawPolyStar(0, 0, 300, 5, 0, -180/10);

    //tween(background, true)
    //.to({scaleX: 1.1, scaleY: 1.1}, 3000, createjs.Ease.getPowInOut(2))
    //.to({scaleX: 1, scaleY: 1}, 3000, createjs.Ease.getPowInOut(2));

    var bcontainer = new createjs.Container();
    bcontainer.x = w;
    bcontainer.y = h-offset;

    stage.addChild(bcontainer);

    var bshape = new createjs.Shape();
    bshape.graphics.beginFill(bcolor);
    bshape.graphics.drawPolyStar(0, 0, 270, 5, 0, -180/10);
    bcontainer.addChild(bshape);

    tween(bcontainer, true)
    .to({scaleX: 1.09, scaleY: 1.09, rotation: 0}, 6000, createjs.Ease.getPowInOut(2))
    .to({scaleX: 1, scaleY: 1, rotation: 0}, 6000, createjs.Ease.getPowInOut(2));

    var sides = 5;
    var bspace = 280;
    var brad = 110;

    for(var i = 0; i < sides; i ++){

        const index = i;

        const shape = newShape(70, 130, 180, function(){
            shape.graphics.clear();
            
            shape.fill();

            shape.graphics.drawPolyStar(0, 0, brad, 3, 0, -180/6-(360/sides)*index);
        });

        shape.x = Math.sin(2*Math.PI/sides*i)*bspace;
        shape.y = Math.cos(2*Math.PI/sides*i)*bspace;

        bcontainer.addChild(shape);

        shape.update();
    }

    var pad = 30;
    var scl = 70;

    //circle.graphics.drawRoundRect(pad-w,pad-h, w*2-pad*2, h*2-pad*2, 20);

    foreground = new createjs.Shape();

        
    

    stage.addChild(foreground);

    foreground.graphics.beginFill(incolor);

    foreground.graphics.drawPolyStar(w, h-offset, 210, 3, 0, 180/6);

    foreground.cache(0, 0, w*2, h*2);
    
    shadow = new createjs.Shadow("#111111", 0, 0, 40);

    sides = newShape(255, 255, 255, function(){
        var edgespacing = 300;
        var edgerad = 250;

        edgespacing = h*2/Math.floor(h*2/edgespacing);

        sides.graphics.beginFill(incolor);

        for(var i = 0; i < h*2/edgespacing+1; i ++){
            sides.graphics.drawPolyStar(w+100, i*edgespacing-h, edgerad, 6, 0, 180/6-90);
            sides.graphics.drawPolyStar(-100-w, +i*edgespacing-h, edgerad, 6, 0, 180/6+90);
        }
    });
    
    sides.x = w;
    sides.y = h;

    stage.addChild(sides);

    
    sides.on("mouseover", function(evt){

        tween(sides)
        .to({ scaleX: 1.1, scaleY: 1.1 }, 500, createjs.Ease.getPowInOut(1.5));
    });

    sides.on("mouseout", function(evt){
        createjs.Tween.removeTweens(sides);

        tween(sides)
        .to({ scaleX: 1, scaleY: 1 }, 500, createjs.Ease.getPowInOut(1.5));
    });

    sides.update();

    sides.cache(-w, -h, w*2, h*2);

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
        //shape.shadow = shadow;

        shape.update();

        const index = i;

        shape.on("mouseover", function(evt){
            createjs.Tween.removeTweens(center);

            tween(container)
            .to({ scaleX: 1.1, scaleY: 1.1 }, smooth, createjs.Ease.getPowInOut(1.5));

            tween(shape)
            .to({ r: 255, g: 127, b: 80 }, smooth, createjs.Ease.getPowInOut(1.5));

            tween(center)
            .to({ r: 255, g: 127, b: 80,  scaleX: 2, scaleY : 2, rotation: 0}, smooth*1.5, createjs.Ease.getPowInOut(1.5));
        });

        shape.on("mouseout", function(evt){
            createjs.Tween.removeTweens(container);
            createjs.Tween.removeTweens(center);

            tween(container)
            .to({ scaleX: 1, scaleY: 1 }, smooth/1.5, createjs.Ease.getPowInOut(1.5));

            tween(shape)
            .to({ r: 135, g: 206, b: 250 }, smooth, createjs.Ease.getPowInOut(1.5));

            tween(center)
            .to({ r: 135, g: 206, b: 250,  scaleX: 1, scaleY : 1, rotation: 180}, smooth*1.5, createjs.Ease.getPowInOut(1.5));
        });

        shape.on("click", function(event){
            window.location.href = tabtext[index] + ".html";
        });

        container.addChild(shape);
        stage.addChild(container);

        const text = new createjs.Text(tabtext[i], "bold 20px " + font, "#FFF8DC");
        text.x = Math.sin(ang)*spacing;
        text.y = Math.cos(ang)*spacing - 20;
        text.textAlign = "center";

        container.addChild(text);
    }

    stage.update();
}

function tween(shape, doloop = false){
    const t = createjs.Tween.get(shape, {loop: doloop});
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

    background.update();

    stage.update();
}

function resize() { 
    stage.canvas.width = window.innerWidth;
    stage.canvas.height = window.innerHeight;
}

