var bindEvent = require('aframe-event-decorators').bindEvent;

/**
 * Select difficulty.
 */
AFRAME.registerComponent('menu-difficulty-select', {
  init: function () {
    this.el.sceneEl.addEventListener('menuchallengeselect', () => {
      setTimeout(() => {
        this.el.components.layout.update();
      });
    });
  },

  click: bindEvent(function (evt) {
    this.el.emit('menudifficultyselect',
                 evt.target.closest('.difficultyOption').dataset.difficulty,
                 false);
  })
});
