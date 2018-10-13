const VOLUME = 0.5;

AFRAME.registerComponent('intro-song', {
  schema: {
    isPlaying: {default: true}
  },

  init: function () {
    this.analyserEl = document.getElementById('audioAnalyser');
    this.audio = document.getElementById('introSong');
    this.timeout = null;

    // anime.js animation to fade in volume.
    this.volumeTarget = {volume: 0};
    this.fadeInAnimation = AFRAME.ANIME({
      targets: this.volumeTarget,
      duration: 500,
      easing: 'easeInQuad',
      volume: VOLUME,
      autoplay: false,
      loop: false,
      update: () => {
        this.audio.volume = this.volumeTarget.volume;
      }
    });
  },

  update: function (oldData) {
    const audio = this.audio;

    if (!this.el.sceneEl.isPlaying) { return; }

    // Play.
    if (!oldData.isPlaying && this.data.isPlaying) {
      this.analyserEl.components.audioanalyser.resumeContext();
      this.analyserEl.setAttribute('audioanalyser', 'src', audio);
      this.fadeInAudio();
    }

    // Pause.
    if (oldData.isPlaying && !this.data.isPlaying) { audio.pause(); }
  },

  play: function () {
    this.fadeInAudio();
  },

  fadeInAudio: function () {
    this.audio.volume = 0;
    this.audio.play();
    this.volumeTarget.volume = 0;
    this.fadeInAnimation.restart();
  }
});
