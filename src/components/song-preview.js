var utils = require('../utils');

/**
 * Song preview when search result selected with smart logic for preloading.
 */
AFRAME.registerComponent('song-preview-system', {
  schema: {
    selectedChallengeId: {type: 'string'}
  },

  init: function () {
    this.audio = null;
    this.audioStore = {};
    this.preloadedAudioIds = [];
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
    const preloadQueue = this.preloadQueue;

    if (oldData.selectedChallengeId &&
        oldData.selectedChallengeId !== data.selectedChallengeId) {
      this.stopSong();
    }

    if (data.selectedChallengeId &&
        oldData.selectedChallengeId !== data.selectedChallengeId) {
      if (!this.preloadedAudioIds.includes(data.selectedChallengeId) &&
          data.selectedChallengeId !== this.currentLoadingId) {
        // If not yet preloaded, pause the preload queue until this song is loaded.
        console.log(`[song-preview] Prioritizing loading of ${data.selectedChallengeId}`);
        this.priorityLoadingChallengeId = data.selectedChallengeId;
        this.audioStore[data.selectedChallengeId].addEventListener('loadeddata', () => {
          console.log(`[song-preview] Finished load of priority ${data.selectedChallengeId}`);
          this.preloadedAudioIds.push(data.selectedChallengeId);
          this.priorityLoadingChallengeId = '';
          // Resume preloading queue.
          if (preloadQueue.length) {
            console.log(`[song-preview] Resuming queue with ${preloadQueue[0].challengeId}`);
            this.preloadMetadata(preloadQueue[0]);
          }
        });

        // Remove from preload queue.
        for (let i = 0; i < preloadQueue.length; i++) {
          if (preloadQueue[i].challengeId === data.selectedChallengeId) {
            preloadQueue.splice(i, 1);
            break;
          }
        }
      }

      this.playSong(data.selectedChallengeId);
    }
  },

  queuePreloadSong: function (challengeId, previewStartTime) {
    if (this.audioStore[challengeId]) { return; }
    const audio = document.createElement('audio');
    audio.crossOrigin = 'anonymous';
    audio.currentTime = previewStartTime;
    audio.volume = 0;
    this.audioStore[challengeId] = audio;

    let src = utils.getS3FileUrl(challengeId, 'song.ogg');
    if (!this.currentLoadingId) {
      this.preloadMetadata({
        audio: audio,
        challengeId: challengeId,
        src: src
      });
    } else {
      this.preloadQueue.push({
        audio: audio,
        challengeId: challengeId,
        src: src
      });
    }
  },

  /**
   * Preload metadata of audio file for quick play.
   * Set `src` and `preload`.
   * A preload queue is set up so we only preload one at a time to not bog down
   * the network. If a song is selected to preview, we can bump it to the front of the
   * queue.
   */
  preloadMetadata: function (preloadItem) {
    const audio = preloadItem.audio;
    console.log(`[song-preview] Preloading song preview ${preloadItem.challengeId}`);
    audio.addEventListener('loadedmetadata', () => {
      console.log(`[song-preview] Finished preloading song preview ${preloadItem.challengeId}`);
      this.preloadedAudioIds.push(preloadItem.challengeId);
      this.currentLoadingId = '';
      console.log(`[song-preview] ${this.preloadQueue.length} in queue`);
      if (this.preloadQueue.length && !this.priorityLoadingChallengeId) {
        this.preloadMetadata(this.preloadQueue.shift());
      }
    });
    audio.preload = 'metadata';
    audio.src = preloadItem.src;
    this.currentLoadingId = preloadItem.challengeId;
  },

  stopSong: function () {
    if (!this.audio) { return; }
    if (this.animation) { this.animation.pause(); }
    if (!this.audio.paused) { this.audio.pause(); }
  },

  playSong: function (challengeId) {
    if (!challengeId) { return; }
    this.audio = this.audioStore[challengeId];
    this.audio.src = utils.getS3FileUrl(challengeId, 'song.ogg');
    this.audio.volume = 0;
    this.volumeTarget.volume = 0;
    this.audio.play();
    this.animation.restart();
    this.updateAnalyser();
  },

  updateAnalyser: function () {
    document.getElementById('introSong').pause();
    document.getElementById('audioanalyser').setAttribute('audioanalyser', 'src', this.audio);
  },

  clearSong: function (challengeId) {
    let audio = this.audioStore[challengeId];
    audio.preload = 'none';
    // Assume that paginating, clear the queue.
    this.preloadQueue.length = 0;
  }
});

/**
 * Data component attached to search result for song preview system.
 */
AFRAME.registerComponent('song-preview', {
  schema: {
    challengeId: {type: 'string'},
    previewStartTime: {type: 'number'}
  },

  play: function () {
    this.el.sceneEl.components['song-preview-system'].queuePreloadSong(
      this.data.challengeId, this.data.previewStartTime
    );
  },

  remove: function () {
    this.el.sceneEl.components['song-preview-system'].clearSong(this.data.challengeId);
  }
});
