var utils = require('../utils');

/**
 * Load beat data (all the beats and such).
 */
AFRAME.registerComponent('beat-loader', {
  schema: {
    beatAnticipationTime: {default: 2.0},
    beatSpeed: {default: 4.0},
    challengeId: {type: 'string'},
    difficulty: {type: 'string'},
    isPlaying: {default: false}
  },

  orientations: [180, 0, 270, 90, 225, 135, 315, 45, 0],
  horizontalPositions: [-0.60, -0.25, 0.25, 0.60],
  verticalPositions: [1.00, 1.35, 1.70],

  init: function () {
    this.beams = document.getElementById('beams').components.beams;
    this.beatData = null;
    this.beatContainer = document.getElementById('beatContainer');
    this.bpm = undefined;
    this.beatsTime = undefined;
    this.onKeyDown = this.onKeyDown.bind(this);

    this.el.addEventListener('cleargame', this.clearBeats.bind(this));
  },

  update: function (oldData) {
    const data = this.data;
    if (!data.challengeId || !data.difficulty) { return; }
    if (data.challengeId !== oldData.challengeId ||
        data.difficulty !== oldData.difficulty) {
      this.loadBeats();
    }
  },

  /**
   * XHR.
   */
  loadBeats: function () {
    var el = this.el;
    var xhr;

    // Load beats.
    let url = utils.getS3FileUrl(this.data.challengeId, `${this.data.difficulty}.json`);
    xhr = new XMLHttpRequest();
    el.emit('beatloaderstart');
    console.log(`Fetching ${url}...`);
    xhr.open('GET', url);
    xhr.addEventListener('load', () => {
      this.handleBeats(JSON.parse(xhr.responseText));
    });
    xhr.send();
  },

  onKeyDown: function (event) {
    var keyCode = event.keyCode;
    switch (keyCode) {
      case 32: // Space
        this.generateBeat({
          _lineIndex: 2,
          _lineLayer: 1,
          _cutDirection: 1,
          _type: 3
        });
        break;
      default:
        break;
    }
  },

  play: function () {
    window.addEventListener('keydown', this.onKeyDown);
  },

  pause: function () {
    window.removeEventListener('keydown', this.onKeyDown);
  },

  /**
   * Load the beat data into the game.
   */
  handleBeats: function (beatData) {
    this.el.sceneEl.emit('beatloaderfinish', beatData, false);
    var lessThan = function (a, b) {
      return a._time - b._time;
    };
    // Reset variables used during playback.
    // Beats spawn ahead of the song and get to the user in sync with the music.
    this.beatsTimeOffset = this.data.beatAnticipationTime * 1000;
    this.beatsTime = 0;

    this.beatData = beatData;
    this.beatData._obstacles.sort(lessThan);
    this.beatData._notes.sort(lessThan);
    this.bpm = this.beatData._beatsPerMinute;
    console.log('Finished loading challenge data.');
  },

  /**
   * Generate beats and stuff according to timestamp.
   */
  tick: function (time, delta) {
    var audioEl = this.el.components.song.audio;
    var bpm;
    var i;
    var notes;
    var obstacles;
    var beatsTime = this.beatsTime;
    var msPerBeat;
    var noteTime;

    if (!this.data.isPlaying || !this.data.challengeId || !this.beatData || !audioEl) { return; }

    // Re-sync song with beats playback.
    if (this.beatsTimeOffset !== undefined && this.songCurrentTime !== this.el.components.song.audio.currentTime) {
      this.songCurrentTime = this.el.components.song.audio.currentTime;
      this.beatsTime = (this.songCurrentTime + this.data.beatAnticipationTime) * 1000;
    }

    notes = this.beatData._notes;
    obstacles = this.beatData._obstacles;
    bpm = this.beatData._beatsPerMinute;
    msPerBeat = 1000 * 60 / this.beatData._beatsPerMinute;
    for (i = 0; i < notes.length; ++i) {
      noteTime = notes[i]._time * msPerBeat;
      if (noteTime > beatsTime && noteTime <= beatsTime + delta) {
        notes[i].time = noteTime;
        this.generateBeat(notes[i]);
      }
    }

    for (i=0; i < obstacles.length; ++i) {
      noteTime = obstacles[i]._time * msPerBeat;
      if (noteTime > beatsTime && noteTime <= beatsTime + delta) {
        //this.generateWall(obstacles[i]);
      }
    }

    if (this.beatsTimeOffset !== undefined) {
      if (this.beatsTimeOffset <= 0) {
        this.el.sceneEl.emit('beatloaderpreloadfinish', null, false);
        this.songCurrentTime = this.el.components.song.audio.currentTime;
        this.beatsTimeOffset = undefined;
      } else {
        this.beatsTimeOffset -= delta;
      }
    }

    this.beatsTime = beatsTime + delta;
  },

  generateBeat: (function () {
    const beatObj = {};
    // Beats arrive at sword stroke distance synced with the music.
    const swordOffset = 1.5;

    return function (noteInfo) {
      var beatEl;
      var color;
      var orientation;
      var type = noteInfo._cutDirection === 8 ? 'dot' : 'arrow';

      color = noteInfo._type === 0 ? 'red' : 'blue';
      if (noteInfo._type === 3) {
        type = 'mine';
        color = undefined;
      }
      beatEl = this.requestBeat(type, color);
      if (!beatEl) { return; }

      beatObj.color = color;
      beatObj.type = type;
      beatObj.speed = this.data.beatSpeed;
      beatEl.setAttribute('beat', beatObj);
      beatEl.object3D.position.set(
        this.horizontalPositions[noteInfo._lineIndex],
        this.verticalPositions[noteInfo._lineLayer],
        -this.data.beatAnticipationTime * this.data.beatSpeed - swordOffset
      );
      beatEl.object3D.rotation.z = THREE.Math.degToRad(this.orientations[noteInfo._cutDirection]);
      beatEl.play();

      this.beams.newBeam(color, beatEl.object3D.position);
    };
  })(),

  // generateWall: function (wallInfo) {
  //   var el = this.el.sceneEl.components.pool__wall.requestEntity();
  //   var speed = this.data.beatSpeed;
  //   var durationMs;
  //   if (!el) { return; }
  //   durationSeconds = 60 * (wallInfo._duration / this.bpm);
  //   el.setAttribute('wall', {
  //     speed: speed
  //   });
  //   el.object3D.position.set(
  //     this.horizontalPositions[wallInfo._lineIndex],
  //     1.30,
  //     -(this.data.beatAnticipationTime * speed)
  //   );
  //   el.object3D.scale.set(wallInfo._width * 0.30, 2.5, durationSeconds * speed);
  //   el.play();
  // },

  requestBeat: function (type, color) {
    var beatPoolName = 'pool__beat-' + type;
    var pool;
    if (color) { beatPoolName += '-' + color; }
    pool = this.el.sceneEl.components[beatPoolName];
    if (!pool) {
      console.warn('Pool ' + beatPoolName + ' unavailable');
      return;
    }
    return pool.requestEntity();
  },

  /**
   * Restart by returning all beats to pool.
   */
  clearBeats: function () {
    for (let i = 0; i < this.beatContainer.children.length; i++) {
      this.beatContainer.children[i].components.beat.returnToPool(true);
    }
  }
});
