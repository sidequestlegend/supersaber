const stageShaders = require('../../assets/shaders/stage.js')

AFRAME.registerSystem('materials', {
  init: function () {
    this.black = new THREE.MeshLambertMaterial({color: 0x000000, flatShading: true});
    this.default = new THREE.MeshLambertMaterial({color: 0xff0000, flatShading: true});
    this.neon = new THREE.MeshBasicMaterial({color: 0x9999ff, fog: false});

    this.stageNormal = new THREE.ShaderMaterial({
      uniforms: {
        color: {value: new THREE.Vector3(0, 0, 0) },
        fogColor: {value: new THREE.Vector3(0, 0.48, 0.72) },
        src: {value: new THREE.TextureLoader().load(document.getElementById('atlasImg').src)},
      },
      vertexShader: stageShaders.vertexShader,
      fragmentShader: stageShaders.fragmentShader,
      fog: false,
      transparent: true
    });
  }
});

AFRAME.registerComponent('materials', {
  schema: {
    name: { default: ''},
    recursive: { default: true}
  },

  update: function () {
    var mesh;
    var material = this.system[this.data.name];
    if (!material) {
      console.warn(`undefined material "${this.system[this.data.name]}"`);
      return;
    }
    mesh = this.el.getObject3D('mesh');
    if (!mesh) {
      console.log('not loaded yet');
      this.el.addEventListener('model-loaded', this.applyMaterial.bind(this));
    } else {
      this.applyMaterial(mesh);
    }
  },

  applyMaterial: function (obj, material) {
    var material = this.system[this.data.name];
    if (this.data.recursive) {
      obj.detail.model.traverse(o => {
        if (o.type === 'Mesh') {
          o.material = material;
        }
      });
    } else {
      obj.material = material;
    }
  }
});
