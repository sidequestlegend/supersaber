const utils = require('../utils');

var ONCE = {once: true};
var BASE_VOLUME = 0.75;

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
    this.songLoadingIndicator = document.getElementById('songLoadingIndicator');

    this.victory = this.victory.bind(this);

    // Base volume.
    this.audioAnalyser.gainNode.gain.value = BASE_VOLUME;

    this.el.addEventListener('pausemenurestart', this.onRestart.bind(this));
    this.el.addEventListener('wallhitstart', this.onWallHitStart.bind(this));
    this.el.addEventListener('wallhitend', this.onWallHitEnd.bind(this));
  },

  update: function (oldData) {
    var data = this.data;

    // Game over, slow down audio, and then stop.
    if (!oldData.isGameOver && data.isGameOver && this.source) {
      this.source.playbackRate.setValueAtTime(this.source.playbackRate.value,
                                              this.context.currentTime);
      this.source.playbackRate.linearRampToValueAtTime(0, this.context.currentTime + 3.5);
      this.audioAnalyser.gainNode.gain.setValueAtTime(this.audioAnalyser.gainNode.gain.value,
                                                      this.context.currentTime);
      this.audioAnalyser.gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + 3.5);
      setTimeout(() => { this.stopAudio(); }, 3500);
      return;
    }

    if (oldData.isGameOver && !data.isGameOver) {
      this.audioAnalyser.gainNode.value = BASE_VOLUME;
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
        // Finished decoding.
        this.source = evt.detail;
        this.source.onended = this.victory;
        resolve(this.source);
      }, ONCE);
      this.analyserSetter.src = utils.getS3FileUrl(data.challengeId, 'song.ogg');
      data.analyserEl.setAttribute('audioanalyser', this.analyserSetter);
      this.audioAnalyser.xhr.addEventListener('progress', evt => {
        // Finished fetching.
        this.onFetchProgress(evt);
      });
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
  },

  onFetchProgress: function (evt) {
    const progress = evt.loaded / evt.total;
    this.songLoadingIndicator.setAttribute('geometry', 'thetaLength', progress * 360);
    if (progress >= 1) { this.el.sceneEl.emit('songfetchfinish', null, false); }
  },

  onRestart: function () {
    // Restart, get new buffer source node and play.
    if (this.source) { this.source.disconnect(); }
    this.data.analyserEl.addEventListener('audioanalyserbuffersource', evt => {
      this.source = evt.detail;
      if (this.data.isBeatsPreloaded) { this.source.start(); }
    }, ONCE);
    this.audioAnalyser.refreshSource();
  },

  onWallHitStart: function () {
    const gain = this.audioAnalyser.gainNode.gain;
    gain.linearRampToValueAtTime(0.2, this.context.currentTime + 0.1);
    this.source.detune.linearRampToValueAtTime(-1000, this.context.currentTime + 0.1);
  },

  onWallHitEnd: function () {
    const gain = this.audioAnalyser.gainNode.gain;
    gain.linearRampToValueAtTime(BASE_VOLUME, this.context.currentTime + 0.2);
    this.source.detune.linearRampToValueAtTime(0, this.context.currentTime + 0.2);
  }
});
