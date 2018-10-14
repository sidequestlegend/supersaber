AFRAME.registerComponent('stage-colors', {
  dependencies: ['background', 'fog'],

  schema: {
    color: {default: 'blue', oneOf: ['blue', 'red']}
  },

  init: function () {
    this.neonRed = new THREE.Color(0xff9999);
    this.neonBlue = new THREE.Color(0x9999ff);
    this.defaultRed = new THREE.Color(0xff0000);
    this.defaultBlue = new THREE.Color(0x0000ff);
    this.mineEnvMap = {
      red: new THREE.TextureLoader().load('assets/img/mineenviro-red.jpg'),
      blue: new THREE.TextureLoader().load('assets/img/mineenviro-blue.jpg')
    };
    this.mineColor = {red: new THREE.Color(0x070304), blue: new THREE.Color(0x030407)};
    this.mineEmission = {red: new THREE.Color(0x090707), blue: new THREE.Color(0x070709)};
    this.mineMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.38,
      metalness: 0.48,
      color: this.mineColor[this.data.color],
      emissive: this.mineEmission[this.data.color],
      envMap: this.mineEnvMap[this.data.color]
    });
    this.sky = document.getElementById('sky');
    this.backglow = document.getElementById('backglow');
    this.smoke1 = document.getElementById('smoke1');
    this.smoke2 = document.getElementById('smoke2');
    this.auxColor = new THREE.Color();
  },

  update: function (oldData) {
    const red = this.data.color === 'red';

    // Init or reset.
    this.backglow.getObject3D('mesh').material.color.set(red ? '#f10' : '#00acfc');
    this.sky.getObject3D('mesh').material.color.set(red ? '#f10' : '#00acfc');
    this.el.sceneEl.object3D.background.set(red ? '#770100' : '#15252d');
    this.el.sceneEl.object3D.fog.color.set(red ? '#a00' : '#007cb9');

    this.el.sceneEl.systems.materials.neon.color = red ? this.neonRed : this.neonBlue;
    this.el.sceneEl.systems.materials.default.color = red ? this.defaultRed : this.defaultBlue;

    this.mineMaterial.color = this.mineColor[red ? 'red' : 'blue'];
    this.mineMaterial.emissive = this.mineEmission[red ? 'red' : 'blue'];
    this.mineMaterial.envMap = this.mineEnvMap[red ? 'red' : 'blue'];
    this.mineMaterial.needsUpdate = true;
  }
});
