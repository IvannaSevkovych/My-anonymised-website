varying vec2 vUv;

uniform float radius;

void main(){
	
	vec2 centeredUv = vUv-vec2(0.5);
	float t = smoothstep(radius, radius*1.002, length(centeredUv));

	if(t==0.) discard;

 	float r = mix(.58, 1., t);
  	float g = mix(.8, 1., t);
  	float b = mix(.77, 1., t);
	  
	gl_FragColor=vec4(r,g,b,1.);
}