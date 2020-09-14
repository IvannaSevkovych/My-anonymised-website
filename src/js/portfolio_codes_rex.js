/*
 * Imports
 */
// npm
import * as THREE from 'three';

// shaders
import rexFragment from './shaders/portfolio/codes/rexFragment.glsl';
import rexVertex from './shaders/portfolio/codes/rexVertex.glsl';

// libs
import "./lib/_navigation";
import { cursor, initCursorEventListeners } from "./lib/_cursor";
import { loadModel } from './lib/_resource_loader';
import { playEnterAnimation } from './lib/_animation_template_codes';

const createInputEvents = require('simple-input-events');
const OrbitControls = require('three-orbit-controls')(THREE);

/*
 * Declarations
 */
// Constants
const RAYCASTER = new THREE.Raycaster();
const MOUSE = new THREE.Vector2(-1, -1);
const MODEL_DATA = {
  url: '../models/dino_opt.glb'
};

// Variables
let animationFrameId;
let camera; let scene; let renderer; let canvasContainer; let material; let group; let mouseEvent;
let time = 0;


function init() {
  /* Setup THREE boilerplate */
  group = new THREE.Group();

  canvasContainer = document.getElementById('container');

  scene = new THREE.Scene();
  scene.add(group);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
  canvasContainer.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    70,
    canvasContainer.offsetWidth / canvasContainer.offsetHeight,
    0.001, 100
  );
  camera.position.set(1.5, 0, 2);

  const controls = new OrbitControls(camera, renderer.domElement);

  /* Start custom stuff */
  material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    uniforms: {
      time: { type: 'f', value: 0 },
      mousePosition: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
    },
    vertexShader: rexVertex,
    fragmentShader: rexFragment,
  });

  loadModel(MODEL_DATA).then(model => {
    const dinoMesh = model.scene.getObjectByName("dino", true);

    const mesh = new THREE.Mesh(dinoMesh.geometry, material);
    group.add(mesh);
    group.position.y = - dinoMesh.geometry.boundingBox.max.y / 2;

    // Add plane for raycaster
    const planeGeometry = new THREE.PlaneBufferGeometry(canvasContainer.offsetWidth, canvasContainer.offsetHeight);
    const planeMaterial = new THREE.MeshBasicMaterial({ visible: false });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.name = "target";
    scene.add(plane);
  });

  resize();
  window.addEventListener('resize', resize);

  mouseEvent = createInputEvents(canvasContainer);
  mouseEvent.on('move', ({ position }) => {
    MOUSE.x = position[0] / canvasContainer.offsetWidth * 2 - 1;
    MOUSE.y = 1 - position[1] / canvasContainer.offsetHeight * 2;
  });

  initCursorEventListeners();
}


function animate() {
  time += 0.05;
  material.uniforms.time.value = time;

  RAYCASTER.setFromCamera(MOUSE, camera);

  const intersects = RAYCASTER.intersectObjects(scene.children.filter(child => child.name === "target"));
  if (intersects.length) {
    material.uniforms.mousePosition.value = intersects[0].point;
  }

  requestAnimationFrame(animate);
  render();
}


function render() {
  renderer.render(scene, camera);
}


function start() {
  if (window.innerWidth < 1280) {
    $("#codes__info__instruction").html("Tap the dino");
  }

  $("#loader_wrapper").fadeOut("slow", () => playEnterAnimation());
  init();
  animate();
}


function stop() {
  cancelAnimationFrame(animationFrameId);
  renderer.dispose();
  mouseEvent.disable();
  canvasContainer.removeChild(canvasContainer.getElementsByTagName('canvas')[0]);
  cursor.classList.remove("cursor__hover");
}

/*
 * Helper functions and event listeners
 */
function resize() {
  const w = canvasContainer.offsetWidth;
  const h = canvasContainer.offsetHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}


/*
 * Exports
 */
export const startRex = () => start();
export const stopRex = () => stop();
