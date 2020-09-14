/*
 * Imports
 */
// npm
import * as THREE from 'three';

// libs
import { goto } from "./lib/_navigation";
import { cursor, initCursorEventListeners } from "./lib/_cursor";
import { loadFont } from './lib/_resource_loader';
import { SpiralCurve } from './lib/_spiral';
import { playEnterAnimation } from './lib/_animation_template_codes';

const OrbitControls = require('three-orbit-controls')(THREE);
const createInputEvents = require('simple-input-events');


/*
 * Declarations
 */
// Constants
const mouse = new THREE.Vector2(0, 0);
const mouseTarget = new THREE.Vector2(0, 0);
const orientation = new THREE.Vector2(0, 0);
const orientationTarget = new THREE.Vector2(0, 0);
const raycaster = new THREE.Raycaster();
const fontUrl = '../fonts/Syne_Extra.json';


const codesData = [
  {
    projectName: "3D-Rex",
    url: "./portfolio_codes_rex.html"
  },
  {
    projectName: "GlitterDots",
    url: "./portfolio_codes_morphoDots.html"
  },
  {
    projectName: "Distortion",
    url: "./portfolio_codes_distortion.html"
  },
  {
    projectName: "Volcano",
    url: "./portfolio_codes_volcano.html"
  },
  {
    projectName: "Masonry",
    url: "./portfolio_codes_masonry.html"
  },
];

const spiralProps = {
  radius: 50,
  depth: 100,
  turns: 3,
  scale: -1,
  tubeRadius: 0.2
};

const animationProps = {
  canvasContainerSelector: '#portfolio__codes__container',
  infoSelector: "#portfolio__codes__info",
  playInfo: true,
  duration: 0.7
}


// Variables
let animationFrameId;
let camera; let scene; let renderer; let group; let mouseEvent;
let gotoUrl = null;
let blockCursorUpdate = true;


/*
 * Functions
 */
function init() {
  /* Setup THREE boilerplate */
  const container = document.getElementById('portfolio__codes__container');

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    50,
    container.offsetWidth / container.offsetHeight,
    1, 1000
  );
  if (window.innerWidth < 1280) {
    camera.position.set(40, 0, 190);
  } else {
    camera.position.set(20, 0, 70);
  }

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = false;

  /* Start custom stuff */
  group = new THREE.Group();
  scene.add(group);

  const spiralPath = new SpiralCurve(spiralProps);
  const spiralGeometry = new THREE.TubeBufferGeometry(spiralPath, 800, spiralProps.tubeRadius, 8, false);
  const spiralMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const spiral = new THREE.Mesh(spiralGeometry, spiralMaterial);
  spiral.name = 'spiral';
  group.add(spiral);

  loadFont(fontUrl).then(font => {
    let codesCreated = 0;
    codesData.forEach((data, index) => {
      const { radius, depth, turns, scale, tubeRadius } = spiralProps;

      const textGeometry = new THREE.TextGeometry(data.projectName, {
        font,
        size: 4,
        height: 0.1,
        curveSegments: 12,
      });
      textGeometry.computeBoundingBox();
      const {boundingBox} = textGeometry;

      const textMaterial = new THREE.MeshBasicMaterial({ color: 0xFFF27B });
      const text = new THREE.Mesh(textGeometry, textMaterial);
      group.add(text);
      text.userData.goto = data.url;

      const fullCircle = 2 * Math.PI;
      const segment = index / codesData.length;
      const x = radius * Math.cos(fullCircle * turns * segment) * scale;
      const y = radius * Math.sin(fullCircle * turns * segment) * scale;
      const z = turns * depth * segment * scale;
      text.position.set(x - boundingBox.max.x / 2, y, z + tubeRadius * 1.5);

      const buttonWidth = boundingBox.max.x - boundingBox.min.x;
      const buttonHeight = boundingBox.max.y - boundingBox.min.y;
      const buttonGeometry = new THREE.PlaneBufferGeometry(buttonWidth, buttonHeight, 1, 1);
      const button = new THREE.Mesh(buttonGeometry, new THREE.MeshBasicMaterial({ visible: false }));
      button.position.set(x, y + boundingBox.max.y / 2, z);
      button.name = "button";
      button.userData.goto = data.url;
      group.add(button);

      codesCreated++;
      if (codesCreated === codesData.length) {
        $("#loader_wrapper").fadeOut("slow", () => playEnterAnimation(animationProps));
      }
    });
  });

  /* Call functions */
  resize();
  window.addEventListener('resize', resize);

  mouseEvent = createInputEvents(container);
  mouseEvent.on('move', ({ event }) => {
    mouse.x = (event.offsetX / container.offsetWidth) * 2 - 1;
    mouse.y = - (event.offsetY / container.offsetHeight) * 2 + 1;
  });

  initCursorEventListeners();

  container.getElementsByTagName('canvas')[0].addEventListener('click', onClick);
  window.addEventListener("deviceorientation", onDeviceMove);
}


function animate() {
  raycaster.setFromCamera(mouse, camera);

  const buttons = group.children.filter(child => child.name === "button");
  const intersects = raycaster.intersectObjects(buttons);

  if (intersects.length > 0) {
    const intersect = intersects[0];
    gotoUrl = intersect.object.userData.goto;
    cursor.classList.add('cursor__hover');
    blockCursorUpdate = false;
  } else {
    gotoUrl = null;
    if (!blockCursorUpdate) {
      blockCursorUpdate = true;
      cursor.classList.remove('cursor__hover');
    }
  }

  // Rotate image group
  if (window.innerWidth < 1280) {
    orientationTarget.x -= 0.1 * (orientationTarget.x - orientation.x);
    orientationTarget.y -= 0.1 * (orientationTarget.y - orientation.y);
    group.rotation.x = orientationTarget.y / 16;
    group.rotation.y = orientationTarget.x / 8;
  } else {
    mouseTarget.x -= 0.1 * (mouseTarget.x - mouse.x);
    mouseTarget.y -= 0.1 * (mouseTarget.y - mouse.y);
    group.rotation.x = mouseTarget.y / 16;
    group.rotation.y = mouseTarget.x / 8;
  }

  animationFrameId = requestAnimationFrame(animate);
  render();
}


function render() {
  renderer.render(scene, camera);
}


function start() {
  init();
  animate();
}


function stop() {
  cancelAnimationFrame(animationFrameId);
  mouseEvent.disable();
  cursor.classList.remove("cursor__hover");
}

/*
 * Helper functions and event listeners
 */
function resize() {
  const container = document.getElementById('portfolio__codes__container');
  const w = container.offsetWidth;
  const h = container.offsetHeight;
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}


function onDeviceMove(event) {
  const limit = 15;
  orientation.x = - Math.min(1, event.gamma / limit);
  orientation.y = Math.min(1, event.beta / limit) * 3;
}


function onClick() {
  if (gotoUrl) {
    const url = gotoUrl;
    stop();
    goto(url);
  }
}


/*
 * Exports
 */
export const startPortfolioCodes = () => start();
export const stopPortfolioCodes = () => stop();
