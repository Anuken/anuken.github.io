/*

var canvas = document.createElement('canvas');
var width = window.innerWidth;
var height = window.innerHeight;

canvas.width = width;
canvas.height = height;

var context = canvas.getContext('2d');
*/

var width = window.innerWidth;
var height = window.innerHeight;
var renderer = new PIXI.autoDetectRenderer(width, height);
document.body.appendChild(renderer.view);

var stage = new PIXI.Container();

var size = 200;

var scale = 2.0;
var scale2 = 1200.0;
var scale3 = 4.7;
var scale4 = 0.0;

var canvas = document.createElement('canvas');
canvas.width = canvas.height = size;

var context = canvas.getContext('2d');

var percision = 0.00001;
var colors = [];
var logs = [];
var sines = [];
var cosines = [];

for(i = 0; i < size; i++)
	logs[i] = Math.log(i);

for(i = 0; i < Math.PI*2.0; i += percision){
    sines[Math.floor(i/percision)] = Math.sin(i);
    cosines[Math.floor(i/percision)] = Math.cos(i);
}


var e = 40;

for(x = 0; x < size; x ++){
    for(y = 0; y < size; y ++){
        colors[y*size + x] = x < e || y < e || x > size-e || y > size-e  ? 0 : rgb(255, 255, 255);
    }
}


var id = context.createImageData(1,1);
var d  = id.data;
d[3] = 255;

//updateTex();

//drawTex();

var canvasTex = PIXI.Texture.fromCanvas(canvas);

var logo = new PIXI.Sprite(canvasTex);
logo.x = width / 2;
logo.y = height / 2;
logo.width = 420;
logo.height = 420;
logo.anchor.set(0.5);
stage.addChild(logo);

function animate() {

    updateTex();
    drawTex();

    canvasTex.update();

    renderer.render(stage);

    requestAnimationFrame(animate);
}

animate();

function setPixel(x,y,c) {
    var p=id;
    p.data[0]=c.r;
    p.data[1]=c.g;
    p.data[2]=c.b;
    p.data[3]=255;
    context.putImageData(p,x,y);
}

function sin(v){
    return sines[Math.floor(v/percision) % sines.length];
}

function cos(v){
    return cosines[Math.floor(v/percision) % cosines.length];
}

function drawTex(){
    //context.clearRect(0, 0, canvas.width, canvas.height);
    for(x = 0; x < size; x ++){
        for(y = 0; y < size; y ++){
            setrgb(colors[y*size + x]);
            context.putImageData(id, x, y);
        }
    } 
}

function updateTex(){

	for(x = 0; x < size; x++){
		for(y = 0; y < size; y++){

			pix = colors[y*size + x];

			if(pix != 0){
                
				var randx = Math.floor((cos(y * scale2 + logs[y] * scale3 + scale4)) * scale),
						randy =  Math.floor((cos(x * scale2 + logs[x] * scale3 + scale4)) * scale);
                
                if(!(x + randx >= size) && !(x + randx < 0) && !(y + randy >= size) && !(y + randy < 0) && colors[(y+randy)*size+randx+x] == 0){
                    colors[y*size + x] = 0;
                    colors[(y+randy)*size+randx+x] = pix;
                }
			}
		}
	}
}

function setrgb(rgb){
    d[0] = red(rgb);
    d[1] = green(green);
    d[2] = blue(rgb);
}

function rgb(red, green, blue){
    var rgb = red;
    rgb = (rgb << 8) + green;
    rgb = (rgb << 8) + blue;
    return rgb;
}

function red(rgb){
    return (rgb >> 16) & 0xFF;
}

function green(rgb){
    return (rgb >> 8) & 0xFF;
}

function blue(rgb){
    return rgb & 0xFF;
}
