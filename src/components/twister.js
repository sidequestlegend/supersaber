AFRAME.registerComponent('twister', {
  schema: {
    enabled: {default: false},
    twist: {default: 0},
    vertices: {default: 4, type: 'int'},
    count: {default: 20, type: 'int'},
    positionIncrement: {default: 2},
    radiusIncrement: {default: 0.5},
    thickness: {default: 0.4}
  },

  init: function () {
    this.currentTwist = 0;
    this.animate = false;
    this.el.addEventListener('audioanalyser-beat', this.pulse.bind(this));
  },

  pulse: function () {
    if (!this.data.enabled) { return; }
    this.el.setAttribute('twister', {twist: Math.random() * 0.5 - 0.25});
  },

  update: function (oldData) {
    var radius = 4;
    var segment;
    var lastSegment;

    if (Math.abs(this.data.twist - this.currentTwist) > 0.001){
      this.animate = true;
      return;
    }

    this.clearSegments();
    lastSegment = this.el.object3D;

    for (var i = 0; i < this.data.count; i++) {
      segment = this.createSegment(radius);
      segment.position.y = this.data.positionIncrement;
      lastSegment.add(segment);
      lastSegment = segment;
      radius += this.data.radiusIncrement;
    }
  },

  createSegment: function (radius) {
    const R = this.data.thickness;
    var points = [
      new THREE.Vector2(radius - R,  R),
      new THREE.Vector2(radius - R, -R),
      new THREE.Vector2(radius + R, -R),
      new THREE.Vector2(radius + R,  R),
      new THREE.Vector2(radius - R,  R)
    ];
    var material = this.el.sceneEl.systems.materials.black;
    var geometry = new THREE.LatheBufferGeometry(points, this.data.vertices);
    var segment = new THREE.Mesh(geometry, material);
    return segment;
  },

  clearSegments: function () {
    this.el.object3D.remove(this.el.object3D.children[0]);
  },

  tick: function (time, delta) {
    if (!this.animate) { return; }
    if (Math.abs(this.data.twist - this.currentTwist) < 0.001){
      this.animate = false;
    }

    this.currentTwist += (this.data.twist - this.currentTwist) * delta * 0.001;

    var child = this.el.object3D.children[0];
    while (child) {
      child.rotation.y = this.currentTwist;
      child = child.children[0];
    }
  }
});
