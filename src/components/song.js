const utils = require('../utils');

/**
 * Active challenge song / audio.
 */
AFRAME.registerComponent('song', {
  schema: {
    analyserEl: {type: 'selector', default: '#audioAnalyser'},
    challengeId: {default: ''},
    isPlaying: {default: false}
  },

  init: function () {
    // Use audio element for audioanalyser.
    this.audio = document.createElement('audio');
    this.audio.setAttribute('id', 'song');
    this.audio.crossOrigin = 'anonymous';
    this.el.sceneEl.appendChild(this.audio);
  },

  update: function (oldData) {
    var audio =  this.audio;
    var el = this.el;
    var data = this.data;

    // Changed challenge.
    if (data.challengeId !== oldData.challengeId) {
      let songUrl = utils.getS3FileUrl(data.challengeId, 'song.ogg');
      audio.setAttribute('src', data.challengeId ? songUrl : '');
    }

    // Keep playback state up to date.
    if ((data.isPlaying && data.challengeId) && this.audio.paused) {
      console.log(`Playing ${this.audio.src}...`);
      this.data.analyserEl.setAttribute('audioanalyser', 'src', audio);
      audio.play();
      return;
    } else if ((!data.isPlaying || !data.challengeId) && !audio.paused) {
      audio.pause();
    }
  }
});
