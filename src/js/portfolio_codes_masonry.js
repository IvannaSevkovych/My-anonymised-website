/*
 * Imports
 */
// npm
import * as PIXI from 'pixi.js';

// shaders
import backgroundFragment from './shaders/portfolio/codes/masonryBackgroundFragment.glsl';
import stageFragment from './shaders/portfolio/codes/masonryStageFragment.glsl';

// libs
import "./lib/_navigation";
import { cursor, initCursorEventListeners } from "./lib/_cursor";
import { Grid } from "./lib/_masonry_grid";
import { playEnterAnimation } from './lib/_animation_template_codes';


/*
 * Declarations
 */
// Constants
const IMAGE_PADDING = 10;

// Settings for grid
const GRID_SIZE = 50;
const GRID_MIN = 3;


// Variables
let container; let app; let background; let width; let height; let uniforms;
// Target for pointer. If down, value is 1, else value is 0
let pointerDownTarget = 0;
let pointerDiffStart = new PIXI.Point();
const pointerStart = new PIXI.Point();
let diffX; let diffY;
let imageContainer; let images; let imagesUrls;
let resizeTimer;
// Variables and settings for grid
let gridColumnsCount; let gridRowsCount; let gridColumns; let gridRows; let grid;
let widthRest; let heightRest; let centerX; let centerY; let rects;


/*
 * Helper functions
 */
function start() {
  if (window.innerWidth < 1280) {
    $("#codes__info__instruction").html("Tap & drag");
  }

  $("#loader_wrapper").fadeOut("slow", () => { playEnterAnimation() });
  init();
}


function stop() {
  clean();
  container.removeChild(container.getElementsByTagName('canvas')[0]);
  cursor.classList.remove("cursor__hover");
}


function initDimensions() {
  width = container.offsetWidth;
  height = container.offsetHeight;
  diffX = 0;
  diffY = 0;
}


function init() {
  container = document.getElementById('container');

  initCursorEventListeners();

  initDimensions();

  // Set initial values for uniforms
  uniforms = {
    uResolution: new PIXI.Point(width, height),
    uPointerDown: pointerDownTarget,
    uPointerDiff: new PIXI.Point()
  }

  initGrid();

  // Create fallback canvas
  const canvas = document.createElement('canvas');
  container.appendChild(canvas);

  // Create PIXI Application object
  app = new PIXI.Application({
    view: canvas,
    width,
    height,
  });
  app.renderer.autoDensity = true;

  initBackground();

  initDistortion();

  initImageContainer();

  initRectsAndImages();

  initEvents();

  app.ticker.add(() => {
    uniforms.uPointerDown += (pointerDownTarget - uniforms.uPointerDown) * 0.075;
    uniforms.uPointerDiff.x += (diffX - uniforms.uPointerDiff.x) * 0.2;
    uniforms.uPointerDiff.y += (diffY - uniforms.uPointerDiff.y) * 0.2;
    imageContainer.x = uniforms.uPointerDiff.x - centerX;
    imageContainer.y = uniforms.uPointerDiff.y - centerY;

    checkRectsAndImages()
  });
}


// Clean the current Application
function clean() {
  // Stop the current animation
  app.ticker.stop();
  // Remove event listeners
  app.stage
    .off("pointerdown", onPointerDown)
    .off('pointerup', onPointerUp)
    .off('pointerupoutside', onPointerUp)
    .off('pointermove', onPointerMove);
  // Abort all fetch calls in progress
  rects.forEach((rect) => {
    if (rect.discovered && !rect.loaded) {
      rect.controller.abort();
    }
  });
}


function initBackground() {
  // Create an empty sprite and define its size
  background = new PIXI.Sprite();
  background.width = width;
  background.height = height;

  // Create a new Filter using the fragment shader
  // We don't need a custom vertex shader, so we set it as `undefined`
  const backgroundFilter = new PIXI.Filter(undefined, backgroundFragment, uniforms);

  // Assign the filter to the background sprite
  background.filters = [backgroundFilter];

  // Add the background to the stage
  app.stage.addChild(background);
}


// Sets the distortion filter for the entire stage
function initDistortion() {
  const stageFilter = new PIXI.Filter(undefined, stageFragment, uniforms);
  app.stage.filters = [stageFilter];
}


function initEvents() {
  // Make stage interactive so it can listen to events
  app.stage.interactive = true;

  // Set multiple mouse listeners
  app.stage
    .on("pointerdown", onPointerDown)
    .on('pointerup', onPointerUp)
    .on('pointerupoutside', onPointerUp)
    .on('pointermove', onPointerMove);

  window.addEventListener('resize', onResize);
}


// Apply distortion filter when mouse is clicked
function onPointerDown(e) {
  pointerDownTarget = 1;

  const { x, y } = e.data.global;
  pointerStart.set(x, y);
  pointerDiffStart = uniforms.uPointerDiff.clone();
};


// Remove distortion filter when mouse is unclicked
function onPointerUp() {
  pointerDownTarget = 0;
};


