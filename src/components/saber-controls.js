AFRAME.registerComponent('saber-controls', {
  schema: {
    hand: {default: 'left', oneOf: ['left', 'right']}
  },

  colors: {
    right: '#78aaff', // Blue
    left: '#ffa8a8' // Red
  },

  init: function () {
    var el = this.el;
    var data = this.data;
    el.setAttribute('oculus-touch-controls', {hand: data.hand, model: false});
    el.setAttribute('vive-controls', {hand: data.hand, model: true});
    el.setAttribute('windows-motion-controls', {hand: data.hand, model: false});
    el.addEventListener('controllerconnected', this.initSaber.bind(this));
  },
  

  initSaber: function () {
    var el = this.el;
    var saberHandleEl = document.createElement('a-entity');
    var saberEl = this.saberEl = document.createElement('a-entity');
    var saberPivotEl = document.createElement('a-entity');
    var highlightTop = document.createElement('a-entity');
    var highlightBottom = document.createElement('a-entity');

    this.boundingBox = new THREE.Box3();

    saberEl.setAttribute('material', {shader: 'flat', color: this.colors[this.data.hand]});
    saberEl.setAttribute('geometry', {primitive: 'box', height: 0.9, depth: 0.020, width: 0.020});
    saberEl.setAttribute('position', '0 -0.55 0');

    saberHandleEl.setAttribute('material', {shader: 'flat', color: '#151515'});
    saberHandleEl.setAttribute('geometry', {primitive: 'box', height: 0.2, depth: 0.025, width: 0.025});
    saberHandleEl.setAttribute('position', '0 0 0');

    highlightTop.setAttribute('material', {shader: 'flat', color: this.colors[this.data.hand]});
    highlightTop.setAttribute('geometry', {primitive: 'box', height: 0.18, depth: 0.005, width: 0.005});
    highlightTop.setAttribute('position', '0 0 0.0125');

    highlightBottom.setAttribute('material', {shader: 'flat', color: this.colors[this.data.hand]});
    highlightBottom.setAttribute('geometry', {primitive: 'box', height: 0.18, depth: 0.005, width: 0.005});
    highlightBottom.setAttribute('position', '0 0 -0.0125');

    saberHandleEl.appendChild(highlightTop);
    saberHandleEl.appendChild(highlightBottom)

    saberPivotEl.setAttribute('rotation', '90 0 0');
    saberPivotEl.appendChild(saberHandleEl);
    saberPivotEl.appendChild(saberEl);
    el.appendChild(saberPivotEl);
  },

  tick: function () {
    if (!this.saberEl) { return; }
    this.boundingBox.setFromObject(this.saberEl.getObject3D('mesh'));
  }

});