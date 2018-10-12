var audioContext = new window.AudioContext();

// Allows for modifying detune. PR has been sent to three.js.
THREE.Audio.prototype.play = function () {
  if ( this.isPlaying === true ) {
    console.warn( 'THREE.Audio: Audio is already playing.' );
    return;
  }

  if ( this.hasPlaybackControl === false ) {
    console.warn( 'THREE.Audio: this Audio has no playback control.' );
    return;
  }

  var source = this.context.createBufferSource();
  source.buffer = this.buffer;
  source.detune.value = this.detune;
  source.loop = this.loop;
  source.onended = this.onEnded.bind( this );
  source.playbackRate.setValueAtTime( this.playbackRate, this.startTime );
  this.startTime = this.context.currentTime;
  source.start( this.startTime, this.offset );

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
    this.processSound = this.processSound.bind(this);
  },

  playSound: function (beatEl) {
    const soundPool = this.el.components.sound__beathit;
    this.currentBeatEl = beatEl;
    soundPool.playSound(this.processSound);
  },

  processSound: function (audio) {
    // Randomize a bit.
    audio.detune = (Math.random() * 2000);
    audio.playbackRate = 1 - (Math.random() * .20);
    this.currentBeatEl.object3D.getWorldPosition(audio.position);
  }
});
