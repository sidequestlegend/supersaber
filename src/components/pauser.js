const events = [
  'menudown',
  'abuttondown',
  'bbuttondown',
  'xbuttondown',
  'ybuttondown'
];

/**
 * Tell app to pause game if playing.
 */
AFRAME.registerComponent('pauser', {
  schema: {
    enabled: {default: true}
  },

  init: function () {
    this.pauseGame = this.pauseGame.bind(this);

    events.forEach(event  => {
      this.el.addEventListener(event, this.pauseGame);
    });
  },

  pauseGame: function () {
    if (!this.data.enabled) { return; }
    this.el.sceneEl.emit('pausegame', null, false);
  }
});
