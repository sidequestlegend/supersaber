const utils = require('../utils');

var once = {once: true};

/**
 * Active challenge song / audio.
 */
AFRAME.registerComponent('song', {
  schema: {
    analyserEl: {type: 'selector', default: '#audioAnalyser'},
    challengeId: {default: ''},
    isBeatsPreloaded: {default: false},
    isGameOver: {default: false},
    isPlaying: {default: false}
  },

  init: function () {
    this.analyserSetter = {buffer: true};
    this.audioAnalyser = this.data.analyserEl.components.audioanalyser;
    this.context = this.audioAnalyser.context;
    this.victory = this.victory.bind(this);

    // Base volume.
    this.audioAnalyser.gainNode.gain.value = 0.75;

    // Restart, get new buffer source node and play.
    this.el.addEventListener('pausemenurestart', () => {
      this.source.disconnect();
      this.data.analyserEl.addEventListener('audioanalyserbuffersource', evt => {
        this.source = evt.detail;
        if (this.data.isBeatsPreloaded) { this.source.start(); }
      }, once);
      this.audioAnalyser.refreshSource();
    });
  },

  update: function (oldData) {
    var audio =  this.audio;
    var el = this.el;
    var data = this.data;

    // Game over, slow down audio, and then stop.
    if (!oldData.isGameOver && data.isGameOver) {
      this.source.playbackRate.value = 0.75;
      setTimeout(() => {
        this.stopAudio();
      }, 2000);
      return;
    }

    // New challenge, play if we have loaded and were waiting for beats to preload.
    if (!oldData.isBeatsPreloaded && this.data.isBeatsPreloaded && this.source) {
      this.source.start();
    }

    if (oldData.challengeId && !data.challengeId) {
      this.stopAudio();
      return;
    }

    // New challenge, load audio and play when ready.
    if (oldData.challengeId !== data.challengeId && data.challengeId) {
      this.el.sceneEl.emit('songloadstart', null, false);
      this.getAudio().then(source => {
        this.el.sceneEl.emit('songloadfinish', null, false);
        if (this.data.isBeatsPreloaded) { source.start(); }
      }).catch(console.error);
    }

    // Pause / stop.
    if (oldData.isPlaying && !data.isPlaying) {
      this.audioAnalyser.suspendContext();
    }

    // Resume.
    if (!oldData.isPlaying && data.isPlaying && this.source) {
      this.audioAnalyser.resumeContext();
    }
  },

  getAudio: function () {
    const data = this.data;
    return new Promise(resolve => {
      data.analyserEl.addEventListener('audioanalyserbuffersource', evt => {
        this.source = evt.detail;
        this.source.onended = this.victory;
        resolve(this.source);
      }, once);
      this.analyserSetter.src = utils.getS3FileUrl(data.challengeId, 'song.ogg');
      data.analyserEl.setAttribute('audioanalyser', this.analyserSetter);
    });
  },

  stopAudio: function () {
    if (!this.source) {
      console.warn('[song] Tried to stopAudio, but not playing.');
      return;
    }
    this.source.stop();
    this.source.disconnect();
    this.source = null;
  },

  victory: function () {
    if (!this.data.isPlaying) { return; }
    this.el.sceneEl.emit('victory', null, false);
  }
});
