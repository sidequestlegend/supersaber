const stageNormalShaders = require('../../assets/shaders/stageNormal.js');
const stageAdditiveShaders = require('../../assets/shaders/stageAdditive.js');
const flatShaders = require('../../assets/shaders/flat.js');
const COLORS = require('../constants/colors.js');

AFRAME.registerSystem('materials', {
  init: function () {
    this.stageNormal = new THREE.ShaderMaterial({
      uniforms: {
        color: {value: new THREE.Color(COLORS.BG_BLUE)},
        src: {value: new THREE.TextureLoader().load(document.getElementById('atlasImg').src)},
      },
      vertexShader: stageNormalShaders.vertexShader,
      fragmentShader: stageNormalShaders.fragmentShader,
      fog: false,
      transparent: true
    });

    this.stageAdditive = new THREE.ShaderMaterial({
      uniforms: {
        tunnelNeon: {value: new THREE.Color(COLORS.NEON_BLUE)},
        floorNeon: {value: new THREE.Color(COLORS.NEON_BLUE)},
        leftLaser: {value: new THREE.Color(COLORS.NEON_BLUE)},
        rightLaser: {value: new THREE.Color(COLORS.NEON_BLUE)},
        textGlow: {value: new THREE.Color(COLORS.TEXT_OFF)},
        src: {value: new THREE.TextureLoader().load(document.getElementById('atlasImg').src)},
      },
      vertexShader: stageAdditiveShaders.vertexShader,
      fragmentShader: stageAdditiveShaders.fragmentShader,
      blending: THREE.AdditiveBlending,
      fog: false,
      transparent: true
    });

    this.logo = new THREE.ShaderMaterial({
      uniforms: {
        src: {value: new THREE.TextureLoader().load(document.getElementById('logotexImg').src)},
      },
      vertexShader: flatShaders.vertexShader,
      fragmentShader: flatShaders.fragmentShader,
      depthTest: false,
      fog: false,
      transparent: true
    });

    this.logoadditive = new THREE.ShaderMaterial({
      uniforms: {
        src: {value: new THREE.TextureLoader().load(document.getElementById('logotexImg').src)},
      },
      vertexShader: flatShaders.vertexShader,
      fragmentShader: flatShaders.fragmentShader,
      depthTest: false,
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
