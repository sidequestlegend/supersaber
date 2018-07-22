var utils = require('../utils');

AFRAME.registerComponent('song-preview-system', {
  schema: {
    selectedChallengeId: {type: 'string'}
  },

  init: function () {
    this.audio = null;
    this.audioStore = {};
    this.preloadQueue = [];

    // anime.js animation to fade in volume.
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
    const data = this.data;
    if (oldData.selectedChallengeId &&
        oldData.selectedChallengeId !== data.selectedChallengeId) {
      this.stopSong();
    }

    if (data.selectedChallengeId &&
        oldData.selectedChallengeId !== data.selectedChallengeId) {
      this.playSong(data.selectedChallengeId);
    }
  },

  preloadSong: function (challengeId, previewStartTime) {
    const audio = document.createElement('audio');
    audio.currentTime = previewStartTime;
    audio.src = utils.getS3FileUrl(challengeId, 'song.ogg');
    audio.volume = 0;
    this.audioStore[challengeId] = audio;

    if (this.preloadQueue.length === 0) {
      this.preloadMetadata(audio);
    } else {
      this.preloadQueue.push(audio);
    }
  },

  preloadMetadata: function (audio) {
    audio.addEventListener('loadedmetadata', () => {
      if (this.preloadQueue.length) {
        this.preloadMetadata(this.preloadQueue[0]);
      }
    });
    audio.preload = 'metadata';
  },

  stopSong: function () {
    if (!this.audio) { return; }
    if (this.animation) { this.animation.pause(); }
    if (!this.audio.paused) { this.audio.pause(); }
  },

  playSong: function (challengeId) {
    if (!challengeId) { return; }
    this.audio = this.audioStore[challengeId];
    this.audio.volume = 0;
    this.volumeTarget.volume = 0;
    this.audio.play();
    this.animation.restart();
  },

  clearSong: function (challengeId) {
    let audio = this.audioStore[challengeId];
    audio.preload = 'none';
    delete this.audioStore[challengeId];
    audio = null;
    this.preloadQueue.length = 0;
  }
});

/**
 * Handle song preview play, pause, fades.
 */
AFRAME.registerComponent('song-preview', {
  schema: {
    challengeId: {type: 'string'},
    previewStartTime: {type: 'number'}
  },

  play: function () {
    this.el.sceneEl.components['song-preview-system'].preloadSong(
      this.data.challengeId, this.data.previewStartTime
    );
  },

  remove: function () {
    this.el.sceneEl.components['song-preview-system'].clearSong(this.data.challengeId);
  }
});
