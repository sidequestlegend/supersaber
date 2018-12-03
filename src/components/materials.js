const stageNormalShaders = require('../../assets/shaders/stageNormal.js')
const stageAdditiveShaders = require('../../assets/shaders/stageAdditive.js')

AFRAME.registerSystem('materials', {
  init: function () {
    this.black = new THREE.MeshLambertMaterial({color: 0x000000, flatShading: true});
    this.default = new THREE.MeshLambertMaterial({color: 0xff0000, flatShading: true});
    this.neon = new THREE.MeshBasicMaterial({color: 0x9999ff, fog: false});

    this.stageNormal = new THREE.ShaderMaterial({
      uniforms: {
        color: {value: new THREE.Vector3(0, 0.48, 0.72) },
        src: {value: new THREE.TextureLoader().load(document.getElementById('atlasImg').src)},
      },
      vertexShader: stageNormalShaders.vertexShader,
      fragmentShader: stageNormalShaders.fragmentShader,
      fog: false,
      transparent: true
    });

    this.stageAdditive = new THREE.ShaderMaterial({
      uniforms: {
        tunnelNeon: {value: new THREE.Vector3(0, 0, 1) },
        src: {value: new THREE.TextureLoader().load(document.getElementById('atlasImg').src)},
      },
      vertexShader: stageAdditiveShaders.vertexShader,
      fragmentShader: stageAdditiveShaders.fragmentShader,
      blending: THREE.AdditiveBlending,
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
    if (this.data.name === "") return;
    var mesh;
    var material = this.system[this.data.name];
    if (!material) {
      console.warn(`undefined material "${this.system[this.data.name]}"`);
      return;
    }
    mesh = this.el.getObject3D('mesh');
    if (!mesh) {
      this.el.addEventListener('model-loaded', this.applyMaterial.bind(this));
    } else {
      this.applyMaterial(mesh);
    }
  },

  applyMaterial: function (obj) {
    var material = this.system[this.data.name];
    if (obj['detail']) { obj = obj.detail.model; }
    if (this.data.recursive) {
      obj.traverse(o => {
        if (o.type === 'Mesh') {
          o.material = material;
        }
      });
    } else {
      obj.material = material;
    }
  }
});
