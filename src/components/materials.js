AFRAME.registerSystem('materials', {
  init: function () {
    this.black = new THREE.MeshLambertMaterial({color: 0x000000, flatShading: true});
    this.default = new THREE.MeshLambertMaterial({color: 0xff0000, flatShading: true});
    this.neon = new THREE.MeshBasicMaterial({color: 0x9999ff, fog: false});
  }
});

AFRAME.registerComponent('materials', {
  schema: {
    default: 'black',
    oneOf: ['black', 'default', 'neon']
  },
  update: function () {
    this.el.object3D.traverse(o => o.material = this.system[this.data]);
  }
});
