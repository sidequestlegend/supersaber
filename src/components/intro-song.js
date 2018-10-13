const VOLUME = 0.5;

AFRAME.registerComponent('intro-song', {
  schema: {
    isPlaying: {default: true}
  },

  init: function () {
    this.analyserEl = document.getElementById('audioAnalyser');
    this.audio = document.getElementById('introSong');
    this.timeout = null;

    this.el.setAttribute('animation__introsong', {
      property: 'components.intro-song.audio.volume',
      dur: 500,
      easing: 'easeInQuad',
      from: 0,
      to: 0.5,
      autoplay: false
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
    this.audio.volume = VOLUME;
    this.audio.play();
  },

  fadeInAudio: function () {
    this.audio.volume = 0;
    this.audio.play();
    this.el.components['animation__introsong'].beginAnimation();
  }
});
