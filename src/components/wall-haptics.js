/**
 * Listen to aabb-collider event for wall haptics.
 */
AFRAME.registerComponent('wall-haptics', {
  dependencies: ['aabb-collider'],

  init: function () {
    const el = this.el;
    this.isHittingWall = false;
    el.setAttribute('haptics__wall', {dur: 50, force: 0.025});

    this.checkIfHittingWall = this.checkIfHittingWall.bind(this);
    el.addEventListener('hitstart', this.checkIfHittingWall);
    el.addEventListener('hitend', this.checkIfHittingWall);

    this.tick = AFRAME.utils.throttleTick(this.tick.bind(this), 50);
  },

  /**
   * On aabb-collider event, check if we are still hitting a wall.
   */
  checkIfHittingWall: function () {
    const intersectedEls = this.el.components['aabb-collider'].intersectedEls;
    this.isHittingWall = false;
    for (let i = 0; i < intersectedEls.length; i++) {
      if (intersectedEls[i].components.wall) {
        this.isHittingWall = true;
        return;
      }
    }
  },

  tick: function () {
    if (!this.isHittingWall) { return; }
    this.el.components.haptics__wall.pulse();
  }
});
