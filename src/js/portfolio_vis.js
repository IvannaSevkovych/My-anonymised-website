/*
 * Imports
 */
// npm
import * as THREE from 'three';
import gsap from "gsap";
import { debounce } from "underscore";

// shaders
import bgFragment from './shaders/portfolio/vis/bgFragment.glsl';
import bgVertex from './shaders/portfolio/vis/bgVertex.glsl';
import lowResFragment from './shaders/portfolio/vis/lowResFragment.glsl';
import lowResVertex from './shaders/portfolio/vis/lowResVertex.glsl';
import hdFragment from './shaders/portfolio/vis/hdFragment.glsl';
import hdVertex from './shaders/portfolio/vis/hdVertex.glsl';

// libs
import "./lib/_navigation";
import { cursor, initCursorEventListeners } from "./lib/_cursor";
import { loadImage } from './lib/_resource_loader';
import { navigationLeftSelector } from './lib/_constants';

const createInputEvents = require('simple-input-events');

require(`slick-carousel`);


/*
 * Declarations
 */
// Constants
const glslify = require('glslify');

const mouse = new THREE.Vector2(-1, 0);
const mouseTarget = new THREE.Vector2(0, 0);
const mouseGlobal = new THREE.Vector2(0, 0);
const mouseGlobalTarget = new THREE.Vector2(0, 0);
const imageGroupOffset = 0;

// TODO: replace text with texture
const imgURLs = [
  {
    hd: window.innerWidth <= 1100 ? '../img/portfolio/vis/bw_haus_nacht_512.jpg' : '../img/portfolio/vis/bw_haus_nacht_1024.jpg',
    lowres: '../img/portfolio/vis/bw_haus_nacht_256.jpg',
    name: "Baden-Württemberg Haus",
    company: "Werner Sobek Design GmbH",
    location: "Dubai UAE",
    // info: '../img/portfolio/vis/bw_haus_info.jpg'
  },
  {
    hd: window.innerWidth <= 1100 ? '../img/portfolio/vis/ah_esslingen_512.jpg' : '../img/portfolio/vis/ah_esslingen_1024.jpg',
    lowres: '../img/portfolio/vis/ah_esslingen_256.jpg',
    name: "AH Esslingen",
    company: "AH Aktiv-Haus GmbH",
    location: "Esslingen, Germany",
    // info: '../img/portfolio/vis/ah_esslingen_info.jpg'
  },
  {
    hd: window.innerWidth <= 1100 ? '../img/portfolio/vis/ah_bremen_512.jpg' : '../img/portfolio/vis/ah_bremen_1024.jpg',
    lowres: '../img/portfolio/vis/ah_bremen_256.jpg',
    name: "AH Bremen",
    company: "AH Aktiv-Haus GmbH",
    location: "Bremen, Germany",
    // info: '../img/portfolio/vis/ah_bremen_info.jpg'
  },
  {
    hd: window.innerWidth <= 1100 ? '../img/portfolio/vis/ah_innen_512.jpg' : '../img/portfolio/vis/ah_innen_1024.jpg',
    lowres: '../img/portfolio/vis/ah_innen_256.jpg',
    name: "AH Interior",
    company: "AH Aktiv-Haus GmbH",
    location: "Germany",
    // info: '../img/portfolio/vis/ah_innen_info.jpg'
  },
  {
    hd: window.innerWidth <= 1100 ? '../img/portfolio/vis/fulda_512.jpg' : '../img/portfolio/vis/fulda_1024.jpg',
    lowres: '../img/portfolio/vis/fulda_256.jpg',
    name: "Brücke Fulda",
    company: "Werner Sobek AG",
    location: "Fulda, Germany",
    // info: '../img/portfolio/vis/fulda_info.jpg'
  },
  {
    hd: window.innerWidth <= 1100 ? '../img/portfolio/vis/dock10_512.jpg' : '../img/portfolio/vis/dock10_1024.jpg',
    lowres: '../img/portfolio/vis/dock10_256.jpg',
    name: "Dock 10",
    company: "Werner Sobek Design GmbH",
    location: "Hamburg, Germany",
    // info: '../img/portfolio/vis/dock10_info.jpg'
  },
  {
    hd: window.innerWidth <= 1100 ? '../img/portfolio/vis/shepard_512.jpg' : '../img/portfolio/vis/shepard_1024.jpg',
    lowres: '../img/portfolio/vis/shepard_256.jpg',
    name: "Shepard’s house",
    company: "Werner Sobek Design GmbH",
    location: "New York, USA",
    // info: '../img/portfolio/vis/shepard_info.jpg'
  },
  {
    hd: window.innerWidth <= 1100 ? '../img/portfolio/vis/texoversum_512.jpg' : '../img/portfolio/vis/texoversum_1024.jpg',
    lowres: '../img/portfolio/vis/texoversum_256.jpg',
    name: "Texoversum",
    company: "Werner Sobek Design GmbH",
    location: "Reutlingen, Germany",
    // info: '../img/portfolio/vis/texoversum_info.jpg'
  },
]

