var utils = require('../utils');

/**
 * Load beat data (all the beats and such).
 */
AFRAME.registerComponent('beat-loader', {
  schema: {
    challengeId: {type: 'string'},
    difficulty: {type: 'string'}
  },

  update: function () {
    if (!this.data.challengeId || !this.data.difficulty) { return; }
    this.loadBeats(this.data.challengeId, this.data.difficulty);
  },

  /**
   * XHR.
   */
  loadBeats: function (id, difficulty) {
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

  /**
   * TODO: Load the beat data into the game.
   */
  handleBeats: function (beatData) {
    this.el.sceneEl.emit('beatloaderfinish', beatData, false);
    console.log('Finished loading challenge data.');
  },
});

function updateQueryParam(uri, key, value) {
  var re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
  var separator = uri.indexOf('?') !== -1 ? '&' : '?';
  if (uri.match(re)) {
    return uri.replace(re, '$1' + key + '=' + value + '$2');
  } else {
    return uri + separator + key + '=' + value;
  }
}
