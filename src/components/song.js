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
    const audio = this.audio = document.createElement('audio');
    audio.setAttribute('id', 'song');
    audio.crossOrigin = 'anonymous';
    this.el.sceneEl.appendChild(audio);

    this.el.addEventListener('pausemenurestart', () => {
      if (audio.paused) {
        audio.currentTime = 0;
        audio.play();
      }
    });

    audio.addEventListener('ended', () => {
      if (this.data.isPlaying) {
        this.el.sceneEl.emit('victory', null, false);
        audio.pause();
        audio.currentTime = 0;
      }
    });

    this.el.addEventListener('slowdown', this.slowDown.bind(this));
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
    if (data.isPlaying && data.challengeId && this.audio.paused) {
      console.log(`Playing ${this.audio.src}...`);
      this.data.analyserEl.setAttribute('audioanalyser', 'src', audio);
      audio.playbackRate = 1;
      audio.volume = 1;
      audio.play();
      return;
    } else if ((!data.isPlaying || !data.challengeId) && !audio.paused) {
      audio.pause();
    }
  },

  slowDown: function (ev) {
    var progress = ev.detail.progress;
    if (progress > 0.01){
      this.audio.playbackRate = 0.5 + progress / 2.0;
      this.audio.volume = progress;
    }
    else {
      this.audio.pause();
    }
  }
});
