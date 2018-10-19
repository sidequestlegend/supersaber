var audioContext = new window.AudioContext();
var sourceCreatedCallback = null;

// Allows for modifying detune. PR has been sent to three.js.
THREE.Audio.prototype.play = function () {
  if (this.isPlaying === true) {
    console.warn('THREE.Audio: Audio is already playing.');
    return;
  }

  if (this.hasPlaybackControl === false) {
    console.warn('THREE.Audio: this Audio has no playback control.');
    return;
  }

  var source = this.context.createBufferSource();
  source.buffer = this.buffer;
  source.detune.value = this.detune;
  source.loop = this.loop;
  source.onended = this.onEnded.bind(this);
  source.playbackRate.setValueAtTime(this.playbackRate, this.startTime);
  this.startTime = this.context.currentTime;
  if (sourceCreatedCallback) { sourceCreatedCallback(source); }
  source.start(this.startTime, this.offset);

  this.isPlaying = true;

  this.source = source;
  return this.connect();
};

/**
 * Beat hit sound using positional audio and audio buffer source.
 */
AFRAME.registerComponent('beat-hit-sound', {
  dependencies: ['sound__beathit'],

  init: function () {
    this.currentBeatEl = null;
    this.currentCutDirection = '';
    this.el.setAttribute('sound__beathit', {
      poolSize: 12,
      src: 'assets/sounds/beatHit.ogg',
      volume: 0.5
    });
    this.processSound = this.processSound.bind(this);

    sourceCreatedCallback = this.sourceCreatedCallback.bind(this);
  },

  playSound: function (beatEl, cutDirection) {
    const soundPool = this.el.components.sound__beathit;
    this.currentBeatEl = beatEl;
    this.currentCutDirection = cutDirection;
    soundPool.playSound(this.processSound);
  },

  processSound: function (audio) {
    audio.detune = 0;
    this.currentBeatEl.object3D.getWorldPosition(audio.position);
  },

  sourceCreatedCallback: function (source) {
    source.detune.setValueAtTime(0, 0);
    if (this.currentCutDirection === 'down') {
      source.detune.linearRampToValueAtTime(-200, 1.5);
    }
    if (this.currentCutDirection === 'up') {
      source.detune.linearRampToValueAtTime(200, 1.5);
    }
  }
});
