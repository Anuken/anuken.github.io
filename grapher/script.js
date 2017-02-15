
var graphics;
var stage;
var offsetx = 300;
var offsety = 300;
var max = Math.PI*10;
var step = 0.01;
var scale = 100;
var dtime = 0;
var textarea;
var form;
var formfunc;

function init() {
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
 		scale = 20;
	}
	
    stage = new createjs.Stage("canvas");
    
    canvas.style.backgroundColor = document.body.style.backgroundColor;

    textarea = document.getElementById("formarea");

    textarea.onkeydown = textChange;
    textarea.onkeyup = textChange;

    form = textarea.value;
    formfunc = math.compile(form);

    window.addEventListener('resize', resize, false);

    var line = new createjs.Shape();

    stage.addChild(line);
    graphics = line.graphics;

    createjs.Ticker.setFPS(60);
    if (!createjs.Ticker.hasEventListener("tick")) { 
        createjs.Ticker.addEventListener("tick", doTick);
    };

    updateTextColors();

    resize();

    render();
}

function textChange(){
    textarea.value = textarea.value.replace(/[\r\n\v]+/g, '');
    try {
        form = textarea.value;
        var out = math.compile(form);
        out.eval({ang: 0, time: 0})
        formfunc = out;
        document.getElementById("cover").style.borderBottomColor = "#afceff";
    }catch (e){
        document.getElementById("cover").style.borderBottomColor = "#ff4e32";
    }

    updateTextColors();
}

function updateTextColors(){
    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };

    var text = textarea;
    var str = text.value,

    map = {'ang': "#ff6d85", 'time': "#97e59c", 'sin': "#fcad2d", 'cos': "#fcad2d", 'tan': "#fcad2d", 
    'sec': "#fcad2d", 'csc': "#fcad2d", 'cot': "#fcad2d"};

    var reg = "";

    for(var value in map){
        reg += value + "|";
    }

    reg = "/" + reg;
    reg = reg.substring(0, reg.length-1) + "/ig";

    var toStr = String(reg);
    var color = (toStr.replace('\/g', '|')).substring(1);

    var colors = color.split("|");

    for(var value in map){
        str = str.replaceAll(value, '<span style="color:'+map[value]+';">'+value+'</span>');
    }

    document.getElementById("cover").innerHTML = str;
}

function resize() { 
    stage.canvas.width = window.innerWidth-16;
    stage.canvas.height = window.innerHeight - 50;
    offsetx = stage.canvas.width/2;
    offsety = stage.canvas.height/2;
}

function doTick(){
    dtime ++;
    render();   
}

function render(){
    graphics.clear();

    graphics.setStrokeStyle(1).beginStroke("rgb(255, 255, 255)");

    var last = -999999999;
	for(var a = -0.1; a < max; a += step){
		var r = formula(a);
			
		if(last < -99999){
			last = r;
			continue;
		}
			
		draw(r,last,a);
			
		last = r;
	}

    graphics.endStroke();

    stage.update();
}

function draw(r1, r2, a){
		
	x1 = (r2*scale*Math.cos(a-step))+offsetx;
	y1 = (r2*scale*Math.sin(a-step))+offsety;
	x2 = (r1*scale*Math.cos(a))+offsetx;
	y2 = (r1*scale*Math.sin(a))+offsety;
	
    graphics.moveTo(x1, y1);
	graphics.lineTo(x2, y2);
}

function formula(angle){
	return formfunc.eval({ang: angle, time: dtime});
}
