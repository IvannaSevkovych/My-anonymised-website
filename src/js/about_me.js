/*
 * Imports
 */
// npm
import * as THREE from 'three';
import gsap from "gsap";

// shaders
import fragment from './shaders/about_me/fragment.glsl';
import vertex from './shaders/about_me/vertex.glsl';

// libs
import "./lib/_navigation";
import { cursor, initCursorEventListeners } from "./lib/_cursor";
import { loadImage } from './lib/_resource_loader';
import { visibleHeightAtZDepth, visibleWidthAtZDepth } from './lib/_THREE_helpers';
import { navigationLeftSelector, navigationRightSelector } from './lib/_constants';

const glslify = require('glslify');


/*
 * Declarations
 */
// Constants
const mouse = new THREE.Vector2(1, 0);
const aboutMeData = [
  {
    id: 0,
    url: window.innerWidth <= 1100 ? '../img/about_me/portrait_light_mobile.png' : '../img/about_me/portrait_light.png',
    visibilityCriterion: (_mouse) => _mouse.x > 0.3,
  },
  {
    id: 1,
    url: window.innerWidth <= 1100 ? '../img/about_me/portrait_whaaat_mobile.png' : '../img/about_me/portrait_whaaat.png',
    visibilityCriterion: (_mouse) => _mouse.x <= 0.3,
  },
];

const animationProps = {
  textSelector: "#aboutMe__text",
  socialSelector: "#aboutMe__social",
  duration: 0.7,
}


// Variables
let animationFrameId;
let camera; let scene; let renderer; let canvasContainer; let portraitGroup; let spotGroup;
let time = 0;


/*
 * Functions
 */
