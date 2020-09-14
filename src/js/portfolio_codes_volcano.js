/*
 * Imports
 */
// npm
import * as THREE from 'three';

// shaders
import fragment from './shaders/portfolio/codes/volcano_fragment.glsl';
import vertex from './shaders/portfolio/codes/volcano_vertex.glsl';

// libs
import "./lib/_navigation";
import { cursor, initCursorEventListeners } from "./lib/_cursor";
import { playEnterAnimation } from './lib/_animation_template_codes';

const glslify = require('glslify');
const createInputEvents = require('simple-input-events');

/*
 * Declarations
 */
// Constants
const MOUSE = new THREE.Vector2(-1, -1);
const RAYCASTER = new THREE.Raycaster();
const VOLCANO_PROPS = {
  particles: 5000,
  positionFactor: 0.1,
  angleFactor: 1,
  livesFactor: 5,
  livesBias: 4,
  offsetFactor: 100,
};

// Variables
let animationFrameId;
let camera; let scene; let renderer; let dotsMaterial; let clearingPlane; let mouseEvent;
let time = 0;


/*
 * Functions
 */
function init() {
  /* Setup THREE boilerplate */
  const container = document.getElementById('container');
  mouseEvent = createInputEvents(container);

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ preserveDrawingBuffer: true, alpha: true, antialias: true });
  renderer.autoClear = false;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    70,
    container.offsetWidth / container.offsetHeight,
    0.001, 1000
  );
  camera.position.set(0, 0, 3);

  /* Start custom stuff */
  dotsMaterial = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      time: { type: 'f', value: 0 },
      uMouse: { type: "v2", value: new THREE.Vector2(0, 0) },
    },
    vertexShader: glslify(vertex),
    fragmentShader: glslify(fragment),
    transparent: true,
    depthWrite: false,
  });

  const { particles, positionFactor, angleFactor, livesBias, livesFactor, offsetFactor } = VOLCANO_PROPS;
  const dotsGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particles * 3);
  const angles = new Float32Array(particles);
  const lives = new Float32Array(particles);
  const offsets = new Float32Array(particles);

  for (let i = 0; i < particles; i++) {
    positions.set(
      [
        Math.random() * positionFactor,
        Math.random() * positionFactor,
        Math.random() * positionFactor
      ],
      3 * i
    );
    angles.set([angleFactor * Math.random() * 2 * Math.PI], i);
    lives.set([livesBias + Math.random() * livesFactor], i);
    offsets.set([offsetFactor * Math.random()], i);
  }

  dotsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  dotsGeometry.setAttribute("angle", new THREE.BufferAttribute(angles, 1));
  dotsGeometry.setAttribute("life", new THREE.BufferAttribute(lives, 1));
  dotsGeometry.setAttribute("offset", new THREE.BufferAttribute(offsets, 1));

  const dots = new THREE.Points(dotsGeometry, dotsMaterial);

  clearingPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(container.offsetWidth, container.offsetHeight),
    new THREE.MeshBasicMaterial({
      transparent: true,
      color: 0xFFFFFF,
      opacity: 0.01
    })
  );
  scene.add(dots, clearingPlane);

  /* Call functions */
  resize();
  window.addEventListener('resize', resize);

  mouseEvent.on('move', ({ position }) => {
    MOUSE.x = position[0] / container.offsetWidth * 2 - 1;
    MOUSE.y = 1 - position[1] / container.offsetHeight * 2;
  });

  initCursorEventListeners();
}


function animate() {
  time += 0.05;
  dotsMaterial.uniforms.time.value = time;

  RAYCASTER.setFromCamera(MOUSE, camera);
  const intersects = RAYCASTER.intersectObjects([clearingPlane]);

  if (intersects[0]) {
    const p = intersects[0].point;
    dotsMaterial.uniforms.uMouse.value = new THREE.Vector2(p.x, p.y);
  }

  animationFrameId = requestAnimationFrame(animate);
  render();
}


function render() {
  renderer.render(scene, camera);
}


function start() {
  if (window.innerWidth < 1280) {
    $("#codes__info__instruction").html("Tap the volcano")
  }

  $("#loader_wrapper").fadeOut("slow", () => { playEnterAnimation() });
  init();
  animate();
}


function stop() {
  cancelAnimationFrame(animationFrameId);
  mouseEvent.disable();
  const container = document.getElementById('container');
  container.removeChild(container.getElementsByTagName('canvas')[0]);
  cursor.classList.remove("cursor__hover");
}


/*
 * Helper functions and event listeners
 */
function resize() {
  const container = document.getElementById('container');
  const w = container.offsetWidth;
  const h = container.offsetHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}


/*
 * Exports
 */
export const startVolcano = () => start();
export const stopVolcano = () => stop();
