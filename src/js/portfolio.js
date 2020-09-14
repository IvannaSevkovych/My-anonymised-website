/*
 * Imports
 */
// npm
import * as THREE from 'three';
import gsap from "gsap";

// shaders
import iconFragment from './shaders/portfolio/iconFragment.glsl';
import iconVertex from './shaders/portfolio/iconVertex.glsl';
import sphereFragment from './shaders/portfolio/sphereFragment.glsl';
import sphereVertex from './shaders/portfolio/sphereVertex.glsl';

// libs
import { goto } from "./lib/_navigation";
import { cursor, initCursorEventListeners } from "./lib/_cursor";
import { loadModel } from './lib/_resource_loader';
import { navigationLeftSelector, navigationRightSelector } from './lib/_constants';

require(`slick-carousel`);
const createInputEvents = require('simple-input-events');


/*
 * Declarations
 */
// Constants
const portfolioData = [
  {
    htmlId: 'portfolio__container__vis',
    url: '../models/stills.glb',
    gotoUrl: '../portfolio_vis.html',
    inertia: new THREE.Vector2(1.2, 1),
    id: 0,
    mouse: new THREE.Vector2(0, 0),
    mouseTarget: new THREE.Vector2(0, 0),
  },
  {
    htmlId: 'portfolio__container__tour',
    url: '../models/cardboards.glb',
    gotoUrl: 'https://vtour.sevkovych.com',
    inertia: new THREE.Vector2(2, 1),
    id: 1,
    mouse: new THREE.Vector2(0, 0),
    mouseTarget: new THREE.Vector2(0, 0),
  },
  {
    htmlId: 'portfolio__container__codes',
    url: '../models/code.glb',
    gotoUrl: '../portfolio_codes.html',
    inertia: new THREE.Vector2(1.2, 1),
    id: 2,
    mouse: new THREE.Vector2(0, 0),
    mouseTarget: new THREE.Vector2(0, 0),
  }
];

const animationProps = {
  canvasContainerSelector: '#portfolio__container',
  headerSelector: "#portfolio__social",
  arrowsSelector: "#portfolio__arrows",
  duration: 0.7,
  stagger: 0.2
}

// Variables
let animationFrameId; let moveEvent; let time;
let nextUrl = null;
let blockCursorUpdate = true;


/*
 * Functions
 */
function init() {

  let modelsLoaded = 0;

  portfolioData.forEach(data => {

    /* Setup THREE boilerplate */
    const canvasContainer = document.getElementById(data.htmlId);
    data.canvasContainer = canvasContainer;

    const scene = new THREE.Scene();
    data.scene = scene;

    const camera = new THREE.PerspectiveCamera(
      10,
      1,
      0.001, 1000
    );
    camera.position.set(0, 150, 300);
    camera.lookAt(0, 0, 0);
    data.camera = camera;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(canvasContainer.offsetWidth, canvasContainer.offsetWidth);
    data.renderer = renderer;

    canvasContainer.appendChild(renderer.domElement);

    const raycaster = new THREE.Raycaster();
    data.raycaster = raycaster;


    /* Start custom stuff */
    //  spheres for icons
    scene.add(newSphere(data.gotoUrl));

    // Create icons
    const materialIcon = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms: {
        time: { type: 'f', value: 0 },
        mousePosition: { type: "v3", value: new THREE.Vector3(0, 0, 0) },
        pointSize: { type: 'f', value: window.innerWidth <= 1100 ? 600 : 200 },
      },
      vertexShader: iconVertex,
      fragmentShader: iconFragment,
    });

    loadModel(data).then(model => {
      const icon = new THREE.Points(model.scene.children[1].geometry, materialIcon);
      scene.add(icon);

      modelsLoaded++;
      if (modelsLoaded === portfolioData.length) {
        $("#loader_wrapper").fadeOut("slow", () => playEnterAnimation());
      }
    });

    canvasContainer.getElementsByTagName('canvas')[0].addEventListener('click', onClick);
  });


  if (window.innerWidth <= 500) {
    // Load Slick
    jQuery(() => {
      $("#portfolio__container").slick({
        prevArrow: $('#portfolio__arrows__left'),
        nextArrow: $('#portfolio__arrows__right'),
        dots: true,
        slidesToShow: 1,
        variableWidth: true,
        swipe: true,
        touchThreshold: 750,
      });
    });
  }

  if (window.innerWidth <= 1100) {
    // Hide spheres
    portfolioData.forEach(data => {
      data.scene.getObjectByName('sphere').visible = false;
      data.mouse.x = 2;
      data.mouse.y = 2;
    })
  }

  resize();
  window.addEventListener('resize', resize);

  if (window.innerWidth > 500) {
    initCursorEventListeners();
  }

  moveEvent = createInputEvents(window);
  moveEvent.on('move', ({ position }) => onMouseMove(position));
}

