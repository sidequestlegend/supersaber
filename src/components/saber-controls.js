AFRAME.registerComponent('saber-controls', {
  schema: {
    hand: {default: 'right', oneOf: ['left', 'right']},
    bladeEnabled: {default: true}
  },

  colors: {
    right: '#78aaff', // Blue
    left: '#ffa8a8' // Red
  },

  init: function () {
    var el = this.el;
    var data = this.data;
    el.addEventListener('controllerconnected', this.initSaber.bind(this));

    const hand = {hand: data.hand, model: false};
    el.setAttribute('oculus-touch-controls', hand);
    el.setAttribute('vive-controls', hand);
    el.setAttribute('windows-motion-controls', hand);
  },

  update: function () {
    if (!this.bladeEl) { return; }
    this.bladeEl.object3D.visible = this.data.bladeEnabled;
    if (this.data.bladeEnabled) {
      this.bladeElPivot.object3D.scale.set(0.0001, 0.001, 0.0001);
      this.bladeEl.emit('drawblade');
    }
  },

  tick: function () {
    if (!this.bladeEl || !this.bladeEl.getObject3D('mesh')) { return; }
    this.boundingBox.setFromObject(this.bladeEl.getObject3D('mesh'));
  },

  initSaber: function (evt) {
    var el = this.el;
    var saberHandleEl = document.createElement('a-entity');
    var bladeEl = this.bladeEl = document.createElement('a-entity');
    var bladeElPivot = this.bladeElPivot = document.createElement('a-entity');
    var saberPivotEl = document.createElement('a-entity');
    var highlightTop = document.createElement('a-entity');
    var highlightBottom = document.createElement('a-entity');
    var controllerConfig = this.config[evt.detail.name];

    this.boundingBox = new THREE.Box3();

    bladeEl.setAttribute('material', {shader: 'flat', color: this.colors[this.data.hand]});
    bladeEl.setAttribute('geometry', {primitive: 'box', height: 0.9, depth: 0.020, width: 0.020});
    bladeEl.setAttribute('position', '0 -0.55 0');
    bladeEl.setAttribute('play-sound', {event: 'drawblade', sound: "#saberDraw"});
    bladeEl.object3D.visible = this.data.bladeEnabled;

    // For blade saber draw animation.
    bladeElPivot.appendChild(bladeEl);
    bladeElPivot.setAttribute('animation', 'property: scale; from: 0 0 0; to: 1.0 1.0 1.0; dur: 750; easing: linear; startEvents: drawblade');

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
    saberPivotEl.appendChild(bladeElPivot);
    el.appendChild(saberPivotEl);

    this.controllerConnected = true;
    this.controllerType = evt.detail.name;

    el.setAttribute('cursor', controllerConfig.cursor || {});
  },

  config: {
    'oculus-touch-controls': {
      cursor: {
        downEvents: [
          'triggerdown',
          'gripdown',
          'abuttondown',
          'bbuttondown',
          'xbuttondown',
          'ybuttondown',
        ],
        upEvents: [
          'triggerup',
          'gripup',
          'abuttonup',
          'bbuttonup',
          'xbuttonup',
          'ybuttonup',
        ],
      },
    },

    'vive-controls': {
      cursor: {
        downEvents: ['trackpaddown', 'triggerdown', 'gripdown'],
        upEvents: ['trackpadup', 'triggerup', 'gripup'],
      },
    },

    'windows-motion-controls': {
      cursor: {
        downEvents: ['trackpaddown', 'triggerdown', 'gripdown'],
        upEvents: ['trackpadup', 'triggerup', 'gripup'],
      },
    }
  }
});