function init() {
  /* Setup THREE boilerplate */
  canvasContainer = document.getElementById('aboutMe__container');

  scene = new THREE.Scene();
  scene.destination = { x: 0, y: 0 };

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetHeight)

  canvasContainer.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    1,
    canvasContainer.offsetWidth / window.innerHeight,
    0.001, 300
  );

  if (window.innerWidth <= 1100) {
    camera.position.set(0, 0, 101);
  } else {
    camera.position.set(0, 0, 90);
  }

  /* Start custom stuff */
  portraitGroup = new THREE.Group();
  if (window.innerWidth <= 1100) {
    portraitGroup.position.x = 0;
    portraitGroup.position.y = -0.2;
  } else {
    portraitGroup.position.x = visibleWidthAtZDepth(0, camera) / 3;
  }
  scene.add(portraitGroup);

  const podiumGeometry = new THREE.CylinderBufferGeometry(0.3, 0.3, 0.0001, 64);
  const podiumMaterial = new THREE.MeshBasicMaterial({ color: 0xFFF27B });
  const podium = new THREE.Mesh(podiumGeometry, podiumMaterial);

  podium.position.y = -0.5;
  podium.position.z = -0.5;
  podium.rotateX(15 * Math.PI / 180);
  portraitGroup.add(podium);

  let imagesLoaded = 0;
  aboutMeData.forEach(photo => {
    loadImage(photo.url).then(texture => {
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
      const planeWidth = texture.image.width / texture.image.height;
      const planeHeight = 1;
      const geometry = new THREE.PlaneBufferGeometry(planeWidth, planeHeight, 1, 1);
      const material = new THREE.MeshBasicMaterial({ map: texture, alphaTest: 0.5, });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.visible = photo.visibilityCriterion(mouse);
      mesh.name = photo.url;

      portraitGroup.add(mesh);

      imagesLoaded++;

      if (imagesLoaded === aboutMeData.length) {
        $("#loader_wrapper").fadeOut("slow", () => playEnterAnimation());
      }
    });
  });

  spotGroup = new THREE.Group();
  scene.add(spotGroup);

  if (window.innerWidth <= 1100) {
    spotGroup.position.x = (visibleHeightAtZDepth(0, camera)) - 2.2;
    spotGroup.position.y = (visibleHeightAtZDepth(0, camera) / 2) - 0.2;
  } else {
    spotGroup.position.y = visibleHeightAtZDepth(0, camera) / 2;
  }

  spotGroup.rotation.set(Math.sin(time) / 2, 0, mouse.x);

  const spotGeometry = new THREE.CylinderBufferGeometry(0.1, 0.5, 1.5, 64);
  const spotMaterials = [
    new THREE.ShaderMaterial({
      uniforms: {
        time: { type: 'f', value: 0 }
      },
      vertexShader: glslify(vertex),
      fragmentShader: glslify(fragment),
      transparent: true,
      depthTest: false,
    }),
    new THREE.MeshBasicMaterial({ color: 0xFFF27B, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
  ];

  const spot = new THREE.Mesh(spotGeometry, spotMaterials);
  spot.name = "spot";
  spotGroup.add(spot);
  spot.position.y = -spotGeometry.parameters.height / 2;

  /* Call functions */
  resize();
  initCursorEventListeners();

  window.addEventListener("deviceorientation", onDeviceMove);
  window.addEventListener('mousemove', onMouseMove, false);
  window.addEventListener('resize', resize);
}


function animate() {
  // Update time
  time += 0.05;
  const spot = spotGroup.getObjectByName('spot');
  spot.material[0].uniforms.time.value = time;

  spotGroup.rotation.set(Math.sin(time / 2) / 2, 0, mouse.x);

  // Update images
  aboutMeData.forEach(data => {
    const image = portraitGroup.getObjectByName(data.url);
    if (image) {
      image.visible = data.visibilityCriterion(mouse);
    }
  });

  animationFrameId = requestAnimationFrame(animate);
  render();
}


function render() {
  renderer.render(scene, camera);
}


function start() {
  // Move the right navigation element on mobile
  if (window.innerWidth < 500) {
    document.querySelectorAll("#navigation__right").forEach(element => {
      element.classList.add("navigation__right_mobile");
    })
    // Move the right navigation element on tablet
  } else if (window.innerWidth < 1100) {
    document.querySelectorAll("#navigation__right").forEach(element => {
      element.classList.add("navigation__right_tablet");
    })
  }

  init();
  animate();
}

function stop() {
  document.querySelectorAll("#navigation__right").forEach(element => {
    element.classList.remove("navigation__right_tablet", "navigation__right_mobile");
  })

  // Remove hover state from cursor
  cursor.classList.remove('cursor__hover');

  cancelAnimationFrame(animationFrameId);
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

function onDeviceMove(event) {
  const limit = 30;
  mouse.x = - Math.min(1, event.gamma / limit);
  mouse.y = Math.min(1, event.beta / limit) * 3;
}


function onMouseMove(event) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  mouse.x = (event.clientX / canvasContainer.offsetWidth) * 2 - 1;
  mouse.y = - (event.clientY / canvasContainer.offsetHeight) * 2 + 1;
}

/*
 * Animations
 */
function playEnterAnimation() {
  const { textSelector, socialSelector, duration } = animationProps;

  const tl = gsap.timeline({ defaults: { duration, stagger: 0.2 } });
  tl.fromTo('#aboutMe__container',
    {
      opacity: 0,
      y: 30
    },
    {
      opacity: 1,
      y: 0
    })
    .fromTo(textSelector,
      {
        opacity: 0,
        x: -30
      },
      {
        opacity: 1,
        x: 0,
      })
    .fromTo(socialSelector,
      {
        opacity: 0,
        x: -30
      },
      {
        opacity: 1,
        x: 0,
      })
    .fromTo(navigationLeftSelector,
      {
        opacity: 0,
        x: 30
      },
      {
        opacity: 1,
        x: 0,
        duration: duration / 2
      })
    .fromTo(navigationRightSelector,
      {
        opacity: 0,
        x: -30
      },
      {
        opacity: 1,
        x: 0,
        duration: duration / 2
      });
}

/*
 * Exports
 */
export const startAboutMe = () => start();
export const stopAboutMe = () => stop();
