uniform float time;
uniform float progress;
varying vec2 vUv;

const float PI=3.1415926535897932384626433832795;
const float THRESHOLD=.3;

void main(){

  float t = smoothstep(THRESHOLD, THRESHOLD*2.7, sin(20.*PI*(vUv.x)+time));

  float r = mix(.58, 1., t);
  float g = mix(.8, 1., t);
  float b = mix(.77, 1., t);

	gl_FragColor=vec4(r,g,b,1.-progress);
}

