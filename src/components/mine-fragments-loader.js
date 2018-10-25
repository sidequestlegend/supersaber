AFRAME.registerSystem('mine-fragments-loader', {
  init: function () {
    this.fragments = null;
    var objData = document.getElementById('mineBrokenObj');
    objData.addEventListener('loaded', (ev) => {
      var objLoader = new THREE.OBJLoader();
      this.fragments = objLoader.parse(ev.target.data);
    })
  }
});
