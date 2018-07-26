/**
 * Acitve color.
 */
AFRAME.registerComponent('active-color', {
  dependencies: ['material'],

  schema: {
    active: {default: false},
    color: {default: '#ffffff'}
  },

  init: function () {
    this.defaultColor = this.el.getAttribute('material').color;
  },

  update: function () {
    var el = this.el;
    if (this.data.active) {
      el.setAttribute('material', 'color', this.data.color);
    } else {
      el.setAttribute('material', 'color', this.defaultColor);
    }
  },
});
