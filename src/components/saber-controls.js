/**
 * Controller, cursor, raycaster.
 */
AFRAME.registerComponent('saber-controls', {
  schema: {
    bladeEnabled: {default: false},
    hand: {default: 'right', oneOf: ['left', 'right']},
    isPaused: {default: false},
    strokeMinSpeed: {default: 250000},
    strokeMinAngle: {default: 5}
  },

  init: function () {
    var el = this.el;
    var data = this.data;

    this.boundingBox = new THREE.Box3();
    this.bladeEl = el.querySelector('.blade');
    this.controllerType = '';
    this.bladeTipPosition = new THREE.Vector3();
    this.bladeTipPreviousPosition = new THREE.Vector3();
    this.saberPosition = new THREE.Vector3();
    this.swinging = false;
    this.strokeAngle = 0;
    this.strokeCount = 0;
    this.distanceSamples = [];
    this.accumulatedDistance = 0;

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

  detectStroke: function (delta) {
    var bladeObject
    var distance;
    var distanceSamples = this.distanceSamples;
    var data = this.data;
    var directionChange;
    var minSpeedFactor = this.swinging ? 1 : 1;
    var startSpeed;
    var strokeMinSpeed = this.swinging ? startSpeed : this.data.strokeMinSpeed;

    if (this.data.hand === 'left') { return; }

    // Tip of the blade position in world coordinates.
    this.bladeTipPosition.set(0, 0.9, 0);
    bladeObject = this.el.object3D;
    bladeObject.parent.updateMatrixWorld();
    bladeObject.localToWorld(this.bladeTipPosition);

    // Distance covered but the saber tip in one frame.
    distance = this.bladeTipPosition.distanceTo(this.bladeTipPreviousPosition) * 1000000;

    // Calculate angle covered by the saber in one frame.
    // Trig: Triangle formed by the laser and the linear distance covered by it's tip
    // Arcsin((distanceCoveredByTip / 2.0) / Length of the blade)
    this.strokeAngle += ((Math.asin(((distance / 1000000) / 2.0) / 0.9)) / (2 * Math.PI)) * 360;

    // Sample distance of the last 5 frames.
    if (this.distanceSamples.length === 5) { this.accumulatedDistance -= this.distanceSamples.shift(); }
    this.distanceSamples.push(distance);
    this.accumulatedDistance += distance;

    // Filter out saber movements that are too slow. Too slow or small angle is considered wrong hit. 
    if (this.accumulatedDistance > this.data.strokeMinSpeed * minSpeedFactor) {
      // Saber has to move more than strokeMinAngle to consider a swing. This filters out
      // unintentional swings.
      if (!this.swinging && this.strokeAngle > data.strokeMinAngle) {
        startSpeed = this.accumulatedDistance;
        this.swinging = true;
      }
    } else {
      // Stroke finishes. Reset swinging state.
      if (this.swinging) {
        console.log("Angle " + this.strokeAngle);
        this.swinging = false;
        this.strokeAngle = 0;
        this.accumulatedDistance = 0;
        this.distanceSamples.forEach(function(el, i) { distanceSamples[i] = 0; });
      }
    }

    this.bladeTipPreviousPosition.copy(this.bladeTipPosition);
  },

  initSaber: function (evt) {
    this.controllerType = evt.detail.name;
    this.el.setAttribute('cursor', this.config[this.controllerType].cursor || {});
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
      }
    },

    'vive-controls': {
      cursor: {
        downEvents: ['trackpaddown', 'triggerdown', 'gripdown'],
        upEvents: ['trackpadup', 'triggerup', 'gripup']
      }
    },

    'windows-motion-controls': {
      cursor: {
        downEvents: ['trackpaddown', 'triggerdown', 'gripdown'],
        upEvents: ['trackpadup', 'triggerup', 'gripup']
      }
    }
  }
});
