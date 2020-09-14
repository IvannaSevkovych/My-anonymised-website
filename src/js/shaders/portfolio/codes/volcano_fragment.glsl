#pragma glslify:snoise2=require(glsl-noise/simplex/2d)
uniform float time;

varying vec2 vUv;
varying vec4 vPosition;

varying float vAlpha;

void main()	{
	float d = length(gl_PointCoord - vec2(0.5));

	float a = 1. - smoothstep(0.,0.5, d);
	float r = sin(time/10.)*a/2.+1.;
	float g = cos(time/5.)*a/2.+0.5;
	float b = cos(time/2.+1.)*a/2.;

	gl_FragColor = vec4(r, g, b, a*vAlpha);
}