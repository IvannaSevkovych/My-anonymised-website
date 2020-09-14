precision highp float;

uniform sampler2D texture;

varying vec2 vPUv;
varying vec2 vUv;
varying float vGrey;
varying float vDist;
varying vec2 vAdjustedMouse;
varying vec3 vOffset;

const float BORDER=.3;
const float RADIUS=.5;

/*
* Helper functions
*/
float blendScreen(float base, float blend) {
	return 1.0-((1.0-base)*(1.0-blend));
}

vec3 blendScreen(vec3 base, vec3 blend) {
	return vec3(blendScreen(base.r,blend.r),blendScreen(base.g,blend.g),blendScreen(base.b,blend.b));
}

vec3 blendScreen(vec3 base, vec3 blend, float opacity) {
	return (blendScreen(base, blend) * opacity + base * (1.0 - opacity));
}

/*
* Main
*/
void main(){
	
	vec4 originalColor=texture2D(texture,vPUv);
	
	vec4 monochromeColor=vec4(vGrey,vGrey,vGrey,1.);
	
	vec3 blendedRGB=blendScreen(monochromeColor.rgb,vec3(155./255.,182./255.,177./255.));
	
	monochromeColor=vec4(blendedRGB,1.);
	
	// circle
	float vDist=RADIUS-distance(vUv,vec2(.5));
	float t=smoothstep(0.,BORDER,vDist);
	
	if(vOffset.x<vAdjustedMouse.x){
		gl_FragColor=originalColor;
	}else{
		gl_FragColor=vec4(monochromeColor.xyz,t);
	}
}