#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

#define SCL 0.24

uniform sampler2D u_texture;

varying vec4 v_color;
varying vec2 v_texCoord;

float toint(float f){
    return float(int(f * 70.0 * 16.0));
}

void main(){
	vec4 color = texture2D(u_texture, v_texCoord.xy);
	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0 - float(int((color.r) / SCL)) * SCL);
}
