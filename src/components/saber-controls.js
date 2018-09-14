AFRAME.registerComponent('saber-controls', {
  schema: {
    hand: {default: 'left', oneOf: ['left', 'right']}
  },

  init: function () {
    var el = this.el;
    var data = this.data;
    el.setAttribute('oculus-touch-controls', {hand: data.hand, model: false});
    el.setAttribute('vive-controls', {hand: data.hand, model: true});
    el.setAttribute('windows-motion-controls', {hand: data.hand, model: false});
    el.addEventListener('controllerconnected', this.initSaber.bind(this));
  },
  

  initSaber: function () {
    var el = this.el;
    var saberHandleEl = document.createElement('a-entity');
    var saberEl = this.saberEl = document.createElement('a-entity');
    var saberPivotEl = document.createElement('a-entity');
    var saberColor = this.data.hand === 'left' ? '#fdccd1' : '#b0ecfd';
    //saberColor = '#ffffff';

    this.boundingBox = new THREE.Box3();

    saberEl.setAttribute('material', {shader: 'flat', color: saberColor});
    saberEl.setAttribute('geometry', {primitive: 'box', height: 0.9, depth: 0.020, width: 0.020});
    saberEl.setAttribute('position', '0 -0.55 0');

    saberHandleEl.setAttribute('material', {shader: 'flat', color: '#151515'});
    saberHandleEl.setAttribute('geometry', {primitive: 'box', height: 0.2, depth: 0.025, width: 0.025});
    saberHandleEl.setAttribute('position', '0 0 0');

    saberPivotEl.setAttribute('rotation', '70 0 0');
    saberPivotEl.appendChild(saberHandleEl);
    saberPivotEl.appendChild(saberEl);
    el.appendChild(saberPivotEl);
  },

  tick: function () {
    if (!this.saberEl) { return; }
    this.boundingBox.setFromObject(this.saberEl.getObject3D('mesh'));
  }

});