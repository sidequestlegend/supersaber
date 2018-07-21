var bindEvent = require('aframe-event-decorators').bindEvent;

/**
 * Select difficulty.
 */
AFRAME.registerComponent('menu-difficulty-select', {
  click: bindEvent(function (evt) {
    this.el.emit('menudifficultyselect',
                 evt.target.closest('.difficultyOption').dataset.difficulty,
                 false);
  })
});
