/**
 * Cursor mesh to show at intersection point with respective hand.
 */
AFRAME.registerComponent('cursor-mesh', {
  schema: {
    cursorEl: {type: 'selector'}
  },

  init: function () {
    this.currentIntersection = new THREE.Vector3();
    this.duration = undefined;
    this.isLerping = false;
    this.lastUpdateTime = this.el.sceneEl.time;
    this.startLerpTime = undefined;
    this.scenePivotEl = document.getElementById('scenePivot');

    this.lastIntersection = new THREE.Vector3();
    this.startPosition = new THREE.Vector3();
    this.targetPosition = new THREE.Vector3();
  },

  tick: function (time) {
    var cursorEl = this.data.cursorEl;
    var el = this.el;
    var object3D = this.el.object3D;
    var scenePivotEl = this.scenePivotEl;

    const cursor = cursorEl.components.cursor;
    if (!cursor) { return; }

    // Look for valid intersection target.
    const intersectedEl = cursorEl.components.cursor.intersectedEl;
    if (intersectedEl) {
      el.object3D.visible = true;
    } else {
      el.object3D.visible = false;
      this.isLerping = false;
      return;
    }

    const intersection = cursorEl.components.raycaster.getIntersection(intersectedEl);

    if (!intersection) { return; }

    // New intersection, update starting point.
    if (!this.intersectedEl && intersectedEl) {
      this.el.object3D.position.copy(intersection.point);
    }
    this.intersectedEl = intersectedEl;

    this.checkRaycasterUpdated(intersection);
    if (!this.isLerping) { return; }

    // Update cursor mesh.
    const progress = (time - this.startTime) / this.duration;
    el.object3D.position.lerpVectors(this.startPosition, this.targetPosition, progress);
    if (progress >= 1) {
      this.isLerping = false;
      return;
    }
    if (scenePivotEl) {
      el.object3D.rotation.copy(scenePivotEl.object3D.rotation);
    }
  },

  checkRaycasterUpdated: function (intersection) {
    if (intersection.point.x !== this.lastIntersection.x ||
        intersection.point.y !== this.lastIntersection.y ||
        intersection.point.z !== this.lastIntersection.z) {
      const time = this.el.sceneEl.time;
      this.duration = time - this.lastUpdateTime;
      this.lastUpdateTime = time;
      this.isLerping = true;
      this.startTime = time;

      this.startPosition.copy(this.el.object3D.position);
      this.targetPosition.copy(intersection.point);
      this.lastIntersection.copy(intersection.point);
    }
  }
});
