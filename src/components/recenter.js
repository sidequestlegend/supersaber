/**
 * Pivot the scene when user enters VR to face the links.
 */
AFRAME.registerComponent('recenter', {
  schema: {
    enabled: {default: true},
    target: {default: ''}
  },

  init: function () {
    var sceneEl = this.el.sceneEl;
    this.matrix = new THREE.Matrix4();
    this.frustum = new THREE.Frustum();
    this.rotationOffset = 0;
    this.euler = new THREE.Euler();
    this.euler.order = 'YXZ';
    this.menuPosition = new THREE.Vector3();
    this.recenter = this.recenter.bind(this);
    this.checkInViewAfterRecenter = this.checkInViewAfterRecenter.bind(this);
    this.target = document.querySelector(this.data.target);

    // Delay to make sure we have a valid pose.
    sceneEl.addEventListener('enter-vr', () => setTimeout(this.recenter, 100));
    // User can also recenter the menu manually.
    sceneEl.addEventListener('menudown', this.recenter);
    sceneEl.addEventListener('thumbstickdown', this.recenter);
    window.addEventListener('vrdisplaypresentchange', this.recenter);
  },

  recenter: function () {
    var euler = this.euler;
    if (!this.data.enabled) { return; }
    euler.setFromRotationMatrix(this.el.sceneEl.camera.el.object3D.matrixWorld, 'YXZ');
    this.el.object3D.rotation.y = euler.y + this.rotationOffset;
    // Check if the menu is in camera frustum in next tick after a frame has rendered.
    setTimeout(this.checkInViewAfterRecenter, 0);
  },

  /*
   * Sometimes the quaternion returns the yaw in the [-180, 180] range.
   * Check if the menu is in the camera frustum after recenter it to
   * decide if we apply an offset or not.
   */
  checkInViewAfterRecenter: (function () {
    var bottomVec3 = new THREE.Vector3();
    var topVec3 = new THREE.Vector3();

    return function () {
      var camera = this.el.sceneEl.camera;
      var frustum = this.frustum;
      var menuPosition = this.menuPosition;

      camera.updateMatrix();
      camera.updateMatrixWorld();
      frustum.setFromMatrix(this.matrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse));

      // Check if menu position (and its bounds) are within the frustum.
      // Check bounds in case looking angled up or down, rather than menu central.
      menuPosition.setFromMatrixPosition(this.target.object3D.matrixWorld);
      bottomVec3.copy(menuPosition).y -= 3;
      topVec3.copy(menuPosition).y += 3;

      if (frustum.containsPoint(menuPosition) ||
          frustum.containsPoint(bottomVec3) ||
          frustum.containsPoint(topVec3)) { return; }

      this.rotationOffset = this.rotationOffset === 0 ? Math.PI : 0;
      // Recenter again with the new offset.
      this.recenter();
    };
  })(),

  remove: function () {
    this.el.sceneEl.removeEventListener('enter-vr', this.recenter);
  }
});
