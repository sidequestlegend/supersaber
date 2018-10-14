AFRAME.registerComponent('logoflicker', {
  dependencies: ['text'],

  schema: {
    delay: {default: 1000.0},
    active: {default: true}
  },

  init: function () {
    this.setOff = this.setOff.bind(this);
    this.setOn = this.setOn.bind(this);
    this.timeout = 0;

    this.sparks = document.getElementById('logosparks');
    this.sparkPositions = [
      {position: new THREE.Vector3(0, 0.10, 0)},
      {position: new THREE.Vector3(0.3, 0.8, 0)},
      {position: new THREE.Vector3(-0.3, 0.8, 0)}
    ];
  },

  update: function (oldData) {
    if (this.data.active !== oldData.active) {
      if (this.data.active) {
        this.setOn();
      } else {
        clearTimeout(this.timeout);
      }
    }
  },

  setOff: function () {
    this.el.object3D.visible = false;
    this.sparks.emit('logoflicker',
      this.sparkPositions[Math.floor(Math.random() * this.sparkPositions.length)],
      false);

    this.timeout = setTimeout(this.setOn,
               50 + Math.floor(Math.random() * 100));
  },

  setOn: function () {
    this.el.object3D.visible = true;
    this.timeout = setTimeout(this.setOff,
               Math.floor((this.data.delay * 3 / 10) + Math.random() * this.data.delay));
  }
});