const animationProps = {
  canvasBackgroundSelector: '#portfolio__vis__backgroundContainer',
  canvasContainerSelector: '#portfolio__vis__container',
  sliderLeftArrowSelector: '#portfolio__vis__arrows__left',
  sliderRightArrowSelector: '#portfolio__vis__arrows__right',
  duration: 0.7,
}

const debounceTime = 500;

// Variables
let animationFrameId;
let camera; let scene; let renderer; let backgroundCamera; let backgroundScene; let backgroundRenderer;
let bgMaterial; let lowResMaterial; let hdMaterial; let imageGroup; let visibleImage;
let time;

/*
 * Functions
 */

function initBackground() {
  /* Setup THREE boilerplate */
  const container = document.getElementById('portfolio__vis__backgroundContainer');

  backgroundScene = new THREE.Scene();

  backgroundRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  backgroundRenderer.setPixelRatio(window.devicePixelRatio);
  backgroundRenderer.setSize(window.innerWidth, window.innerHeight);

  container.appendChild(backgroundRenderer.domElement);

  backgroundCamera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    1, 1000
  );
  backgroundCamera.position.set(0, 0, 300);

  // Create background plane
  const bgGeometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight, 1, 1);
  bgMaterial = new THREE.ShaderMaterial({
    extensions: {
      derivatives: '#extension GL_OES_standard_derivatives : enable',
    },
    uniforms: {
      time: { type: 'f', value: 0 },
    },
    vertexShader: bgVertex,
    fragmentShader: bgFragment,
  });
  const bg = new THREE.Mesh(bgGeometry, bgMaterial);
  backgroundScene.add(bg);
}


function initGallery() {
  /* Setup THREE boilerplate */
  const container = document.getElementById('portfolio__vis__container__gallery');

  scene = new THREE.Scene();
  scene.destination = { x: 0, y: 0 };

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  container.appendChild(renderer.domElement);

  camera = new THREE.PerspectiveCamera(
    50,
    container.offsetWidth / container.offsetHeight,
    1, 1000
  );
  if (window.innerWidth > 1280) {
    camera.position.set(0, 0, 170);
  } else {
    camera.position.set(0, 0, 150);
  }

  /* Start custom stuff */
  // Create group for images
  imageGroup = new THREE.Group();
  scene.add(imageGroup);
  imageGroup.position.x = imageGroupOffset;

  // Create backplate plane for images
  const backplateGeometry = new THREE.PlaneGeometry(256 + 15, 144 + 15, 1, 1);
  const backplateMaterial = new THREE.MeshBasicMaterial({ color: 0x93CCC5 });
  const backplate = new THREE.Mesh(backplateGeometry, backplateMaterial);
  imageGroup.add(backplate);
  backplate.position.z = -1;

  // Create images
  createImages(imgURLs[visibleImage]);
}


function init() {

  initBackground();

  initGallery();

  /* Call functions */
  resize();
  window.addEventListener('resize', resize);

  initCursorEventListeners();

  const container = document.getElementById('portfolio__vis__container__gallery__mouse');
  const mouseEventGallery = createInputEvents(container);
  mouseEventGallery.on('move', ({ position }) => {
    mouse.x = position[0] / container.offsetWidth * 2 - 1;
    mouse.y = 1 - position[1] / container.offsetHeight * 2;
  });

  const mouseEventWindow = createInputEvents(window);
  mouseEventWindow.on('move', ({ position }) => {
    mouseGlobal.x = position[0] / window.innerWidth * 2 - 1;
    mouseGlobal.y = 1 - position[1] / window.innerHeight * 2;
  });

  const leftArrow = document.querySelector("#portfolio__vis__arrows__left");
  const rightArrow = document.querySelector("#portfolio__vis__arrows__right");
  leftArrow.addEventListener("click", debounce(prevImage, debounceTime, true));
  rightArrow.addEventListener("click", debounce(nextImage, debounceTime, true));
}

