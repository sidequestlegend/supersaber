/**
 * Laser beam.
 * Automatically set length on intersection.
 */
AFRAME.registerComponent('cursor-laser', {
  dependencies: ['geometry'],

  schema: {
    enabled: {default: true}
  },

  init: function () {
    const el = this.el;
    const box = new THREE.Box3();
    const size = new THREE.Vector3();

    this.currentLength = undefined;
    this.originalSize = undefined;

    // Calculate size to position beam at tip of controller.
    box.setFromObject(el.getObject3D('mesh'));
    box.getSize(size);
    el.object3D.position.z = -0.3;
    this.originalSize = size.y;
    this.currentLength = size.y;
  },

  update: function () {
    this.el.object3D.visible = this.data.enabled;
  },

  tick: function () {
    const el = this.el;

    if (!this.data.enabled) { return; }

    const cursor = el.parentNode.components.cursor;
    if (!cursor) { return; }

    // Toggle beam.
    const intersectedEl = cursor.intersectedEl;

    if (!intersectedEl) {
      // Retract the beam if not intersecting.
      el.object3D.position.z = -25;
      el.object3D.scale.x = 0.75;
      el.getObject3D('mesh').scale.y = 50;
      this.currentLength = 1;
      return;
    }

    // Set appropriate length of beam on intersection.
    const intersection = el.parentNode.components.raycaster.intersections[0];
    el.object3D.scale.x = 1;
    el.object3D.position.z = (-intersection.distance / 2);
    el.getObject3D('mesh').scale.y = this.currentLength = intersection.distance;
  }
});
