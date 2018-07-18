var algoliasearch = require('algoliasearch/lite');

var client = algoliasearch('QULTOY3ZWU', 'be07164192471df7e97e6fa70c1d041d');
var index = client.initIndex('supersaber');

/**
 * Search (including the initial list of popular searches).
 */
AFRAME.registerComponent('search', {
  init: function() {
    this.eventDetail = {results: []};
    this.queryObject = {query: ''};

    // Populate popular.
    this.search('');
  },

  search: function (query) {
    this.queryObject.query = query;
    index.search(this.queryObject, (err, content) => {
      this.eventDetail.results = content.hits;
      console.log(content.hits);
      this.el.sceneEl.emit('searchresults', this.eventDetail);
    });
  }
});

/**
 * Click listener for search result.
 */
AFRAME.registerComponent('search-result', {
  init: function() {
    var el = this.el;

    this.eventDetail = {};
    el.addEventListener('click', () => {
      this.eventDetail.challengeId = el.getAttribute('data-song-id');
      this.eventDetail.title = el.getAttribute('data-title');
      el.sceneEl.emit('challengeset', this.eventDetail);
    });
  },
});
