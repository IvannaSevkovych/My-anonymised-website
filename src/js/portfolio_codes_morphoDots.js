/*
 * Imports
 */
// npm
import * as THREE from 'three';
import gsap from 'gsap';

// shaders

// libs
import "./lib/_navigation";
import { cursor, initCursorEventListeners } from "./lib/_cursor";
import { playEnterAnimation } from './lib/_animation_template_codes';


/*
 * Declarations
 */
// Constants
const SIZE = 200;
const CANVAS = document.createElement('canvas');
CANVAS.width = SIZE;
CANVAS.height = SIZE;
const CTX = CANVAS.getContext("2d");

const IMAGES = [
  "../img/codes/morphoDots_arch.svg",
  "../img/codes/morphoDots_3d.svg",
  "../img/codes/morphoDots_code.svg"
];

// Variables
let animationFrameId;
let camera; let scene; let renderer; let gallery; let geometry;
let currentImage = 0;
let time = 0;


/*
 * Functions
 */
function init(currentImageCoordinates) {
  /* Setup THREE boilerplate */
  const container = document.getElementById('container');

  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    70,
    container.offsetWidth / container.offsetHeight,
    0.001, 2500
  );
  camera.position.set(0, 0, 2000);

  /* Start custom stuff */
  const texture = new THREE.TextureLoader().load("../img/codes/morphoDots_circle.png",);
  const material = new THREE.PointsMaterial({
    size: 10,
    map: texture,
    alphaTest: 0.6,
    vertexColors: true
  });

  geometry = new THREE.BufferGeometry();

  const vertices = new Float32Array(currentImageCoordinates.length * 3);
  const colors = new Float32Array(currentImageCoordinates.length * 3);

  for (let i = 0; i < currentImageCoordinates.length; i++) {
    const [x, y] = currentImageCoordinates[i];
    vertices[3 * i] = x;
    vertices[3 * i + 1] = y;
    vertices[3 * i + 2] = 100 * Math.random();

    const randomColor = Math.random() + 0.3;
    colors[3 * i] = randomColor;
    colors[3 * i + 1] = randomColor;
    colors[3 * i + 2] = randomColor;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const points = new THREE.Points(geometry, material);

  scene.add(points);

  resize();

  initCursorEventListeners();
}


function animate() {
  time += 0.05;

  const arrayLength = geometry.attributes.position.count;

  for (let i = 0; i < arrayLength; i++) {
    const dimension = i % 3;

    if (dimension === 2) {
      geometry.attributes.position.array[i] += 50 * Math.sin(time / 10 + i / 3);
    }
  }

  geometry.attributes.position.needsUpdate = true;

  animationFrameId = requestAnimationFrame(animate);
  render();
}


function start() {
  if (window.innerWidth < 1280) {
    $("#codes__info__instruction").html("Tap on the image");
  }

  loadImages(IMAGES, imgs => {

    gallery = [];
    imgs.forEach(img => {
      gallery.push(getCoordinatesFromImage(img));
    });

    window.addEventListener('resize', resize);
    document.body.addEventListener("click", onClick);

    $("#loader_wrapper").fadeOut("slow", () => { playEnterAnimation() });
    init(gallery[0]);
    animate();
  });
}


function stop() {
  cancelAnimationFrame(animationFrameId);
  const container = document.getElementById('container');
  container.removeChild(container.getElementsByTagName('canvas')[0]);
  cursor.classList.remove("cursor__hover");
}


function render() {
  renderer.render(scene, camera);
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

function loadImages(paths, callback) {
  const imgs = [];
  paths.forEach(path => {
    const img = new Image(SIZE, SIZE);
    img.onload = () => {
      imgs.push(img);

      if (imgs.length === paths.length) {
        callback(imgs);
      }
    }
    img.src = path;
  });
}


function getCoordinatesFromImage(img) {
  const imageCoords = [];
  CTX.clearRect(0, 0, SIZE, SIZE);
  CTX.drawImage(img, 0, 0, SIZE, SIZE);
  const { data } = CTX.getImageData(0, 0, SIZE, SIZE);

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const alpha = data[((SIZE * y) + x) * 4 + 3];
      if (alpha > 0) {
        imageCoords.push([10 * (x - SIZE / 2), 10 * (SIZE / 2 - y)]);
      }
    }
  }
  return fillUp(imageCoords, 20000);
}


function fillUp(array, max) {
  const { length } = array;
  for (let i = 0; i < max - length; i++) {
    const index = Math.floor(Math.random() * (length - 1));
    array.push(array[index]);
  }
  return array;
}


function onClick() {
  const newPositionArray = new Float32Array(60000);
  currentImage++;
  currentImage %= gallery.length;
  geometry.attributes.position.array.forEach((coord, index) => {
    const dimension = index % 3;
    const targetCoord = dimension === 2 ? Math.random() * 100 : gallery[currentImage][Math.floor(index / 3)][dimension];

    newPositionArray[index] = targetCoord;
  });

  gsap.to(geometry.attributes.position.array, 1, newPositionArray);
}


/*
 * Exports
 */
export const startMorphoDots = () => start();
export const stopMorphoDots = () => stop();
