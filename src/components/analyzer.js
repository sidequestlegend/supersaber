AFRAME.registerComponent('analyser', {
  dependencies: ['audioanalyser'],
  schema: {
    height: {default: 1.0},
    thickness: {default: 0.1},
    separation: {default: 0.3},
    scale: {default: 4.0},
    mirror: {default: 3}
  },

  init: function () {
    this.analyser = this.el.components.audioanalyser;
    this.columns = null;
    var material = this.el.sceneEl.systems.materials.black;
    var geometry = new THREE.BoxBufferGeometry();
    for (var i = 0; i < this.analyser.data.fftSize; i++) {
      for (var side = 0; side < 2; side++) {
        var column = new THREE.Mesh(geometry, material);
        this.el.object3D.add(column);
      }
    }
    this.columns = this.el.object3D.children;
  },

  update: function () {
    var z = 0;
    for (var i = 0; i < this.columns.length; i++) {
      this.columns[i].position.x = ((i % 2) * 2 - 1) * this.data.mirror;
      this.columns[i].position.z = z;
      this.columns[i].scale.set(this.data.thickness, this.data.height, this.data.thickness);
      z -= this.data.separation;
    }
  },

  tick: function () {
    var v; 
    var height = this.data.height;
    var n = this.columns.length / 2;

    for (var i = 0; i < n; i++) {
      v = height + this.analyser.levels[i] / 256.0 * this.data.scale;
      this.columns[i * 2 + 0].scale.y = v;
      this.columns[i * 2 + 1].scale.y = v;
    }
  }
});