function animate() {
  // Update time for stripes animation
  time += 0.05;

  bgMaterial.uniforms.time.value = time;

  mouseTarget.x -= 0.1 * (mouseTarget.x - mouse.x);
  mouseTarget.y -= 0.1 * (mouseTarget.y - mouse.y);

  mouseGlobalTarget.x -= 0.1 * (mouseGlobalTarget.x - mouseGlobal.x);
  mouseGlobalTarget.y -= 0.1 * (mouseGlobalTarget.y - mouseGlobal.y);

  if (window.innerWidth > 1280) {
    const container = document.getElementById('portfolio__vis__container__gallery__mouse');
    container.style.transform = `rotateY(${(15 * mouseGlobalTarget.x) - 15}deg) rotateX(${5 * (mouseGlobalTarget.y)}deg) rotateZ(${0.5 * (mouseGlobalTarget.y)}deg)`;

    const containerInfo = document.getElementById('portfolio__vis__container__info');
    containerInfo.style.transform = `rotateY(${(25 * mouseGlobalTarget.x) + 65}deg)`;
  }

  // Update uniforms
  const hd = scene.getObjectByName('hd');
  const img = scene.getObjectByName('img');

  if (hd && img) {
    img.material.uniforms.time.value = time;
    hd.material.uniforms.time.value = time;
    img.geometry.attributes.position.needsUpdate = true;

    img.material.uniforms.mouse.value = mouse;
    hd.material.uniforms.mouse.value = mouse;
  }

  animationFrameId = requestAnimationFrame(animate);
  render();
}


function render() {
  renderer.render(scene, camera);
  backgroundRenderer.render(backgroundScene, backgroundCamera);
}


function start() {
  visibleImage = 0;
  time = 0;

  // If desktop, then use Three.js
  if (window.innerWidth > 1280) {
    document.querySelectorAll(".navigation__text").forEach(element => {
      element.classList.add("navigation__filled");
    });

    init();
    animate();
  } else {
    initMobile();
  }
}

function stop() {
  document.querySelectorAll(".navigation__text").forEach(element => {
    element.classList.remove("navigation__filled");
  })

  cursor.classList.remove('cursor__hover');

  cancelAnimationFrame(animationFrameId);
}

/*
 * Helper functions and event listeners
 */
function initMobile() {
  const container = document.getElementById('portfolio__vis__container__gallery');

  imgURLs.forEach(img => {
    const htmlImage = new Image();
    htmlImage.src = img.hd;
    htmlImage.alt = img.name;
    container.appendChild(htmlImage);
  });

  $('#portfolio__vis__container__gallery').slick({
    prevArrow: $('#portfolio__vis__arrows__left'),
    nextArrow: $('#portfolio__vis__arrows__right'),
    dots: true,
    slidesToShow: 1,
    swipe: true,
    touchThreshold: 750,
    fade: true,
    cssEase: 'ease',
    speed: 1000
  });

  const $name = $('#name');
  const $company = $('#company');
  const $location = $('#location');

  $('#portfolio__vis__container__gallery').on("afterChange", (event, slick, currentSlide) => {
    const currentImage = imgURLs[currentSlide];
    $name.text(currentImage.name)
    $company.text(currentImage.company);
    $location.text(currentImage.location);
  });

  $('#portfolio__vis__arrows').append($('#portfolio__vis__container__gallery .slick-dots'));

  $("#loader_wrapper").fadeOut("slow", () => playEnterAnimation());
}

function resize() {
  const container = document.getElementById('portfolio__vis__container__gallery');
  const imageWidth = container.offsetWidth;
  const imageHeight = container.offsetHeight;
  renderer.setSize(imageWidth, imageHeight);
  camera.aspect = imageWidth / imageHeight;
  camera.updateProjectionMatrix();

  const backgroundWidth = window.innerWidth;
  const backgroundHeight = window.innerHeight;
  backgroundRenderer.setSize(backgroundWidth, backgroundHeight);
  backgroundCamera.aspect = backgroundWidth / backgroundHeight;
  backgroundCamera.updateProjectionMatrix();
}


