#pragma glslify:snoise2=require(glsl-noise/simplex/2d)

uniform float time;

varying vec2 vUv;

void main()	{
  float glimmer = snoise2(vec2(time/2.,vUv.y)) * 0.05;
	gl_FragColor= vec4(1. - glimmer,1.-glimmer,1.-glimmer,vUv.y-glimmer);
}
