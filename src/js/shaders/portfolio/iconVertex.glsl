
uniform float pointSize;

void main(){
  vec4 mvPosition=modelViewMatrix*vec4(position,1.);
  gl_PointSize=pointSize*(1./-mvPosition.z);
  gl_Position=projectionMatrix*mvPosition;
}