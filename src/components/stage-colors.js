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
    this.mineColor = { red: new THREE.Color(0x070304), blue: new THREE.Color(0x030407) };
    this.mineEmission = { red: new THREE.Color(0x090707), blue: new THREE.Color(0x070709) };
    this.mineMaterial = new THREE.MeshStandardMaterial({
      roughness: 0.38,
      metalness: 0.48,
      color: this.mineColor[this.data],
      emissive: this.mineEmission[this.data],
      envMap: this.mineEnvMap[this.data]
    });
  },

  update: function () {
    var red = (this.data == 'red');
    document.getElementById('backglow').setAttribute('material', {color: red ? '#f10' : '#00acfc'});
    document.getElementById('sky').setAttribute('material', {color: red ? '#770100': '#15252d'});
    this.el.sceneEl.setAttribute('fog', {color: red ? '#a00' : '#007cb9'});
    this.el.sceneEl.systems.materials.neon.color = red ? this.neonRed : this.neonBlue;
    this.el.sceneEl.systems.materials.default.color = red ? this.defaultRed : this.defaultBlue;
    this.mineMaterial.color = this.mineColor[this.data];
    this.mineMaterial.emissive = this.mineEmission[this.data];
    this.mineMaterial.envMap = this.mineEnvMap[this.data];
  }

});