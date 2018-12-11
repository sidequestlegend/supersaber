/**
 * Controller, cursor, raycaster.
 */
AFRAME.registerComponent('saber-controls', {
  schema: {
    bladeEnabled: {default: false},
    hand: {default: 'right', oneOf: ['left', 'right']},
    isPaused: {default: false},
    strokeMinSpeed: {default: 0.002},
    strokeMinDuration: {default: 30}
  },

  init: function () {
    var el = this.el;
    var data = this.data;

    this.boundingBox = new THREE.Box3();
    this.controllerType = '';
    this.xPlaneNormal = new THREE.Vector3(0, 1, 0);
    this.yPlaneNormal = new THREE.Vector3(1, 0, 0);
    this.xyPlaneNormal = new THREE.Vector3(1, 1, 0);
    this.bladeTipPosition = new THREE.Vector3();
    this.bladePosition = new THREE.Vector3();
    this.bladeVector = new THREE.Vector3();
    this.bladeTipPreviousPosition = new THREE.Vector3();
    this.projectedBladeVector = new THREE.Vector3();
    this.saberPosition = new THREE.Vector3();
    this.swinging = false;
    this.strokeCount = 0;
    this.distanceSamples = [];
    this.deltaSamples = [];
    this.startStrokePosition = new THREE.Vector3();
    this.strokeDirectionVector = new THREE.Vector3();
    this.strokeDirection = {
      down: false,
      left: false,
      right: false,
      up: false
    };
    this.accumulatedDistance = 0;
    this.accumulatedDelta = 0;

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
    var distance;
    var distanceSamples = this.distanceSamples;
    var data = this.data;
    var directionChange;

    // Tip of the blade position in world coordinates.
    this.bladeTipPosition.set(0, 0, -0.8);
    this.bladePosition.set(0, 0, 0);

    const saberObj = this.el.object3D;
    saberObj.parent.updateMatrixWorld();
    saberObj.localToWorld(this.bladeTipPosition);
    saberObj.localToWorld(this.bladePosition);

    // Angles between saber and major planes.
    this.bladeVector.copy(this.bladeTipPosition).sub(this.bladePosition).normalize();
    var anglePlaneX = this.projectedBladeVector.copy(this.bladeTipPosition).projectOnPlane(this.xPlaneNormal).angleTo(this.bladeVector);
    var anglePlaneY = this.projectedBladeVector.copy(this.bladeTipPosition).projectOnPlane(this.yPlaneNormal).angleTo(this.bladeVector);
    var anglePlaneXY = this.projectedBladeVector.copy(this.bladeTipPosition).projectOnPlane(this.xyPlaneNormal).angleTo(this.bladeVector);

    // Distance covered but the saber tip in one frame.
    distance = this.bladeTipPreviousPosition.sub(this.bladeTipPosition).length();

    // Sample distance of the last 5 frames.
    if (this.distanceSamples.length === 5) {
      this.accumulatedDistance -= this.distanceSamples.shift();
      this.accumulatedDelta -= this.deltaSamples.shift();
    }
    this.distanceSamples.push(distance);
    this.accumulatedDistance += distance;

    this.deltaSamples.push(delta);
    this.accumulatedDelta += delta;

    // Filter out saber movements that are too slow. Too slow is considered wrong hit.
    if (this.accumulatedDistance / this.accumulatedDelta > this.data.strokeMinSpeed) {
      // This filters out unintentional swings.
      if (!this.swinging) {
        this.startStrokePosition.copy(this.bladeTipPosition);
        this.swinging = true;
        this.strokeDuration = 0;
        this.maxAnglePlaneX = 0;
        this.maxAnglePlaneY = 0;
        this.maxAnglePlaneXY = 0;
      }
      this.updateStrokeDirection();
      this.strokeDuration += delta;
      const anglePlaneXIncreased = anglePlaneX > this.maxAnglePlaneX;
      const anglePlaneYIncreased = anglePlaneY > this.maxAnglePlaneY;
      const anglePlaneXYIncreased = anglePlaneXY > this.maxAnglePlaneXY;
      this.maxAnglePlaneX = anglePlaneXIncreased ? anglePlaneX : this.maxAnglePlaneX;
      this.maxAnglePlaneY = anglePlaneYIncreased ? anglePlaneY : this.maxAnglePlaneY;
      this.maxAnglePlaneXY = anglePlaneXYIncreased ? anglePlaneXY : this.maxAnglePlaneXY;
      if (!anglePlaneXIncreased && !anglePlaneYIncreased) { this.endStroke(); }
    } else {
      this.endStroke();
    }

    this.bladeTipPreviousPosition.copy(this.bladeTipPosition);
  },

  endStroke: function () {
    if (!this.swinging || this.strokeDuration < this.data.strokeMinDuration) { return; }

    this.el.emit('strokeend');
    this.swinging = false;
    // Stroke finishes. Reset swinging state.
    this.accumulatedDistance = 0;
    this.accumulatedDelta = 0;
    this.maxAnglePlaneX = 0;
    this.maxAnglePlaneY = 0;
    this.maxAnglePlaneXY = 0;
    for (let i = 0; i < this.distanceSamples.length; i++) { this.distanceSamples[i] = 0; }
    for (let i = 0; i < this.deltaSamples.length; i++) { this.deltaSamples[i] = 0; }
    this.el.emit('strokeend');
  },

  updateStrokeDirection: function () {
    this.strokeDirectionVector.copy(this.bladeTipPosition).sub(this.startStrokePosition);
    if (this.strokeDirectionVector.x === 0 && this.strokeDirectionVector.y === 0) { return; }
    this.strokeDirection.right = this.strokeDirectionVector.x > 0;
    this.strokeDirection.left = this.strokeDirectionVector.x < 0;
    this.strokeDirection.up = this.strokeDirectionVector.y > 0;
    this.strokeDirection.down = this.strokeDirectionVector.y < 0;
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
