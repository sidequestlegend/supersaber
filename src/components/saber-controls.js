/**
 * Controller, cursor, raycaster.
 */
AFRAME.registerComponent('saber-controls', {
  schema: {
    bladeEnabled: {default: false},
    hand: {default: 'right', oneOf: ['left', 'right']},
    isPaused: {default: false},
    strokeMinSpeed: {default: 100000},
    strokeMinAngle: {default: 5}
  },

  init: function () {
    var el = this.el;
    var data = this.data;

    this.boundingBox = new THREE.Box3();
    this.bladeEl = el.querySelector('.blade');
    this.controllerType = '';
    this.xPlaneNormal = new THREE.Vector3(0, 1, 0);
    this.yPlaneNormal = new THREE.Vector3(1, 0, 0);
    this.xyPlaneNormal = new THREE.Vector3(1, 1, 0);
    this.bladeTipPosition = new THREE.Vector3();
    this.bladePosition = new THREE.Vector3();
    this.bladeVector = new THREE.Vector3();
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
    var startSpeed;
    var strokeMinSpeed = this.swinging ? startSpeed : this.data.strokeMinSpeed;

    // Tip of the blade position in world coordinates.
    this.bladeTipPosition.set(0, 0.9, 0);
    this.bladePosition.set(0, 0, 0);
    bladeObject = this.el.object3D;
    bladeObject.parent.updateMatrixWorld();
    bladeObject.localToWorld(this.bladeTipPosition);
    bladeObject.localToWorld(this.bladePosition);

    // Angles between saber and major planes.
    this.bladeVector.copy(this.bladeTipPosition).sub(this.bladePosition).normalize();
    var anglePlaneX = this.bladeVector.angleTo(this.xPlaneNormal);
    var anglePlaneY = this.bladeVector.angleTo(this.yPlaneNormal);
    var anglePlaneXY = this.bladeVector.angleTo(this.xyPlaneNormal);

    // Distance covered but the saber tip in one frame.
    distance = this.bladeTipPreviousPosition.sub(this.bladeTipPosition).length() * 1000000;

    // Sample distance of the last 5 frames.
    if (this.distanceSamples.length === 5) {
      this.accumulatedDistance -= this.distanceSamples.shift();
    }
    this.distanceSamples.push(distance);
    this.accumulatedDistance += distance;

    // Filter out saber movements that are too slow. Too slow or small angle is considered wrong hit.
    // Cap stroke to 180 degrees.
    if (this.accumulatedDistance > this.data.strokeMinSpeed && this.strokeAngle < 180) {
      // Calculate angle covered by the saber in one frame and accumulate.
      // Trig: Triangle formed by the saber and the linear distance covered by its tip
      // Arcsin((distanceCoveredByTip / 2.0) / Length of the blade) * 2
      // This is not exact becasuse assumes wrist as pivot point, ignoring elbow and shoulder.
      // It seems to work well in practice but might need tweaking.
      this.strokeAngle += ((Math.asin(((distance / 1000000) / 2.0) / 0.9)) /
                          (2 * Math.PI)) * 360 * 2;
      // Saber has to move more than strokeMinAngle to consider a swing.
      // This filters out unintentional swings.
      if (!this.swinging && this.strokeAngle > data.strokeMinAngle) {
        startSpeed = this.accumulatedDistance;
        this.swinging = true;
        this.maxAnglePlaneX = 0;
        this.maxAnglePlaneY = 0;
        this.maxAnglePlaneXY = 0;
      }
      this.maxAnglePlaneX = anglePlaneX > this.maxAnglePlaneX ? anglePlaneX : this.maxAnglePlaneX;
      this.maxAnglePlaneY = anglePlaneY > this.maxAnglePlaneY ? anglePlaneY : this.maxAnglePlaneY;
      this.maxAnglePlaneXY = anglePlaneXY > this.maxAnglePlaneXY ? anglePlaneXY : this.maxAnglePlaneXY;
    } else {
      // Stroke finishes. Reset swinging state.
      if (this.swinging) {
        // console.log("MaxAngle " + this.maxAnglePlaneX * 180 / Math.PI);
        this.el.emit('strokeend');
        this.swinging = false;
        this.strokeAngle = 0;
        this.accumulatedDistance = 0;
        for (let i = 0; i < this.distanceSamples.length; i++) { this.distanceSamples[i] = 0; }
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
