import {BEAT_WARMUP_OFFSET, BEAT_WARMUP_SPEED, BEAT_WARMUP_TIME} from '../constants/beat';

// So wall does not clip the stage ground.
const RAISE_Y_OFFSET = 0.1;

/**
 * Wall to dodge.
 */
AFRAME.registerComponent('wall', {
  schema: {
    anticipationPosition: {default: 0},
    durationSeconds: {default: 0},
    height: {default: 1.3},
    horizontalPosition: {default: 'middleleft', oneOf: ['left', 'middleleft', 'middleright', 'right']},
    speed: {default: 1.0},
    warmupPosition: {default: 0},
    width: {default: 1}
  },

  horizontalPositions: {
    left: -0.75,
    middleleft: -0.25,
    middleright: 0.25,
    right: 0.75
  },

  init: function () {
    this.maxZ = 10;
  },

  updatePosition: function () {
    const el = this.el;
    const data = this.data;
    el.object3D.position.set(
      this.horizontalPositions[data.horizontalPosition],
      data.height + RAISE_Y_OFFSET,
      data.anticipationPosition + data.warmupPosition + data.durationSeconds * data.speed / 2
    );
    el.object3D.scale.set(data.width * 0.30, 2.5, data.durationSeconds * data.speed);
  },

  pause: function () {
    this.el.object3D.visible = false;
    this.el.removeAttribute('data-collidable-head');
  },

  play: function () {
    this.el.object3D.visible = true;
    this.el.setAttribute('data-collidable-head', '');
  },

  tock: function (time, timeDelta) {
    const data = this.data;
    const position = this.el.object3D.position;
    if (this.intersecting) {
      var int;
      if (this.saberHit['rightHand'].active) {
        int = this.saberHit['rightHand'].raycaster.getIntersection(this.el);
        if (int) { this.material.uniforms.hitRight.value = int.point; }
      }
      if (this.saberHit['leftHand'].active) {
        int = this.saberHit['leftHand'].raycaster.getIntersection(this.el);
        if (int) { this.material.uniforms.hitLeft.value = int.point; }
      }
    }

    // Move.
    if (position.z < data.anticipationPosition) {
      let newPositionZ = position.z + BEAT_WARMUP_SPEED * (timeDelta / 1000);
      // Warm up / warp in.
      if (newPositionZ < data.anticipationPosition) {
        position.z = newPositionZ;
      } else {
        position.z = data.anticipationPosition;
      }
    } else {
      // Standard moving.
      position.z += this.data.speed * (timeDelta / 1000);
    }

    if (this.el.object3D.position.z > this.maxZ) {
      this.returnToPool();
      return;
    }
  },

  returnToPool: function () {
    this.el.sceneEl.components.pool__wall.returnEntity(this.el);
    this.el.object3D.position.z = 9999;
    this.el.pause();
    this.el.removeAttribute('data-collidable-head');
    this.el.removeAttribute('raycastable-game');
  }
});
