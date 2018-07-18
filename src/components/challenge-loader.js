AFRAME.registerComponent('song-loader', {
  schema: {
    challengeId: {type: 'string'},
  },

  update: async function () {
    var challengeId = this.data.challengeId;
    var frameSystem = this.el.systems.frames;
    var punchSystem = this.el.systems.punches;

    if (!challengeId) {
      return;
    }

    const firstClient = new Client({ query: { id: challengeId } });
    const resp = await firstClient.challengeById(challengeId);
    const challenge = resp.performance;
    const auth = firstClient.serialize();

    const client = new Client({ auth });
    this.el.emit('challengeloadstart');

    console.log('Loading punches...');
    this.el.emit('challengeloadingpunches');
    const punches = await client.challengePunches(challenge);

    console.log('Loading frames...');
    this.el.emit('challengeloadingframes');
    const frames = await client.challengeFrames(challenge);

    history.pushState(
      '',
      challenge.song_name,
      updateQueryParam(window.location.href, 'challenge', this.data.challengeId)
    );

    document.title = `Soundboxing - ${challenge.song_name}`;
    this.el.emit('challengeloaded', {
      frames: frames,
      punches: punches,
      title: challenge.song_name,
      videoId: challenge.youtube_id,
    });

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
