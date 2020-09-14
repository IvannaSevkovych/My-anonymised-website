precision highp float;
#pragma glslify:snoise2=require(glsl-noise/simplex/2d)

uniform float time;
uniform vec2 mouse;
uniform vec2 textureSize;
uniform sampler2D texture;
uniform float imageGroupOffset;

attribute float pindex;
attribute vec3 position;
attribute vec3 offset;
attribute vec2 uv;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

varying vec2 vPUv;
varying vec2 vUv;
varying float vGrey;
varying float vDist;
varying vec2 vAdjustedMouse;
varying vec3 vOffset;

/*
* Constants
*/
const float DARKNESS_THRESHOLD = 34.;
const float RADIUS = 100.;

/*
* Helper functions
*/
float randomize(float n){
	return fract(sin(n)*43758.5453123);
}

bool lowOneChannel(float channel, float threshold) {
	return channel < threshold/255.;
}

bool highOneChannel(float channel, float threshold) {
	return channel > threshold/255.;
}

bool clampOneChannel(float channel, float threshold) {
	return channel > 1. - threshold/255. || channel < threshold/255.;
}

bool averageChannels(vec3 channels, float threshold) {
	float avg = (channels.x + channels.y + channels.z) / 3.;
	return !(avg > 1. - threshold/255. || avg < threshold/255.);
}

bool tooDark(vec4 colorInformation, float threshold) {
	return lowOneChannel(colorInformation.r,threshold);
}

/*
* Main
*/
void main(){
	// Set varying variables
	vUv=uv;
	vPUv=offset.xy/textureSize;
	vOffset=offset;
	
	// Get texture information
	vec4 textureData=texture2D(texture,vPUv);
	vGrey=1.-((1.-textureData.r)*(1.-textureData.b));
	
	// adjust mouse position
	vAdjustedMouse=textureSize*(mouse+.5) - imageGroupOffset;
	
	// Handle pixels to the left of the mouse
	if(vAdjustedMouse.x>offset.x){
		return;
	}
	// don't process pixels that are too dark
	if(tooDark(textureData,DARKNESS_THRESHOLD)){
		return;
	}
	
	// Handle pixels to the right of the mouse -> particles effect
	// displacement
	vec3 displacedPosition=offset;
	
	// randomise
	displacedPosition.xy+=vec2(randomize(pindex)-.5,randomize(offset.x+pindex)-.5);
	float rndz=(randomize(pindex)+snoise2(vec2(pindex*.1,time)));
	displacedPosition.z+=rndz*(randomize(pindex)*4.);
	
	// center
	displacedPosition.xy-=textureSize*.5;
	
	// point size
	float psize=(snoise2(vec2(time,pindex)*.5)+2.);
	psize*=max(vGrey,.7)*.5;
	
	// mouse distortion
	vDist=abs(vAdjustedMouse.x-offset.x-position.x);
	displacedPosition.xy+=2.*smoothstep(9.,120.,RADIUS-vDist);
	
	// final position
	vec4 mvPosition=modelViewMatrix*vec4(displacedPosition,1.);
	mvPosition.xyz+=position*psize;
	
	gl_Position=projectionMatrix*mvPosition;
}