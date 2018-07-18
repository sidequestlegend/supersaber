/**
 * Play audio element on event.
 */
AFRAME.registerComponent('play-audio', {
  schema: {
    audio: { type: 'string' },
    event: { type: 'string' },
    volume: { type: 'number', default: 1 },
  },

  multiple: true,

  init: function() {
    var audio;
    audio = document.querySelector(this.data.audio);
    audio.volume = this.data.volume;

    this.el.addEventListener(this.data.event, evt => {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
      audio.play();
    });
  },
});
