uniform float time;
uniform vec3 mousePosition;
uniform float progress;
uniform float rotationDirection;

varying vec2 vUv;

const float PI=3.1415926535897932384626433832795;

mat3 getRotationMatrix(float param){
  return mat3(
    cos(param),0.,-sin(param),// first matrix column, not row!
    0.,1.,0.,// second column
    sin(param),0.,cos(param)// third column
  );
}

void main(){
  vUv=uv;
  
  float rotationProgress=progress;
  if(rotationDirection==-1.){
    rotationProgress=1.-progress;
  }
  
  mat3 xz_rotationMatrix=getRotationMatrix(PI*2.*rotationProgress);
  vec3 newPosition=position*xz_rotationMatrix;
  
  vec4 mvPosition=modelViewMatrix*vec4(newPosition,1.);
  
  gl_Position=projectionMatrix*mvPosition;
}