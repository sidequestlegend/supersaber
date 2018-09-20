/**
 * Cursor mesh to show at intersection point with respective hand.
 */
AFRAME.registerComponent('cursor-mesh', {
  schema: {
    cursorEl: {type: 'selector'}
  },

  init: function () {
    this.scenePivotEl = document.getElementById('scenePivot');
  },

  tick: function () {
    var cursor;
    var cursorEl = this.data.cursorEl;
    var el = this.el;
    var i;
    var intersection;
    var intersectedEl;
    var intersectionPoint;
    var object3D = this.el.object3D;
    var scenePivotEl = this.scenePivotEl;

    cursor = cursorEl.components.cursor;
    if (!cursor) { return; }

    // Look for valid intersection target.
    intersectedEl = cursorEl.components.cursor.intersectedEl;
    if (intersectedEl) {
      el.object3D.visible = true;
    } else {
      el.object3D.visible = false;
      return;
    }

    // Update cursor mesh.
    intersection = cursorEl.components.raycaster.getIntersection(intersectedEl);
    el.object3D.position.copy(intersection.point);

    if (scenePivotEl) {
      el.object3D.rotation.copy(scenePivotEl.object3D.rotation);
    }
  }
});
