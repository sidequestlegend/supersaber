AFRAME.registerComponent('logoflicker', {
  dependencies: ['text'],

  schema: {
    delay: {default: 1000.0},
  },

  init: function () {
    this.setOff = this.setOff.bind(this);
    this.setOn = this.setOn.bind(this);

    this.defaultColor = new THREE.Color().setStyle(this.el.components.text.data.color);
    this.color = new THREE.Color().setStyle('#0A0228');
    this.colorUniform = this.el.components.text.material.uniforms.color.value;

    this.sparks = document.getElementById('logosparks');
    this.sparkPositions = [
      {position: new THREE.Vector3(0, 0.1, 0)},
      {position: new THREE.Vector3(0.5, 1.2, 0)},
      {position: new THREE.Vector3(0, 1.2, 0)}
    ];

    this.setOn();
  },

  setOff: function () {
    this.colorUniform.x = this.color.r;
    this.colorUniform.y = this.color.g;
    this.colorUniform.z = this.color.b;
    this.colorUniform.needsUpdate = true;

    this.sparks.emit('logoflicker',
      this.sparkPositions[Math.floor(Math.random() * this.sparkPositions.length)],
      false);

    setTimeout(this.setOn,
               50 + Math.floor(Math.random() * 100));
  },

  setOn: function () {
    this.colorUniform.x = this.defaultColor.r;
    this.colorUniform.y = this.defaultColor.g;
    this.colorUniform.z = this.defaultColor.b;
    this.colorUniform.needsUpdate = true;

    setTimeout(this.setOff,
               Math.floor((this.data.delay * 3 / 10) + Math.random() * this.data.delay));
  }
});
