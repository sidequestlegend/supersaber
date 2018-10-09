AFRAME.registerComponent('stage-colors', {
  schema: {
    default: 'red',
    oneOf: ['red', 'blue']
  },

  init: function () {
    this.neonRed  = new THREE.Color(0xff9999);
    this.neonBlue = new THREE.Color(0x9999ff);
    this.defaultRed  = new THREE.Color(0xff0000);
    this.defaultBlue = new THREE.Color(0x0000ff);
    this.mineEnvMap = {
      red:  new THREE.TextureLoader().load('assets/img/mineenviro-red.jpg'),
      blue: new THREE.TextureLoader().load('assets/img/mineenviro-blue.jpg')
    };
    this.mineColor = {red: new THREE.Color(0x070304), blue: new THREE.Color(0x030407)};
    this.mineEmission = {red: new THREE.Color(0x090707), blue: new THREE.Color(0x070709)};
    this.mineMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.38,
      metalness: 0.48,
      color: this.mineColor[this.data],
      emissive: this.mineEmission[this.data],
      envMap: this.mineEnvMap[this.data]
    });
    this.sky = document.getElementById('sky');
    this.backglow = document.getElementById('backglow');
    this.smoke1 = document.getElementById('smoke1');
    this.smoke2 = document.getElementById('smoke2');
    this.auxColor = new THREE.Color();
    this.el.addEventListener('slowdown', this.slowDown.bind(this));
  },

  update: function () {
    const red = this.data === 'red';
    this.backglow.setAttribute('material', {color: red ? '#f10' : '#00acfc', opacity: 0.8});
    this.sky.setAttribute('material', 'color', red ? '#f10' : '#00acfc');
    this.el.setAttribute('background', 'color', red ? '#770100': '#15252d');
    this.el.sceneEl.setAttribute('fog', 'color', red ? '#a00' : '#007cb9');
    this.el.sceneEl.systems.materials.neon.color = red ? this.neonRed : this.neonBlue;
    this.el.sceneEl.systems.materials.default.color = red ? this.defaultRed : this.defaultBlue;
    this.mineMaterial.color = this.mineColor[this.data];
    this.mineMaterial.emissive = this.mineEmission[this.data];
    this.mineMaterial.envMap = this.mineEnvMap[this.data];
    this.smoke1.setAttribute('material', 'opacity', 1);
    this.smoke2.setAttribute('material', 'opacity', 1);
  },

  slowDown: function (ev) {
    var progress = Math.max(0, ev.detail.progress);

    this.auxColor.setRGB(0.2 + progress * 0.46, 0, 0);
    this.el.sceneEl.setAttribute('fog', 'color', '#' + this.auxColor.getHexString());

    this.auxColor.setHSL(0.0014, 1, 0.23 * progress);
    this.el.sceneEl.setAttribute('background', 'color', '#' + this.auxColor.getHexString());

    this.auxColor.setRGB(0.1 + progress * 0.9, 0.066 * progress, 0);
    this.sky.setAttribute('material', 'color', '#' + this.auxColor.getHexString());

    this.backglow.setAttribute('material', 'opacity', 0.2 + progress * 0.5);
    this.smoke1.setAttribute('material', 'opacity', progress);
    this.smoke2.setAttribute('material', 'opacity', progress);
  }

});
