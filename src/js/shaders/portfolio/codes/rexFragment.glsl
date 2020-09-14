uniform float time;
uniform sampler2D map;
varying vec2 vUv;
varying vec4 vPosition;


varying float koef;

void main()	{

	gl_FragColor = vec4(1.-vUv.y, vUv.x,  0.2, 1.0);

}