const utils = require('../utils');

const GAME_OVER_LENGTH = 3.5;
const ONCE = {once: true};
const BASE_VOLUME = 0.75;

/**
 * Active challenge song / audio.
 *
 * Order of song init in conjuction with beat-loader:
 *
 * 1. previewStartTime is playing
 * 2. songloadfinish
 * 3. beat-loader preloading
 * 4. preloaded beats generated
 * 5. beat-loader preloading finish
 * 6. startAudio / songStartTime is set
 * 7. beat-loader continues off song current time
 */
AFRAME.registerComponent('song', {
  schema: {
    analyserEl: {type: 'selector', default: '#audioAnalyser'},
    challengeId: {default: ''},
    isBeatsPreloaded: {default: false},
    isGameOver: {default: false},
    isPlaying: {default: false},
    isVictory: {default: false}
  },

  init: function () {
    this.analyserSetter = {buffer: true};
    this.audioAnalyser = this.data.analyserEl.components.audioanalyser;
    this.context = this.audioAnalyser.context;
    this.songLoadingIndicator = document.getElementById('songLoadingIndicator');
    this.songStartTime = 0;

    this.victory = this.victory.bind(this);

    // Base volume.
    this.audioAnalyser.gainNode.gain.value = BASE_VOLUME;

    this.el.addEventListener('gamemenurestart', this.onRestart.bind(this));
    this.el.addEventListener('wallhitstart', this.onWallHitStart.bind(this));
    this.el.addEventListener('wallhitend', this.onWallHitEnd.bind(this));

    if (process.env.NODE_ENV !== 'production') {
      this.el.addEventListener('victoryfake', () => {
        this.source.stop();
        this.source.disconnect();
        this.victory();
      });
    }
  },

  update: function (oldData) {
    var data = this.data;

    // Game over, slow down audio, and then stop.
    if (!oldData.isGameOver && data.isGameOver) {
      this.onGameOver();
      return;
    }

    if (oldData.isGameOver && !data.isGameOver) {
      this.audioAnalyser.gainNode.value = BASE_VOLUME;
    }

    // On victory screen, play song in background.
    if (!oldData.isVictory && data.isVictory) {
      this.data.analyserEl.addEventListener('audioanalyserbuffersource', evt => {
        this.audioAnalyser.resumeContext();
        const gain = this.audioAnalyser.gainNode.gain;
        gain.cancelScheduledValues(0);
        gain.setValueAtTime(0.05, 0);
        this.source = evt.detail;
        this.source.start();
      }, ONCE);
      this.audioAnalyser.refreshSource();
      return;
    }

    // New challenge, play if we have loaded and were waiting for beats to preload.
    if (!oldData.isBeatsPreloaded && this.data.isBeatsPreloaded && this.source) {
      this.startAudio();
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
        resolve(this.source);
      }, ONCE);
      this.analyserSetter.src = utils.getS3FileUrl(data.challengeId, 'song.ogg');
      data.analyserEl.setAttribute('audioanalyser', this.analyserSetter);

      // Already loaded.
      if (this.audioAnalyser.xhr.response) {
        this.songLoadingIndicator.setAttribute('material', 'progress', 1);
        this.el.sceneEl.emit('songfetchfinish', null, false);
        return;
      }

      this.audioAnalyser.xhr.addEventListener('progress', evt => {
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
    this.songLoadingIndicator.setAttribute('material', 'progress', progress);
    if (progress >= 1) {
      this.el.sceneEl.emit('songfetchfinish', null, false);
    }
  },

  onGameOver: function () {
    // Playback rate.
    const playbackRate = this.source.playbackRate;
    playbackRate.setValueAtTime(playbackRate.value, this.context.currentTime);
    playbackRate.linearRampToValueAtTime(0, this.context.currentTime + GAME_OVER_LENGTH);

    // Gain.
    const gain = this.audioAnalyser.gainNode.gain;
    gain.setValueAtTime(gain.value, this.context.currentTime);
    gain.linearRampToValueAtTime(0, this.context.currentTime + GAME_OVER_LENGTH);

    setTimeout(() => {
      if (!this.data.isGameOver) { return; }
      this.stopAudio();
    }, 3500);
  },

  onRestart: function () {
    // Restart, get new buffer source node and play.
    if (this.source) { this.source.disconnect(); }

    // Clear gain interpolation values from game over.
    const gain = this.audioAnalyser.gainNode.gain;
    gain.cancelScheduledValues(0);

    this.data.analyserEl.addEventListener('audioanalyserbuffersource', evt => {
      this.source = evt.detail;
      this.el.sceneEl.emit('songloadfinish', null, false);
    }, ONCE);
    this.audioAnalyser.refreshSource();
  },

  onWallHitStart: function () {
    const gain = this.audioAnalyser.gainNode.gain;
    gain.linearRampToValueAtTime(0.2, this.context.currentTime + 0.1);
  },

  onWallHitEnd: function () {
    const gain = this.audioAnalyser.gainNode.gain;
    gain.linearRampToValueAtTime(BASE_VOLUME, this.context.currentTime + 0.1);
  },

  startAudio: function () {
    const gain = this.audioAnalyser.gainNode.gain;
    gain.setValueAtTime(BASE_VOLUME, this.context.currentTime);
    this.songStartTime = this.context.currentTime;
    this.source.onended = this.victory;
    this.source.start();
  },

  getCurrentTime: function () {
    return this.context.currentTime - this.songStartTime;
  }
});
