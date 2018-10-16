/**
 * Controller, cursor, raycaster.
 */
AFRAME.registerComponent('saber-controls', {
  schema: {
    bladeEnabled: {default: false},
    hand: {default: 'right', oneOf: ['left', 'right']},
    isPaused: {default: false},
    strokeDuration: {default: 100},
    strokeSpeed: {default: 2000}
  },

  init: function () {
    var el = this.el;
    var data = this.data;

    this.boundingBox = new THREE.Box3();
    this.controllerType = '';
    this.bladeEl = el.querySelector('.blade');
    this.bladeTipPosition = new THREE.Vector3();
    this.bladeTipPreviousPosition = new THREE.Vector3();
    this.swinging = false;
    this.strokeCount = 0;

    el.addEventListener('controllerconnected', this.initSaber.bind(this));

    const hand = {hand: data.hand, model: false};
    el.setAttribute('oculus-touch-controls', hand);
    el.setAttribute('vive-controls', hand);
    el.setAttribute('windows-motion-controls', hand);

    this.bladeEl = this.el.querySelector('.blade');
  },

  update: function (oldData) {
    if (!oldData.bladeEnabled && this.data.bladeEnabled) {
      this.bladeEl.emit('drawblade');
    }
  },

  tick: function (time, delta) {
    if (!this.data.bladeEnabled) { return; }
    this.boundingBox.setFromObject(this.bladeEl.getObject3D('mesh'));
    this.detectStroke(delta);
  },

  initSaber: function (evt) {
    this.controllerType = evt.detail.name;
    const config = this.config[this.controllerType] || {};
    this.configureRaycaster(config);
  },

  /**
   * Rotate laser to match raycaster origin and direction, which are angled down for comfort.
   */
  configureRaycaster: function (config) {
    this.el.setAttribute('cursor', config.cursor);
    this.el.setAttribute('raycaster', config.raycaster);

    const laser = this.el.querySelector('.laser');
    laser.object3D.position.copy(config.raycaster.origin);
    laser.object3D.rotation.x = -Math.atan(
      Math.abs(config.raycaster.direction.y) /
      Math.abs(config.raycaster.direction.z)
    )
  },

  detectStroke: function (delta) {
    var bladeObject
    var distance;
    var data = this.data;

    this.bladeTipPosition.set(0, 0.4, 0);
    bladeObject = this.el.object3D;
    bladeObject.parent.updateMatrixWorld();

    bladeObject.localToWorld(this.bladeTipPosition);
    distance = this.bladeTipPosition.distanceTo(this.bladeTipPreviousPosition) * 1000000;
    if (distance > data.strokeSpeed) {
      if (!this.startSwinging) {
        this.startSwinging = true;
        this.swingDuration = 0;
      }
      if (this.swingDuration > data.strokeDuration) {
        this.swinging = true;
      } else {
        this.swingDuration += delta;
      }
    } else {
      this.swinging = false;
      this.startSwinging = false;
    }

    this.bladeTipPreviousPosition.copy(this.bladeTipPosition);
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
          'ybuttondown'
        ],
        upEvents: [
          'triggerup',
          'gripup',
          'abuttonup',
          'bbuttonup',
          'xbuttonup',
          'ybuttonup'
        ]
      },
      raycaster: {
        direction: new THREE.Vector3(0, -2, -1).normalize(),
        origin: {x: 0, y: 0, z: -0.1}
      }
    },

    'vive-controls': {
      cursor: {
        downEvents: ['trackpaddown', 'triggerdown', 'gripdown'],
        upEvents: ['trackpadup', 'triggerup', 'gripup']
      },
      raycaster: {
        direction: new THREE.Vector3(0, -0.6, -1).normalize(),
        origin: {x: 0, y: 0, z: -0.1}
      }
    },

    'windows-motion-controls': {
      cursor: {
        downEvents: ['trackpaddown', 'triggerdown', 'gripdown'],
        upEvents: ['trackpadup', 'triggerup', 'gripup']
      },
      raycaster: {
        direction: new THREE.Vector3(0, -2, -1).normalize(),
        origin: {x: 0, y: 0, z: -0.1}
      }
    }
  }
});
