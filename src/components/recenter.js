/**
 * Recenter camera back to facing down negative Z axis at 0, 0, 0.
 */
AFRAME.registerComponent('recenter', {
  schema: {
    enabled: {default: true}
  },

  init: function () {
    var sceneEl = this.el.sceneEl;
    this.recenter = this.recenter.bind(this);

    // Delay to make sure we have a valid pose.
    this.el.addEventListener('enter-vr', () => setTimeout(this.recenter, 100));
    document.querySelectorAll('[tracked-controls]').forEach(controlEl => {
      controlEl.addEventListener('menudown', this.recenter);
      controlEl.addEventListener('thumbstickdown', this.recenter);
    });
    window.addEventListener('vrdisplaypresentchange', this.recenter);
  },

  recenter: (function () {
    var euler = new THREE.Euler();
    var matrix = new THREE.Matrix4();
    var rotationMatrix = new THREE.Matrix4();
    var translationMatrix = new THREE.Matrix4();

    return function () {
      const el = this.el;

      if (!this.data.enabled) { return; }

      const camera = el.sceneEl.camera.el.object3D;

      // Reset matrix.
      matrix.identity();

      // Create matrix to reset Y rotation.
      euler.set(0, -1 * camera.rotation.y, 0);
      rotationMatrix.makeRotationFromEuler(euler);

      // Create matrix to zero position.
      translationMatrix.makeTranslation(-1 * camera.position.x, 0, -1 * camera.position.z);

      // Multiply and decompose back to object3D.
      matrix.multiply(rotationMatrix).multiply(translationMatrix);
      matrix.decompose(el.object3D.position, el.object3D.quaternion, el.object3D.scale);
      el.object3D.updateMatrixWorld(true);
    };
  })(),

  remove: function () {
    this.el.sceneEl.removeEventListener('enter-vr', this.recenter);
  }
});
