
#define NUM_OCTAVES 5

#pragma glslify:snoise4=require(glsl-noise/simplex/4d)

uniform float time;
uniform vec3 mousePosition;

varying vec2 vUv;
varying float koef;

const float RADIUS=1.5;

mat3 getRotationMatrix(float time){
  return mat3(
    cos(time),0.,sin(time),// first matrix column, not row!
    0.,1.,0.,// second column
    -sin(time),0.,cos(time)// third column
  );
}

void main(){
  vUv=uv;
  
  vec3 newPosition=getRotationMatrix(time/4.)*position;
  vec3 noisePosition;
  
  if(length(newPosition-mousePosition)<RADIUS){
    
    noisePosition.x=2.*normal.x*(snoise4(vec4(position,normal.x))+2.);
    noisePosition.y=2.*normal.y*(snoise4(vec4(position,normal.y))+2.);
    noisePosition.z=2.*normal.z*(snoise4(vec4(position,normal.z))+2.);
    
    koef=(RADIUS-length(newPosition-mousePosition))/RADIUS;
    koef=pow(koef,4.);
    
    newPosition=mix(newPosition,newPosition+noisePosition,koef);
    
  }
  
  vec4 mvPosition=modelViewMatrix*vec4(newPosition,1.);
  gl_PointSize=10.*(1./-mvPosition.z);
  gl_Position=projectionMatrix*mvPosition;
}