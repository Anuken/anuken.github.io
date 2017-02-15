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
var renderer = new PIXI.autoDetectRenderer(width, height, false, false);
document.body.appendChild(renderer.view);

PIXI.settings.RESOLUTION = 0.5;

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
var cosines = [];
var dancer = new Dancer();

for(i = 0; i < size; i++)
	logs[i] = Math.log(i);

for(i = 0; i < Math.PI*2.0; i += percision){
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

updateTex();

drawTex();

var canvasTex = PIXI.Texture.fromCanvas(canvas);
canvasTex.baseTexture.scaleMode = PIXI.SCALE_MODES.NEAREST;

var logo = new PIXI.Sprite(canvasTex);
logo.x = width / 2;
logo.y = height / 2;
logo.rotation = Math.PI/4;
logo.anchor.set(0.5);
stage.addChild(logo);

function animate() {

    updateTex();
    //drawTex();

    canvasTex.update();

    renderer.render(stage);

    requestAnimationFrame(animate);
}

animate();

playAudio();

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

    var data = context.getImageData(0, 0, canvas.width, canvas.height);

    for(i = 0; i < 2; i ++)
	for(x = 0; x < size; x++){
		for(y = 0; y < size; y++){

			pix = colors[y*size + x];

			if(pix != 0){
                
				var randx = Math.floor((cos(y * scale2 + logs[y] * scale3 + scale4)) * scale),
						randy =  Math.floor((cos(x * scale2 + logs[x] * scale3 + scale4)) * scale);
                
                if(!(x + randx >= size) && !(x + randx < 0) && !(y + randy >= size) && !(y + randy < 0) && colors[(y+randy)*size+randx+x] == 0){
                    colors[y*size + x] = 0;
                    colors[(y+randy)*size+randx+x] = pix;

                    put(x, y, 0, data.data);

                    put(x + randx, y + randy, 255, data.data);

                    //setrgb(0);
                    //context.putImageData(id, x, y);

                   // setrgb(pix);
                  //  context.putImageData(id, x + randx, y + randy);
                }
			}
		}
	}

    context.putImageData(data, 0, 0);
}

function resetTex(){
    var data = context.getImageData(0, 0, canvas.width, canvas.height);

    for(x = 0; x < size; x ++){
        for(y = 0; y < size; y ++){
            colors[y*size + x] = x < e || y < e || x > size-e || y > size-e  ? 0 : rgb(255, 255, 255);
            var i = colors[y*size + x] == 0 ? 0 : 255;

            data.data[x*4+y*4*size] = i; 
            data.data[x*4+y*4*size+1] = i; 
            data.data[x*4+y*4*size+2] = i; 
            data.data[x*4+y*4*size+3] = i; 
        }
    }

    
    context.putImageData(data, 0, 0);
}

function put(x, y, rgb, data){
    data[x*4 + y*4*size] = rgb;
    data[x*4 + y*4*size+1] = rgb;
    data[x*4 + y*4*size+2] = rgb;
    data[x*4 + y*4*size+3] = 255;
}

function setrgb(rgb){
    var e = rgb == 0 ? 0 : 255;

    d[0] = e;
    d[1] = e;
    d[2] = e;
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

function playAudio(){
  var a = new Audio();
  var flip = 1;
  dancer.load( document.getElementsByTagName('audio')[0] );
  dancer.play();
  dancer.after(0, function(){
      if(bar(0) > 0.06){
          scale3 += bar(0)*10*flip;
      }else{
          flip = -flip;
      }

      logo.scale.x = logo.scale.y = 1 + bar(1)*2.0;
  });
}

function bar(index){
    return dancer.getFrequency(16*index);
}
