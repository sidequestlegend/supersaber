AFRAME.registerComponent('logoflicker', {
  dependencies: ['text'],

  schema: {
    delay: {default: 1000.0},
  },

  init: function () {
    this.setOff = this.setOff.bind(this);
    this.setOn = this.setOn.bind(this);

    this.sparks = document.getElementById('logosparks');
    this.sparkPositions = [
      {position: new THREE.Vector3(0, 0.10, 0)},
      {position: new THREE.Vector3(0.3, 0.8, 0)},
      {position: new THREE.Vector3(-0.3, 0.8, 0)}
    ];

    this.setOn();
  },

  setOff: function () {
    this.el.object3D.visible = false;
    this.sparks.emit('logoflicker',
      this.sparkPositions[Math.floor(Math.random() * this.sparkPositions.length)],
      false);

    setTimeout(this.setOn,
               50 + Math.floor(Math.random() * 100));
  },

  setOn: function () {
    this.el.object3D.visible = true;
    setTimeout(this.setOff,
               Math.floor((this.data.delay * 3 / 10) + Math.random() * this.data.delay));
  }
});
