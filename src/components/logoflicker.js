AFRAME.registerComponent('logoflicker', {
  dependencies: ['text'],
  schema: {
    default: 1000.0,
  },
  init: function () {
    this.defaultColor = this.el.components['text'].data.color;
    this.sparks = document.getElementById('logosparks');
    this.sparkPositions = [
      { position: new THREE.Vector3(0, 0.1, 0) },
      { position: new THREE.Vector3(0.5, 1.2, 0) },
      { position: new THREE.Vector3(0, 1.2, 0) }
    ];
    this.setOn();
  },
  setOff: function () {
    this.el.setAttribute('text', {color: '#0a0228'});
    this.sparks.emit('flicker',
      this.sparkPositions[Math.floor(Math.random() * this.sparkPositions.length)]);

    setTimeout(this.setOn.bind(this),
      50 + Math.floor(Math.random() * 100));
  },
  setOn: function () {
    this.el.setAttribute('text', {color: this.defaultColor});
    setTimeout(this.setOff.bind(this),
      Math.floor((this.data * 3 / 10) + Math.random() * this.data));
  }
});
