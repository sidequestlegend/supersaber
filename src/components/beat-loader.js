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
    var challengeId = this.data.challengeId;
    var el = this.el;
    var xhr;

    if (!challengeId || !diffjculty) { return; }

    // Load beats.
    xhr = new XMLHttpRequest();
    el.emit('beatloaderstart');
    xhr.open('GET', utils.getS3FileUrl(challengeId, `${this.data.difficulty}.json`));
    xhr.addEventListener('load', () => {
      this.handleBeats(JSON.parse(xhr.responseText));
    });
    xhr.send();
  },

  /**
   * TODO: Load the beat data into the game.
   */
  handleBeats: function (beatData) {
    var el = this.el;

    history.pushState(
      '',
      challenge.songName,
      updateQueryParam(window.location.href, 'challenge', this.data.challengeId)
    );

    document.title = `Super Saber - ${challenge.songName}`;
    el.emit('beatloaderfinish');
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
