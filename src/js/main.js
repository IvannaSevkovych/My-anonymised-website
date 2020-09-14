/*
 * Imports
 */
// npm
import * as THREE from 'three';
import gsap from "gsap";
import { debounce } from "underscore";

// shaders
import iconVertex from './shaders/main/iconVertex.glsl';
import iconFragment from './shaders/main/iconFragment.glsl';
import fillerFragment from './shaders/main/fillerFragment.glsl';
import circleVertex from './shaders/main/circleVertex.glsl';
import circleFragment from './shaders/main/circleFragment.glsl';

// libs
import "./lib/_navigation";
import { cursor, initCursorEventListeners } from "./lib/_cursor";
import { loadModel } from './lib/_resource_loader';
import { navigationLeftSelector, navigationRightSelector } from './lib/_constants';


/*
 * Declarations
 */
// Constants
const OrbitControls = require('three-orbit-controls')(THREE);

const mouse = new THREE.Vector2(0, 0);
const mouseTarget = new THREE.Vector2(0, 0);

const mainPageData = [
  {
    url: '../models/arch.glb',
    profession: "Architect",
    id: 0,
  }, {
    url: '../models/3D.glb',
    profession: "3D Artist",
    id: 1,
  }, {
    url: '../models/coder.glb',
    profession: "Coder ;)",
    id: 2,
  }
];

const animationProps = {
  headerSelector: "#main__profession",
  subheaderSelector: "#main__turned",
  introDelay: 3,
  delay: 0.3,
  duration: 1.2,
  easeStart: "expo.in",
  easeEnd: "expo.out",
  introPlayed: false
}

const debounceTime = animationProps.duration * 2.4 * 1000;

// Variables
let animationFrameId;
let camera; let scene; let renderer; let container; let podium; let materialIcon; let materialFiller;
let time = 0;
let visibleIconNumber = 0;


/*
 * Functions
 */
function init() {
  /* Setup THREE boilerplate */
  scene = new THREE.Scene();

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);

  container = document.getElementById('main__container');
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.001, 100
  );
  camera.position.set(0, 0.6, 0.85);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enabled = false;

  /* Start custom stuff */

  podium = new THREE.Group();
  scene.add(podium);
  podium.position.set(0, 0.1, 0);


  // Icons/models
  materialIcon = new THREE.ShaderMaterial({
    extensions: {
      derivatives: '#extension GL_OES_standard_derivatives : enable',
    },
    uniforms: {
      time: { type: 'f', value: 0 },
      progress: { type: 'f', value: 0 },
      rotationDirection: { type: 'f', value: 1 },
    },
    vertexShader: iconVertex,
    fragmentShader: iconFragment,
  });

  materialFiller = new THREE.ShaderMaterial({
    extensions: {
      derivatives: '#extension GL_OES_standard_derivatives : enable',
    },
    uniforms: {
      time: { type: 'f', value: 0 },
      progress: { type: 'f', value: 0 },
      rotationDirection: { type: 'f', value: 1 },
    },
    vertexShader: iconVertex,
    fragmentShader: fillerFragment,
  });

  let iconsLoaded = 0;
  mainPageData.forEach(data => {
    loadModel(data).then(model => {

      data.geometry = model.scene.children[1].children[0].geometry;
      data.fillerGeometry = model.scene.children[1].children[1].geometry;

      if (data.id === visibleIconNumber) {
        const icon = new THREE.Mesh(data.geometry, materialIcon);
        icon.scale.set(0.3, 0.3, 0.3);
        icon.position.set(0, 0, 0.2);
        icon.rotation.y = 2 * Math.PI / 3;
        icon.name = "icon";
        podium.add(icon);

        const filler = new THREE.Mesh(data.fillerGeometry, materialFiller);
        filler.scale.set(0.3, 0.3, 0.3);
        filler.position.set(0, 0, 0.2);
        filler.rotation.y = 2 * Math.PI / 3;
        filler.name = "filler";
        podium.add(filler);
      }

      iconsLoaded++;
      if (iconsLoaded === mainPageData.length) {
        $("#loader_wrapper").fadeOut("slow", () => {
          if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
            coordinateAnimations();
          }
        });
      }
    });
  });

  // Circle
  const circleGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.001, 128);
  const circleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      radius: { type: "f", value: 0.47 }
    },
    vertexShader: circleVertex,
    fragmentShader: circleFragment,
    transparent: true
  });
  const circle = new THREE.Mesh(circleGeometry, circleMaterial);
  podium.add(circle);


  /* Call functions */
  resize();

  initCursorEventListeners();

  container.addEventListener('click', debounce(onClick, debounceTime, true));

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', onMouseMove);

  if (typeof DeviceOrientationEvent.requestPermission === 'function') {
    if (!animationProps.introPlayed) {
      $("#startButtonContainer").css('display', 'flex');
    } else {
      $("#startButtonContainer").css('display', 'none');
    }
    $("#startButton").on('click', debounce(onAppleClick, debounceTime, true));
  } else {
    window.addEventListener("deviceorientation", onDeviceMove);
  }

  if (window.innerWidth < 1100) {
    podium.scale.set(0.52, 0.52, 0.52);
    circle.scale.set(0.95, 0.95, 0.95);
    circle.position.z = 0.1;
    circle.material.uniforms.radius.value = 0.48;
    camera.fov = 100;
    camera.updateProjectionMatrix();
    camera.position.set(0, 0.35, 0.45);
  }
}