function animate() {
  // Update time for stripes animation
  time += 0.05;

  let foundIntersect = false;
  portfolioData.forEach(data => {
    const { scene, raycaster, camera, inertia, mouse, mouseTarget } = data;

    // Calculate intertia
    if (Math.abs(mouse.x) <= 1 && Math.abs(mouse.y) <= 1) {
      mouseTarget.x -= 0.01 * (mouseTarget.x - mouse.x);
      mouseTarget.y -= 0.01 * (mouseTarget.y - mouse.y);
    }

    if (window.innerWidth > 1280) {
      // Rotate groups using the calculated inertia
      scene.rotation.x = -mouseTarget.y / inertia.y;
      scene.rotation.y = mouseTarget.x / inertia.x;
    } else {
      scene.rotation.x = Math.sin(time / 5) * Math.PI / 14;
      scene.rotation.y = Math.sin(time / 6) * Math.PI / 6;
    }

    const sphere = scene.getObjectByName('sphere');
    sphere.material.uniforms.time.value = time;
    sphere.material.uniforms.threshold.value -= 0.05;
    sphere.material.uniforms.threshold.value = Math.max(sphere.material.uniforms.threshold.value, 0);

    // Raycaster intersect
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([sphere]);

    if (intersects.length) {
      sphere.material.uniforms.threshold.value += 0.1;
      sphere.material.uniforms.threshold.value = Math.min(sphere.material.uniforms.threshold.value, 1);
      nextUrl = sphere.userData.gotoUrl;
      foundIntersect = true;
    }
  });

  if (foundIntersect) {
    cursor.classList.add('cursor__hover');
    blockCursorUpdate = false;
  } else {
    nextUrl = null;
    if (!blockCursorUpdate) {
      blockCursorUpdate = true;
      cursor.classList.remove('cursor__hover');
    }
  }

  animationFrameId = requestAnimationFrame(animate);

  render();
}

function render() {
  portfolioData.forEach(data => {
    const { renderer, scene, camera } = data;
    renderer.render(scene, camera);
  });
}

function start() {
  time = 0;

  init();
  animate();
}

function stop() {
  cancelAnimationFrame(animationFrameId);

  // Remove hover state from cursor
  cursor.classList.remove('cursor__hover');

  moveEvent.disable();
}

/*
 * Helper functions and event listeners
 */
function newSphere(_nextUrl) {
  const sphereMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
      time: { type: 'f', value: 0 },
      threshold: { type: 'f', value: 0.5 }
    },
    vertexShader: sphereVertex,
    fragmentShader: sphereFragment,
  });

  const sphereGeometry = new THREE.SphereBufferGeometry(17.5, 128, 128);

  const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphere.name = 'sphere';
  sphere.userData.gotoUrl = _nextUrl;
  return sphere;
}

function resize() {
  portfolioData.forEach(data => {
    const { renderer, canvasContainer, camera } = data;
    const w = canvasContainer.offsetWidth;
    renderer.setSize(w, w);
    camera.aspect = 1;
    camera.updateProjectionMatrix();
  });
}

function onMouseMove(position) {
  // calculate mouse position in normalized device coordinates
  // (-1 to +1) for both components
  const x = position[0];
  const y = position[1];

  portfolioData.forEach(data => {
    const { htmlId, mouse } = data;

    const canvasContainer = document.getElementById(htmlId);
    const { left, right, width, bottom, top, height } = canvasContainer.getBoundingClientRect();

    if (x < left) {
      mouse.x = -1;
    } else if (x > right) {
      mouse.x = 1;
    } else {
      mouse.x = ((x - left) / width) * 2 - 1;
    }

    if (y > bottom) {
      mouse.y = -1;
    } else if (y < top) {
      mouse.y = 1;
    } else {
      mouse.y = -1 - 2 * ((y - bottom) / height);
    }
  });
}

function onClick() {
  if (nextUrl != null) {
    const url = nextUrl;

    if (url === 'https://vtour.sevkovych.com') {
      nextUrl = null;
      window.open(url, '_blank');
      return;
    }

    stop();
    goto(url);
  }
}

/*
 * Animations
 */
function playEnterAnimation() {
  const { canvasContainerSelector, headerSelector, duration, stagger, arrowsSelector } = animationProps;

  const tl = gsap.timeline({ defaults: { duration, stagger } });
  tl.fromTo(canvasContainerSelector,
    {
      opacity: 0,
      y: 30,
    },
    {
      opacity: 1,
      y: 0,
    })
    .fromTo(headerSelector,
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
      })
    .fromTo(arrowsSelector,
      {
        opacity: 0,
      },
      {
        opacity: 1,
        duration
      }, "0");
}

/*
 * Exports
 */
export const startPortfolio = () => start();
export const stopPortfolio = () => stop();
