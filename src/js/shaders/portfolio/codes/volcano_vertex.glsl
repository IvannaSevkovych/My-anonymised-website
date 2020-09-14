#pragma glslify:snoise2=require(glsl-noise/simplex/2d)

uniform float time;
uniform vec2 uMouse;
varying vec2 vUv;
varying vec4 vPosition;
varying float vAlpha;

attribute float angle;
attribute float offset;
attribute float life;

const float MOUSE_RADIUS=.3;
const float POINT_SIZE=30.;

void main(){
  vUv=uv;
  
  float currentLifeStage=mod(offset+time/4.,life);
  float percentLived=currentLifeStage/life;
  
  vec3 newPosition=position;
  
  vAlpha=smoothstep(0.,.05,percentLived);
  
  vAlpha-=smoothstep(.85,1.,percentLived);
  
  float moveDirection=angle*.5*snoise2(vec2(time/5.,currentLifeStage));
  
  newPosition.x+=cos(moveDirection)*currentLifeStage*.2;
  newPosition.y+=sin(moveDirection)*currentLifeStage*.2;
  
  // Mouse influence
  float distortionStrength=distance(newPosition.xy,uMouse)/MOUSE_RADIUS;
  distortionStrength=1.-smoothstep(0.,1.,distortionStrength);
  
  float dx=uMouse.x-newPosition.x;
  float dy=uMouse.y-newPosition.y;
  float distortionAngle=atan(dy,dx);
  
  newPosition.x+=cos(distortionAngle)*distortionStrength;
  newPosition.y+=sin(distortionAngle)*distortionStrength;
  
  vec4 mvPosition=modelViewMatrix*vec4(newPosition,1.);
  gl_PointSize=POINT_SIZE*(1./-mvPosition.z);
  gl_Position=projectionMatrix*mvPosition;
}