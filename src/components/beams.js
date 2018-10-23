const ANIME = AFRAME.ANIME || AFRAME.anime;

AFRAME.registerComponent('beams', {
  schema: {
    isPlaying: {default: false},
    poolSize: {default: 3}
  },

  init: function () {
    this.beams = [];
    this.redBeams = [];
    this.blueBeams = [];
    this.currentRed = 0;
    this.currentBlue = 0;

    const materialOptions = {
      color: 0xaa3333,
      map: new THREE.TextureLoader().load('assets/img/beam.png'),
      transparent: true,
      blending: THREE.AdditiveBlending
    };
    const redMaterial = new THREE.MeshBasicMaterial(materialOptions);
    const blueMaterial = new THREE.MeshBasicMaterial(materialOptions);
    const geo = new THREE.PlaneBufferGeometry(0.4, 50).translate(0, 25, 0);

    this.texture = materialOptions.map;

    for (let j = 0; j < 2; j++) {
      for (let i = 0; i < this.data.poolSize; i++) {
        let beam = new THREE.Mesh(geo, j === 0 ? redMaterial : blueMaterial);
        beam.visible = false;
        beam.animation = ANIME({
          autoplay: false,
          targets: beam.scale,
          x: 0.00001,
          duration: 300,
          easing: 'easeInCubic',
          complete: () => { beam.visible = false; }
        });

        this.el.object3D.add(beam);
        this[j === 0 ? 'redBeams' : 'blueBeams'].push(beam);
        this.beams.push(beam);
      }
    }

    this.clearBeams = this.clearBeams.bind(this);
    this.el.sceneEl.addEventListener('cleargame', this.clearBeams);
  },

  update: function () {
    for (let i = 0; i < this.beams.length; i++) {
      if (this.beams[i].time) {
        this.beams[i].visible = this.data.isPlaying;
      }
    }
  },

  /**
   * Use tick for manual ANIME animations, else it will create RAF.
   */
  tick: function (t, dt) {
    if (!this.data.isPlaying) { return; }
    for (let i = 0; i < this.beams.length; i++) {
      let beam = this.beams[i];
      // Tie animation state to beam visibility.
      if (!beam.visible) { continue; }
      beam.time += dt;
      beam.animation.tick(beam.time);
    }
  },

  newBeam: function (color, position) {
    var beam;
    if (color === 'red') {
      beam = this.redBeams[this.currentRed];
      this.currentRed = (this.currentRed + 1) % this.redBeams.length;
      // z offset to avoid z-fighting.
      beam.position.set(position.x, position.y, position.z + this.currentRed / 50.0);
    } else {
      beam = this.blueBeams[this.currentBlue];
      this.currentBlue = (this.currentBlue + 1) % this.blueBeams.length;
      beam.position.set(position.x, position.y, position.z + this.currentBlue / 50.0);
    }

    beam.visible = true;
    beam.scale.x = 1;
    beam.time = 0;
  },

  clearBeams: function () {
    for (let i = 0; i < this.beams.length; i++) {
      this.beams[i].visible = false;
      this.beams[i].time = 0;
      this.beams[i].scale.x = 1;
    }
  }
});
