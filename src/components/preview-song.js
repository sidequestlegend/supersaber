var utils = require('../utils');

/**
 * Handle song preview play, pause, fades.
 */
AFRAME.registerComponent('preview-song', {
  schema: {
    challengeId: {type: 'string'},
    previewStartTime: {type: 'number'}
  },

  init: function() {
    var el = this.el;
    this.audio = new Audio();
    this.audio.volume = 0;

    // anime.js animation.
    this.volumeTarget = {volume: 0};
    this.animation = AFRAME.anime({
      targets: this.volumeTarget,
      delay: 250,
      duration: 1500,
      easing: 'easeInQuad',
      volume: 0.5,
      autoplay: false,
      loop: false,
      update: () => {
        this.audio.volume = this.volumeTarget.volume;
      }
    });
  },

  update: function (oldData) {
    if (oldData.challengeId && !this.data.challengeId) {
      if (this.animation) { this.animation.pause(); }
      this.audio.pause();
      this.audio.src = '';
      return;
    }

    // Play preview.
    this.audio.currentTime = this.data.previewStartTime;
    this.audio.src = utils.getS3FileUrl(this.data.challengeId, 'song.ogg');
    this.audio.volume = 0;
    this.volumeTarget.volume = 0;
    this.audio.play();
    this.animation.restart();
  }
});
