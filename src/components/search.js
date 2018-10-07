var algoliasearch = require('algoliasearch/lite');
var bindEvent = require('aframe-event-decorators').bindEvent;

var client = algoliasearch('QULTOY3ZWU', 'be07164192471df7e97e6fa70c1d041d');
var algolia = client.initIndex('supersaber');

/**
 * Search (including the initial list of popular searches).
 * Attached to super-keyboard.
 */
AFRAME.registerComponent('search', {
  init: function() {
    this.eventDetail = {results: []};
    this.popularHits = null;
    this.queryObject = {hitsPerPage: 100, query: ''};

    // Populate popular.
    this.search('');

    // Less hits on normal searches.
    this.queryObject.hitsPerPage = 30;
  },

  superkeyboardchange: bindEvent(function (evt) {
    this.search(evt.detail.value);
  }),

  search: function (query) {
    // Use cached for popular hits.
    if (!query && this.popularHits) {
      this.eventDetail.results = this.popularHits;
      this.el.sceneEl.emit('searchresults', this.eventDetail);
      return;
    }

    this.queryObject.query = query;
    algolia.search(this.queryObject, (err, content) => {
      // Cache popular hits.
      if (!query) { this.popularHits = content.hits; }
      this.eventDetail.results = content.hits;
      this.el.sceneEl.emit('searchresults', this.eventDetail);
    });
  }
});

/**
 * Click listener for search result.
 */
AFRAME.registerComponent('search-result-list', {
  click: bindEvent(function (evt) {
    this.el.sceneEl.emit('menuchallengeselect',
                         evt.target.closest('.searchResult').dataset.id,
                         false);
  }),
});

AFRAME.registerComponent('search-song-name-selected', {
  schema: {
    anchor: {default: 0},
    index: {default: 0},
    offset: {default: 0},
    selectedChallengeId: {default: ''}
  },

  update: function () {
    const data = this.data;
    const el = this.el;
    el.object3D.visible = !!data.selectedChallengeId && data.index !== -1;
    el.object3D.position.y = data.index * data.offset + data.anchor;
  }
});