function animate() {
  // Update time for stripes animation
  time += 0.05;
  materialIcon.uniforms.time.value = time;

  // Calculate inertia
  mouseTarget.x -= 0.1 * (mouseTarget.x - mouse.x);
  mouseTarget.y -= 0.1 * (mouseTarget.y - mouse.y);

  // Rotate podium using the calculated inertia
  podium.rotation.x = mouseTarget.y / 14;
  podium.rotation.y = mouseTarget.x / 4;

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

  // Remove hover state from cursor
  cursor.classList.remove('cursor__hover');
}

/*
 * Helper functions and event listeners
 */
function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
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
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function onAppleClick() {
  // iOS 13+
  DeviceOrientationEvent.requestPermission()
    .then(response => {
      if (response === 'granted') {
        window.addEventListener("deviceorientation", onDeviceMove);
      }
    })
    .finally(() => {
      $("#startButtonContainer").hide('slow', coordinateAnimations);
    });
};


function onClick() {
  visibleIconNumber++;
  visibleIconNumber %= mainPageData.length;

  const nextIcon = mainPageData.filter(data => data.id === visibleIconNumber)[0];
  const { progress } = materialIcon.uniforms;

  const tl = gsap.timeline();
  tl.add(playIconAnimation(nextIcon, progress), 0);
  tl.add(playIconAnimation(nextIcon, materialFiller.uniforms.progress), 0);

  playTextAnimations(nextIcon.profession);
}

/*
 * Animations
 * TODO: maybe they can be extracted to a separate file in a reasonable way?
 */
function coordinateAnimations() {
  playEnterAnimation();

  if (!animationProps.introPlayed) {
    playIntroAnimation(container);
    animationProps.introPlayed = true;
  }
}

function playEnterAnimation() {
  const { headerSelector, duration } = animationProps;

  const tl = gsap.timeline({ defaults: { duration, stagger: 0.2 } });
  tl.fromTo('#main__container',
    {
      opacity: 0,
      y: 30
    },
    {
      opacity: 1,
      y: 0,
      onComplete: () => {
        const profession = document.querySelectorAll(headerSelector)[0];
        profession.innerHTML = mainPageData[visibleIconNumber].profession;
      }
    })
    .fromTo(headerSelector,
      {
        opacity: 0,
        y: 30
      },
      {
        opacity: 1,
        y: 0,
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

function playIntroAnimation(_container) {
  const { introDelay, duration } = animationProps;
  setTimeout(() => _container.click(), introDelay * 1000);
  setTimeout(() => _container.click(), (duration * 2.5 + introDelay) * 1000);
}

function playIconAnimation(nextIcon, progress) {

  const { duration, delay, easeStart, easeEnd } = animationProps;
  const icon = podium.getObjectByName("icon");
  const filler = podium.getObjectByName("filler");

  return gsap.timeline().to(progress, {
    value: 1,
    duration,
    delay,
    ease: easeStart,
    onComplete: () => {
      materialIcon.uniforms.rotationDirection.value = -1;
      icon.geometry.dispose();
      icon.geometry = nextIcon.geometry.clone();
      filler.geometry.dispose();
      filler.geometry = nextIcon.fillerGeometry.clone();
    }
  }).to(progress, {
    value: 0,
    duration: duration * 1.5,
    ease: easeEnd,
    onComplete: () => { materialIcon.uniforms.rotationDirection.value = 1 }
  });
}

function playTextAnimations(nextProfession) {
  const { duration, delay, easeStart, easeEnd, headerSelector, subheaderSelector } = animationProps;

  const tlProfession = gsap.timeline();
  tlProfession.to(headerSelector,
    {
      opacity: 0,
      rotateY: -50,
      duration,
      delay,
      ease: easeStart,
      onComplete: () => {
        const profession = document.querySelectorAll(headerSelector)[0];
        profession.innerHTML = nextProfession;
      }
    }
  )
    .to(headerSelector,
      {
        opacity: 1,
        rotateY: 0,
        duration: duration * 1.5,
        ease: easeEnd,
      }
    );

  // TODO trigger play via gsap instead of checking this expression?
  if (visibleIconNumber !== 0) {
    const tlTurned = gsap.timeline();
    tlTurned.fromTo(subheaderSelector,
      {
        opacity: 0,
        skewX: 50,
        skewY: 0,
        x: 50
      },
      {
        opacity: 1,
        x: -20,
        skewX: 0,
        duration,
        ease: easeEnd,
      }
    ).to(subheaderSelector,
      {
        opacity: 0,
        x: -50,
        skewY: 10,
        duration,
        ease: easeStart,
      }
    );
  }
}

/*
 * Exports
 */
export const startMain = () => start();
export const stopMain = () => stop();
