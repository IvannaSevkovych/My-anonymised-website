uniform float resolution;

varying vec2 vUv;

void main(){

	float horBorder=.03;
	float vertBorder = horBorder * resolution;
	
	if(vUv.x<horBorder||vUv.x>1.-horBorder||vUv.y<vertBorder||vUv.y>1.-vertBorder){
		gl_FragColor=vec4(1.);
	}else{
		gl_FragColor=vec4(0.58, 0.80, 0.77, 1.);

	}
	
}