
var stage;
var circle;
var time = 0;

function init() {
    stage = new createjs.Stage("canvas");

    createjs.Ticker.addEventListener("tick", handleTick);
    createjs.Ticker.setFPS(40);

    window.addEventListener('resize', resize, false);

    resize();

    circle = new createjs.Shape();
    circle.x = stage.canvas.width/2;
    circle.y = stage.canvas.height/2;
    stage.addChild(circle);

    stage.mouseMoveOutside = true;
    stage.onMouseMove = function(evt) {
        console.log("stageX/Y: "+evt.stageX+","+evt.stageY); // always in bounds
        console.log("rawX/Y: "+evt.rawX+","+evt.rawY); // could be < 0, or > width/height
    }

    circle.graphics.beginFill("DeepSkyBlue");

    var w = stage.canvas.width/2;
    var h = stage.canvas.height/2;
    var pad = 30;
    var scl = 70;

    circle.graphics.drawRoundRect(pad-w,pad-h, w*2-pad*2, h*2-pad*2, 20);

    stage.addEventListener("stagemousemove", function(evt) {
         circle.x = w-(evt.stageX - w)/scl;
         circle.y = h-(evt.stageY - h)/scl;
    });

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

