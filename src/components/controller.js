var handData = {
  right: {hand: 'right', model: false},
  left: {hand: 'left', model: false},
};

/**
 * Controller visuals.
 */
AFRAME.registerComponent('controller', {
  schema: {
    hand: {type: 'string'},
    menuActive: {default: true}
  },

  init: function() {
    var data = this.data;
    var el = this.el;

    this.controllerType = '';

    el.addEventListener('object3dset', evt => {
      var mesh;
      if (evt.detail.type !== 'mesh') { return; }
      if (this.controllerType) {
        this.setControllerRotation();
      }
    });

    // Set controllers.
    // TODO: Add controller model.
    el.setAttribute('geometry', {primitive: 'box', width: 0.05, depth: 0.05, height: 0.05});
    el.setAttribute('oculus-touch-controls', handData[data.hand]);
    el.setAttribute('vive-controls', handData[data.hand]);
    el.setAttribute('windows-motion-controls', handData[data.hand]);

    el.addEventListener('controllerconnected', evt => {
      this.controllerConnected = true;
      this.controllerType = evt.detail.name;
      if (this.el.getObject3D('mesh')) { this.setControllerRotation(); }
      if (data.hand === 'left') { return; }
      const controllerConfig = this.config[this.controllerType];
      el.setAttribute('raycaster', controllerConfig.raycaster || {});
      el.setAttribute('cursor', controllerConfig.cursor || {});
      el.setAttribute('line', {opacity: 0.75, color: 'pink'});
    });
  },

  /**
   * TODO: Adjust rotation depending on controller type.
   */
  setControllerRotation: function() {
    var el = this.el;
    mesh = el.getObject3D('mesh');
    if (this.controllerType === 'vive-controls') {
      mesh.rotation.x = THREE.Math.degToRad(90);
      mesh.rotation.y = THREE.Math.degToRad(this.data.hand === 'left' ? -90 : 90);
      mesh.rotation.z = THREE.Math.degToRad(180);
    } else {
      mesh.rotation.y = THREE.Math.degToRad(180);
    }
  },

  update: function() {
    var data = this.data;
    var el = this.el;
    if (data.hand === 'left') { return; }
    if (this.controllerConnected) {
      el.setAttribute('raycaster', 'enabled', data.menuActive);
      el.setAttribute('raycaster', 'showLine', data.menuActive);
    }
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
