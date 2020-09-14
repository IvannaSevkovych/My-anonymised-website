#pragma glslify:snoise2=require(glsl-noise/simplex/2d)


uniform float time;
uniform sampler2D texture;
uniform vec2 mouse;
uniform vec2 textureSize;

varying vec2 vUv;

void main(){

	vec4 color=texture2D(texture,vUv);

	float noiseComponent=snoise2(vec2(vUv.y, time/5.))/100.;

	if(vUv.x + noiseComponent>mouse.x+.5) discard;

	float t=smoothstep(vUv.x + noiseComponent-0.002,vUv.x + noiseComponent,mouse.x+0.49);

	gl_FragColor=mix(vec4(0.), color,t);
	
}