function createImages(urls) {
  const promiseHd = loadImage(urls.hd);
  const promiseLowres = loadImage(urls.lowres);

  Promise.all([promiseHd, promiseLowres]).then(textures => {

    const [hdTexture, lowResTexture] = textures;
    hdTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    hdTexture.minFilter = THREE.LinearFilter;

    const { width, height } = lowResTexture.image;
    const numPoints = width * height;

    lowResMaterial = new THREE.RawShaderMaterial({
      uniforms: {
        time: { type: 'f', value: 0 },
        texture: { type: 't', value: lowResTexture },
        textureSize: { type: 'v2', value: new THREE.Vector2(width, height) },
        mouse: { type: 'v2', value: new THREE.Vector2(-width, 0) },
        imageGroupOffset: { type: 'f', value: imageGroupOffset }
      },
      side: THREE.DoubleSide,
      vertexShader: glslify(lowResVertex),
      fragmentShader: glslify(lowResFragment),
      depthTest: false,
      transparent: true
    });

    const lowResGeometry = new THREE.InstancedBufferGeometry();

    // positions
    const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
    positions.setXYZ(0, -0.5, 0.5, 0.0);
    positions.setXYZ(1, 0.5, 0.5, 0.0);
    positions.setXYZ(2, -0.5, -0.5, 0.0);
    positions.setXYZ(3, 0.5, -0.5, 0.0);
    lowResGeometry.setAttribute('position', positions);

    // uvs
    const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
    uvs.setXYZ(0, 0.0, 0.0);
    uvs.setXYZ(1, 1.0, 0.0);
    uvs.setXYZ(2, 0.0, 1.0);
    uvs.setXYZ(3, 1.0, 1.0);
    lowResGeometry.setAttribute('uv', uvs);

    // index
    lowResGeometry.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 2, 3, 1]), 1));

    const tempOffsets = [];
    const tempIndices = [];

    for (let i = 0; i < numPoints; i++) {
      tempOffsets.push(i % width, Math.floor(i / width), 0);
      tempIndices.push(i);
    }

    const indices = Uint16Array.from(tempIndices);
    const offsets = Float32Array.from(tempOffsets);

    lowResGeometry.setAttribute('pindex', new THREE.InstancedBufferAttribute(indices, 1, false));
    lowResGeometry.setAttribute('offset', new THREE.InstancedBufferAttribute(offsets, 3, false));

    const img = new THREE.Mesh(lowResGeometry, lowResMaterial);
    img.name = 'img';
    imageGroup.add(img);

    // create THREE plane for the HD image
    const hdGeometry = new THREE.PlaneGeometry(width, height, 1, 1);
    hdMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { type: 'f', value: 0 },
        texture: { type: 't', value: hdTexture },
        textureSize: { type: 'v2', value: new THREE.Vector2(width, height) },
        mouse: { type: 'v2', value: new THREE.Vector2(-width, 0) },
        imageGroupOffset: { type: 'f', value: imageGroupOffset }
      },
      vertexShader: glslify(hdVertex),
      fragmentShader: glslify(hdFragment)
    });
    const imageHd = new THREE.Mesh(hdGeometry, hdMaterial);
    imageHd.name = 'hd';
    imageGroup.add(imageHd);

    $("#loader_wrapper").fadeOut("slow", () => playEnterAnimation());
  });
}


function updateImageTexture(urls) {
  const promiseHd = loadImage(urls.hd);
  const promiseLowres = loadImage(urls.lowres);

  Promise.all([promiseHd, promiseLowres]).then(textures => {

    const hd = imageGroup.getObjectByName('hd');
    const image = imageGroup.getObjectByName('img');

    const [hdTexture, lowresTexture] = textures;
    hdTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    hdTexture.minFilter = THREE.LinearFilter;

    hd.material.uniforms.texture.value = hdTexture;
    image.material.uniforms.texture.value = lowresTexture;
  });
}


function updateInfoBlock(data) {
  document.querySelector("#name").innerHTML = data.name;
  document.querySelector("#company").innerHTML = data.company;
  document.querySelector("#location").innerHTML = data.location;
}


function prevImage() {
  visibleImage--;
  visibleImage %= imgURLs.length;

  if (visibleImage === -1) {
    visibleImage += imgURLs.length;
  }

  updateImageTexture(imgURLs[visibleImage]);
  updateInfoBlock(imgURLs[visibleImage]);
}


function nextImage() {
  visibleImage++;
  visibleImage %= imgURLs.length;

  updateImageTexture(imgURLs[visibleImage]);
  updateInfoBlock(imgURLs[visibleImage]);
}


/*
 * Animations
 */
function playEnterAnimation() {
  const { duration, canvasContainerSelector, sliderLeftArrowSelector, sliderRightArrowSelector, canvasBackgroundSelector } = animationProps;

  const tl = gsap.timeline({ defaults: { duration, stagger: 0.2 } });
  tl.fromTo(canvasBackgroundSelector,
    {
      opacity: 0,
    },
    {
      opacity: 1,
    })
    .fromTo(canvasContainerSelector,
      {
        opacity: 0,
        y: 30,
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
    .fromTo(sliderLeftArrowSelector,
      {
        opacity: 0,
        scale: 0,
        x: 50
      },
      {
        opacity: 1,
        scale: 1,
        x: 0,
        duration: duration / 2,
      })
    .fromTo(sliderRightArrowSelector,
      {
        opacity: 0,
        scale: 0,
        x: -50
      },
      {
        opacity: 1,
        scale: 1,
        x: 0,
        duration: duration / 2,
      }, "-=0.35");
}


/*
 * Exports
 */
export const startPortfolioVis = () => start();
export const stopPortfolioVis = () => stop();
