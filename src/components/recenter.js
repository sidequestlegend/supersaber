/**
 * Pivot the scene when user enters VR to face the links.
 */
AFRAME.registerComponent('recenter', {
  schema: {
    enabled: {default: true}
  },

  init: function() {
    var sceneEl = this.el.sceneEl;
    this.matrix = new THREE.Matrix4();
    this.frustum = new THREE.Frustum();
    this.rotationOffset = 0;
    this.euler = new THREE.Euler();
    this.euler.order = 'YXZ';
    this.menuPosition = new THREE.Vector3();
    this.recenter = this.recenter.bind(this);
    this.checkInViewAfterRecenter = this.checkInViewAfterRecenter.bind(this);
    // Delay to make sure we have a valid pose.
    sceneEl.addEventListener('enter-vr', () => {
      setTimeout(() => { this.recenter(); }, 100);
    });
    // User can also recenter the menu manually.
    sceneEl.addEventListener('menudown', () => {
      if (!this.data.enabled) { return; }
      this.recenter();
    });
    sceneEl.addEventListener('thumbstickdown', () => {
      if (!this.data.enabled) { return; }
      this.recenter();
    });
  },

  recenter: function(skipCheck) {
    var euler = this.euler;
    euler.setFromRotationMatrix(
      this.el.sceneEl.camera.el.object3D.matrixWorld,
      'YXZ'
    );
    this.el.object3D.rotation.y = euler.y + this.rotationOffset;
    // Check if the menu is in camera frustum in next tick after a frame has rendered.
    if (skipCheck) {
      return;
    }
    setTimeout(this.checkInViewAfterRecenter, 0);
  },

  /*
   * Sometimes the quaternion returns the yaw in the [-180, 180] range.
   * Check if the menu is in the camera frustum after recenter it to
   * decide if we apply an offset or not.
   */
  checkInViewAfterRecenter: function() {
    var camera = this.el.sceneEl.camera;
    var frustum = this.frustum;
    var menu = this.el;
    var menuPosition = this.menuPosition;
    camera.updateMatrix();
    camera.updateMatrixWorld();
    frustum.setFromMatrix(
      this.matrix.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      )
    );
    menu.object3D.updateMatrixWorld();
    menuPosition.setFromMatrixPosition(menu.object3D.matrixWorld);
    if (frustum.containsPoint(menuPosition)) {
      return;
    }
    this.rotationOffset = this.rotationOffset === 0 ? Math.PI : 0;
    // Recenter again with the new offset.
    this.recenter(true);
  },

  remove: function() {
    this.el.sceneEl.removeEventListener('enter-vr', this.recenter);
  },
});
