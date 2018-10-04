AFRAME.registerComponent('intro-song', {
  schema: {
    isPlaying: {default: true}
  },

  init: function () {
    this.analyserEl = document.getElementById('audioAnalyser');
    this.audio = document.getElementById('introSong');
  },

  update: function (oldData) {
    const audio = this.audio;

    if (!this.el.sceneEl.isPlaying) { return; }

    if (!oldData.isPlaying && this.data.isPlaying) {
      setTimeout(() => {
        // TODO: Fade in volume.
        this.analyserEl.setAttribute('audioanalyser', 'src', audio);
        audio.play();
      }, 1000);
    }

    if (oldData.isPlaying && !this.data.isPlaying) {
      audio.pause();
    }
  },

  play: function () {
    this.audio.volume = 0.5;
    this.audio.play();
  }
});
