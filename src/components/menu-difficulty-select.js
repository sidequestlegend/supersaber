var bindEvent = require('aframe-event-decorators').bindEvent;

/**
 * Select difficulty.
 */
AFRAME.registerComponent('menu-difficulty-option', {
  dependencies: ['material'],

  schema: {
    activeDifficulty: {default: ''}
  },

  init: function () {
    this.defaultColor = this.el.getAttribute('material').color;
  },

  update: function () {
    var el = this.el;
    let optionValue = this.el.closest('[data-bind-for-value]').dataset.bindForValue;
    if (optionValue === this.data.activeDifficulty) {
      el.setAttribute('animation__mouseenter', 'enabled', false);
      el.setAttribute('animation__mouseleave', 'enabled', false);
      el.setAttribute('material', 'color', '#4BF');
    } else {
      el.setAttribute('material', 'color', this.defaultColor);
      el.setAttribute('animation__mouseenter', 'enabled', true);
      el.setAttribute('animation__mouseleave', 'enabled', true);
    }
  },
});

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
    this.el.sceneEl.emit(
      'menudifficultyselect',
      evt.target.closest('.difficultyOption').dataset.difficulty,
      false);
  })
});
