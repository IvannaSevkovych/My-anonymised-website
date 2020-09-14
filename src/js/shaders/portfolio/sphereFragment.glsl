uniform float time;
uniform float threshold;
varying vec2 vUv;

const float PI=3.14159;

void main(){
	if(sin(40.*(vUv.x+vUv.y)*PI+time)>threshold){
		gl_FragColor=vec4(1.,.95,.48,1.);
	}else{
		discard;
	}
}
