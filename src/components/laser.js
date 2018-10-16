/**
 * Laser beam.
 * Automatically set length on intersection.
 */
AFRAME.registerComponent('cursor-laser', {
  dependencies: ['sub-object'],

  schema: {
    hand: {type: 'string'}
  },

  init: function () {
    const el = this.el;
    const box = new THREE.Box3();
    const size = new THREE.Vector3();

    this.currentLength = undefined;
    this.originalSize = undefined;

    // Calculate size to position beam at tip of controller.
    el.addEventListener('subobjectloaded', () => {
      box.setFromObject(el.getObject3D('mesh'));
      box.getSize(size);
      el.object3D.position.z -= size.z;
      this.originalSize = size.z;
      this.currentLength = size.z;
    });
  },

  tick: function () {
    const el = this.el;

    // Not yet ready.
    if (this.currentLength === undefined) { return; }

    const cursor = el.parentNode.components.cursor;
    if (!cursor) { return; }

    // Toggle beam.
    const intersectedEl = cursor.intersectedEl;

    if (!intersectedEl) {
      // Retract the beam if not intersecting.
      el.object3D.position.z = this.originalSize * -0.35;
      el.object3D.scale.x = 0.25;
      el.object3D.scale.z = this.originalSize * 0.35;
      this.currentLength = this.originalSize * 0.35;
      return;
    }

    // Set appropriate length of beam on intersection.
    const intersection = el.parentNode.components.raycaster.intersections[0];
    const ratio = intersection.distance / this.currentLength;
    el.object3D.scale.x = 1;
    el.object3D.position.z *= ratio;
    el.object3D.scale.z *= ratio;
    this.currentLength = el.object3D.scale.z;
  }
});
