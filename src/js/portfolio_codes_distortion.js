/*
 * Imports
 */
// npm
import * as THREE from 'three';
import gsap from 'gsap';

// shaders
import fragment from './shaders/portfolio/codes/distortion_fragment.glsl';
import vertex from './shaders/portfolio/codes/distortion_vertex.glsl';

// libs
import "./lib/_navigation";
import { cursor, initCursorEventListeners } from "./lib/_cursor";
import { playEnterAnimation } from './lib/_animation_template_codes';

const OrbitControls = require('three-orbit-controls')(THREE);
const createInputEvents = require('simple-input-events');

/*
 * Declarations
 */
// Constants
const mouse = new THREE.Vector2(0, 0);

// Variables
let animationFrameId;
let camera; let scene; let renderer; let material; let plane; let container; let mouseEvent; let time;
let prevSpeed = 0;

/*
 * Functions
 */
function init() {
  container = document.getElementById('container');

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    70,
    container.offsetWidth / container.offsetHeight,
    0.001, 100
  );
  camera.position.set(0, 0, 1);

  const controls = new OrbitControls(camera, renderer.domElement);

  const texture = new THREE.TextureLoader().load('../img/codes/distortion.jpg');

  material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      time: { type: 'f', value: 0 },
      speed: { type: 'f', value: 0 },
      direction: { type: 'f', value: 0 },
      progress: { type: 'f', value: 0 },
      mouseTarget: { type: 'v2', value: new THREE.Vector2(0, 0) },
      texture: { type: 't', value: texture },
      resolution: { type: 'v4', value: new THREE.Vector4() },
    },
    wireframe: false,
    vertexShader: vertex,
    fragmentShader: fragment,
  });

  plane = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 100, 100), material);
  scene.add(plane);

  resize();
  window.addEventListener('resize', resize);

  mouseEvent = createInputEvents(container);
  initMouseEvents(mouseEvent);

  initCursorEventListeners();
}


function initMouseEvents(event) {
  event.on('move', ({ position }) => {
    // mousemove / touchmove
    material.uniforms.mouseTarget.value.x = position[0] / container.offsetWidth;
    material.uniforms.mouseTarget.value.y = 1 - position[1] / container.offsetHeight;
  });

  event.on('down', () => {
    material.uniforms.direction.value = -1;
    gsap.to(material.uniforms.progress, {
      value: 1,
      duration: 0.5,
    })
  })

  event.on('up', () => {
    material.uniforms.direction.value = 1;
    gsap.to(material.uniforms.progress, {
      value: 0,
      duration: 0.5,
    })
  })
}


function resize() {
  const w = container.offsetWidth;
  const h = container.offsetHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;

  updateShaderResolution(w, h);
  camera.updateProjectionMatrix();
}


function updateShaderResolution(w, h) {
  // Adjust aspect ratio of the plane to mirror the aspect ratio of the viewport
  if (w > h) {
    plane.scale.x = w / h;
  }
  else {
    plane.scale.y = h / w;
  }

  // Adjust camera FOV so that the plane covers the whole screen
  const dist = camera.position.z;
  const { height } = plane.geometry.parameters;
  camera.fov = (180 / Math.PI) * 2 * Math.atan((height / 2) / dist);

  // Declare resolution variable
  const imageAspect = 1280 / 1920;
  let a1; let a2;
  if (h / w > imageAspect) {
    a1 = (w * imageAspect) / h;
    a2 = 1;
  } else {
    a1 = 1;
    a2 = h / (w * imageAspect);
  }

  const resolution = new THREE.Vector4(w, h, a1, a2);
  material.uniforms.resolution.value = resolution;
}


function getSpeed() {
  const speed = Math.sqrt(
    (mouse.x - material.uniforms.mouseTarget.value.x) ** 2 +
    (mouse.y - material.uniforms.mouseTarget.value.y) ** 2
  );
  material.uniforms.speed.value += 0.1 * (speed - prevSpeed);

  prevSpeed = speed;

  mouse.x = material.uniforms.mouseTarget.value.x;
  mouse.y = material.uniforms.mouseTarget.value.y;
}


function animate() {
  time += 0.05;
  material.uniforms.time.value = time;

  getSpeed()
  animationFrameId = requestAnimationFrame(animate);
  render();
}


function render() {
  renderer.render(scene, camera);
}


function start() {
  time = 0;

  if (window.innerWidth < 1280) {
    $("#codes__info__instruction").html("Tap & hold");
  }

  $("#loader_wrapper").fadeOut("slow", () => playEnterAnimation());
  init();
  animate();
}


function stop() {
  cancelAnimationFrame(animationFrameId);
  mouseEvent.disable();
  cursor.classList.remove("cursor__hover");
}


/*
 * Exports
 */
export const startDistortion = () => start();
export const stopDistortion = () => stop();
