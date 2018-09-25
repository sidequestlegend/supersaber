AFRAME.registerComponent('intro-song', {
  multiple: true,

  play: function () {
    const audio = document.getElementById('introSong');
    audio.volume = 0.5;
    audio.play();
  }
});
