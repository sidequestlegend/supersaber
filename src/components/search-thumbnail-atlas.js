var CANVAS_HEIGHT = 512;  // Power-of-two.
var HEIGHT = 64;
var NUM_PER_PAGE = 6;
var WIDTH = 64;

// Apply height factor since the images don't reach the power-of-two height, need to stretch.
var HEIGHT_FACTOR = CANVAS_HEIGHT / (HEIGHT * NUM_PER_PAGE);

/**
 * Create thumbnail atlas for all the thumbnail images together per page.
 */
AFRAME.registerComponent('search-thumbnail-atlas', {
  dependencies: ['geometry', 'material'],

  schema: {
    dummyUpdater: {type: 'string'}
  },

  init: function () {
    const canvas = this.canvas = document.createElement('canvas');
    canvas.height = CANVAS_HEIGHT;  // Power-of-two.
    canvas.width = WIDTH;

    this.ctx = canvas.getContext('2d');
    this.clearCanvas();
    document.body.appendChild(canvas);

    this.el.setAttribute('material', 'src', canvas);
    this.images = [];
  },

  update: function () {
    var el = this.el;
    var data = this.data;

    const results = el.sceneEl.systems.state.state.searchResultsPage;
    for (let i = 0; i < results.length; i++) {
      let img = this.images[i] = this.images[i] || document.createElement('img');
      img.crossOrigin = 'anonymous';
      img.src = `https://s3-us-west-2.amazonaws.com/supersaber/${results[i].id}-image.jpg`;
      if (img.complete) {
        this.draw(img, i);
      } else {
        img.onload = () => {
          this.draw(img, i);
        };
      }
    }
  },

  /**
   * Draw thumbnail on canvas at row i.
   */
  draw: function (img, i) {
    this.ctx.drawImage(
      img,
      0,
      i * HEIGHT * HEIGHT_FACTOR,
      WIDTH,
      HEIGHT * HEIGHT_FACTOR);
    this.el.getObject3D('mesh').material.map.needsUpdate = true;
  },

  clearCanvas: function () {
    const canvas = this.canvas;
    this.ctx.fillStyle = '#111';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
});
