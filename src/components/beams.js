AFRAME.registerComponent('beams', {
  schema: {
    poolSize: {default: 3}
  },
  init: function () {
    var redMaterial;
    var blueMaterial;
    var materialOptions;
    var geo;
    var beam;

    this.redBeams = [];
    this.blueBeams = [];
    this.currentRed = 0;
    this.currentBlue = 0;

    materialOptions = {
      color: 0xaa3333,
      map: new THREE.TextureLoader().load('assets/img/beam.png'),
      transparent: true,
      blending: THREE.AdditiveBlending
    };
    redMaterial = new THREE.MeshBasicMaterial(materialOptions);
    materialOptions.color = 0x4444cc;
    blueMaterial = new THREE.MeshBasicMaterial(materialOptions);
    geo = new THREE.PlaneBufferGeometry(0.4, 50).translate(0, 25, 0);

    for (var j = 0; j < 2; j++) {
      for (var i = 0; i < this.data.poolSize; i++) {
        beam = new THREE.Mesh(geo, j === 0 ? redMaterial : blueMaterial);
        beam.visible = false;
        beam.anim = AFRAME.anime({
          targets: beam.scale,
          x: 0.00001,
          autoplay: false,
          duration: 300,
          easing: 'easeInCubic',
          complete: (anim) => { beam.visible = false; }
        });

        this.el.object3D.add(beam);
        this[j === 0 ? 'redBeams' : 'blueBeams'].push(beam);
      }
    }
  },

  newBeam: function (color, position) {
    var beam;
    if (color === 'red') {
      beam = this.redBeams[this.currentRed];
      this.currentRed = (this.currentRed + 1) % this.redBeams.length;
      beam.position.set(position.x, position.y, position.z + this.currentRed / 50.0); // z offset to avoid z-fighting
    } else {
      beam = this.blueBeams[this.currentBlue];
      this.currentBlue = (this.currentBlue + 1) % this.blueBeams.length;
      beam.position.set(position.x, position.y, position.z + this.currentBlue / 50.0);
    }

    beam.visible = true;
    beam.scale.x = 1;
    beam.anim.restart();
  }

});