function onPointerMove(e) {
  const { x, y } = e.data.global;
  if (pointerDownTarget) {
    diffX = pointerDiffStart.x + (x - pointerStart.x);
    diffY = pointerDiffStart.y + (y - pointerStart.y);
    diffX = diffX > 0 ? Math.min(diffX, centerX + IMAGE_PADDING) : Math.max(diffX, -(centerX + widthRest));
    diffY = diffY > 0 ? Math.min(diffY, centerY + IMAGE_PADDING) : Math.max(diffY, -(centerY + heightRest));
  }
};


// On resize, reinit the app (clean and init)
// But first debounce the calls, so we don't call init too often
function onResize() {
  if (resizeTimer) {
    clearTimeout(resizeTimer);
  }
  resizeTimer = setTimeout(() => {
    clean();
    init();
  }, 200);
};


// Initialize the random grid layout
function initGrid() {
  gridColumnsCount = Math.ceil(width / GRID_SIZE);
  gridRowsCount = Math.ceil(height / GRID_SIZE);
  // Make the grid 5 times bigger than viewport
  gridColumns = gridColumnsCount * 5;
  gridRows = gridRowsCount * 5;
  // Create a new Grid instance with our settings
  grid = new Grid(GRID_SIZE, gridColumns, gridRows, GRID_MIN);
  // Calculate the center position for the grid in the viewport
  widthRest = Math.ceil(gridColumnsCount * GRID_SIZE - width);
  heightRest = Math.ceil(gridRowsCount * GRID_SIZE - height);
  centerX = (gridColumns * GRID_SIZE / 2) - (gridColumnsCount * GRID_SIZE / 2);
  centerY = (gridRows * GRID_SIZE / 2) - (gridRowsCount * GRID_SIZE / 2);
  // Generate the list of rects
  rects = grid.generateRects();
  // For the list of images
  images = [];
  // For storing the image URL and avoid duplicates
  imagesUrls = {};
}


// Initialize a Container element for solid rectangles and images
function initImageContainer() {
  imageContainer = new PIXI.Container();
  app.stage.addChild(imageContainer);
}


// Add solid rectangles and images
function initRectsAndImages() {
  const graphics = new PIXI.Graphics();
  graphics.beginFill(0xffffff);
  rects.forEach(rect => {
    // Create a new Sprite element for each image
    const image = new PIXI.Sprite();
    // Set image's position and size
    image.x = rect.x * GRID_SIZE;
    image.y = rect.y * GRID_SIZE;
    image.width = rect.w * GRID_SIZE - IMAGE_PADDING;
    image.height = rect.h * GRID_SIZE - IMAGE_PADDING;
    // Set it's alpha to 0, so it is not visible initially
    image.alpha = 0;
    // Add image to the list
    images.push(image);
    // Draw the rectangle
    graphics.drawRect(image.x, image.y, image.width, image.height);
  });
  graphics.endFill();
  imageContainer.addChild(graphics);
  // Add all new Sprites to the container
  images.forEach(image => {
    imageContainer.addChild(image);
  });
}


// Load images from unsplash.com
function loadTextureForImage(index) {
  // Get image Sprite
  const image = images[index];

  // Set the url to get a random image from Unsplash Source, given image dimensions
  const url = `https://source.unsplash.com/random/${image.width}x${image.height}`;

  // Get the corresponding rect
  const rect = rects[index];

  // Create a new AbortController, to abort fetch if needed
  rect.controller = new AbortController();

  // Fetch the image, and react to promise
  fetch(url, rect.controller).then(response => {
    // Get image URL, and if it was downloaded before, load another image
    // Otherwise, save image URL and set the texture
    const id = response.url.split('?')[0];
    if (imagesUrls[id]) {
      loadTextureForImage(index);
    }
    else {
      imagesUrls[id] = true;
      image.texture = PIXI.Texture.from(response.url);
      rect.loaded = true;
    }
  }).catch(() => {
    // Catch errors silently, for not showing the following error message if it is aborted:
    // AbortError: The operation was aborted.
  });
}


// Check if rects intersects with the viewport
// and loads corresponding image
function checkRectsAndImages() {
  // Loop over rects
  rects.forEach((rect, index) => {
    // Get corresponding image
    const image = images[index];

    // Check if the rect intersects with the viewport
    if (rectIntersectsWithViewport(rect)) {
      // If rect just has been discovered start loading image
      if (!rect.discovered) {
        rect.discovered = true;
        loadTextureForImage(index);
      }

      // If image is loaded, increase alpha if possible
      if (rect.loaded && image.alpha < 1) {
        image.alpha += 0.01;
      }
    } else {
      // The rect is not intersecting
      // If the rect was in viewport before, but the
      // image is not loaded yet, abort the fetch
      if (rect.discovered && !rect.loaded) {
        rect.discovered = false;
        rect.controller.abort();
      }
      // Decrease alpha if possible
      if (image.alpha > 0) {
        image.alpha -= 0.01;
      }
    }
  })
}


// Check if a rect intersects the viewport
function rectIntersectsWithViewport(rect) {
  return (
    rect.x * GRID_SIZE + imageContainer.x <= width &&
    (rect.x + rect.w) * GRID_SIZE + imageContainer.x >= 0 &&
    rect.y * GRID_SIZE + imageContainer.y <= height &&
    (rect.y + rect.h) * GRID_SIZE + imageContainer.y >= 0
  );
}


/*
 * Exports
 */
export const startMasonry = () => start();
export const stopMasonry = () => stop();