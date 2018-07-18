module.exports = function SoundPool (src, volume, size) {
  var currSound = 0;
  var i;
  var pool = [];
  var sound;

  for (i = 0; i < size; i++) {
    sound = new Audio(src);
    sound.volume = volume;
    sound.load();
    pool.push(sound);
  }

  return {
    play: function () {
      if (pool[currSound].currentTime === 0 || pool[currSound].ended) {
        pool[currSound].play();
      }
      currSound = (currSound + 1) % size;
    }
  };
};
