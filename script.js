
var stage;
var circle;
var time = 0;
var bcolor = "SteelBlue";
var incolor = "LightSkyBlue";

function init() {
    stage = new createjs.Stage("canvas");

    stage.enableMouseOver();

    createjs.Ticker.addEventListener("tick", handleTick);
    createjs.Ticker.addEventListener("tick", stage);
    createjs.Ticker.setFPS(40);

    window.addEventListener('resize', resize, false);

    resize();

    circle = new createjs.Shape();
    circle.x = stage.canvas.width/2;
    circle.y = stage.canvas.height/2;
    stage.addChild(circle);

    stage.mouseMoveOutside = true;

    circle.graphics.beginFill(bcolor);

    var w = stage.canvas.width/2;
    var h = stage.canvas.height/2;
    var pad = 30;
    var scl = 70;

    circle.graphics.drawRoundRect(pad-w,pad-h, w*2-pad*2, h*2-pad*2, 20);

    circle.graphics.beginFill(incolor);

    //circle.graphics.drawRoundRect(pad-w + pad, pad - h + pad, w*2-pad*4, pad*2, 20);

    //circle.graphics.drawCircle(0,0,100);

    var offset = 60;

    circle.graphics.drawPolyStar(0, -offset, 210, 3, 0, 180/6);
        

    var tabs = 3;
    var spacing = 210;
    var rad = 150;
    var smooth = 190;
    var containers = {};

    for(var i = 0; i < tabs; i ++){

        var ang = 2*Math.PI/tabs*i;

        var container = new createjs.Container();

        var shape = new createjs.Shape();
        container.x = stage.canvas.width/2;
        container.y = stage.canvas.height/2 - offset;
        shape.graphics.beginFill(incolor);
        //hex.graphics.drawCircle(Math.sin(ang)*spacing, Math.cos(ang)*spacing, rad); //drawPolyStar ( x  y  radius  sides  pointSize  angle )
        
        shape.graphics.drawPolyStar(Math.sin(2*Math.PI/tabs*i)*spacing, Math.cos(2*Math.PI/tabs*i)*spacing, rad, 3, 0, -180/6);

        const index = i;

        shape.on("mouseover", function(evt){
            createjs.Tween.get(containers[index].acontainer)
            .to({ scaleX: 1.1, scaleY: 1.1 }, smooth, createjs.Ease.getPowInOut(1.5))
            .to({ scaleX: 1.1, scaleY: 1.1 }, smooth, createjs.Ease.getPowInOut(1.5));
        });

        shape.on("mouseout", function(evt){
            createjs.Tween.removeTweens(containers[index].acontainer);

            createjs.Tween.get(containers[index].acontainer)
            .to({ scaleX: 1, scaleY: 1 }, smooth/1.5, createjs.Ease.getPowInOut(1.5));
        });

        container.addChild(shape);
        stage.addChild(container);

        var text = new createjs.Text("something", "bold 20px Overpass", "#e7f5fe");
        text.x = Math.sin(ang)*spacing + shape.x;
        text.y = Math.cos(ang)*spacing + shape.y - 20;
        text.textAlign = "center";

        container.addChild(text);

        containers[i] = {acontainer: container, atext: text, ashape: shape};
    }

    stage.update();
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

