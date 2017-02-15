var width = window.innerWidth;
var height = window.innerHeight;
var renderer = new PIXI.autoDetectRenderer(width, height);//Chooses either WebGL if supported or falls back to Canvas rendering
document.body.appendChild(renderer.view);//Add the render view object into the page

var stage = new PIXI.Container();//The stage is the root container that will hold everything in our scene


var size = 200;

// smoke shader
var uniforms = {};
uniforms.resolution = { type: 'v2', value: { x: width, y: height}};
uniforms.time = {type: '1f',value: 0};


var shaderCode = document.getElementById( 'shader' ).innerHTML
var smokeShader = new PIXI.AbstractFilter('',shaderCode, uniforms);


var logo = PIXI.Sprite.fromImage("http://www.goodboydigital.com/pixijs/pixi_v3_github-pad.png");
logo.x = width / 2;
logo.y = height / 2;
logo.width = size;
logo.height = size;
logo.anchor.set(0.5);
logo.filters = [smokeShader]
stage.addChild(logo)

animate()


var count = 0

function animate() {
    // start the timer for the next animation loop
    requestAnimationFrame(animate);

    count+=0.01
    smokeShader.uniforms.time.value = count;

    // this is the main render call that makes pixi draw your container and its children.
    renderer.render(stage);
}
