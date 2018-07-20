var algoliasearch = require('algoliasearch/lite');
var bindEvent = require('aframe-event-decorators').bindEvent;

var client = algoliasearch('QULTOY3ZWU', 'be07164192471df7e97e6fa70c1d041d');
var index = client.initIndex('supersaber');

/**
 * Search (including the initial list of popular searches).
 * Attached to super-keyboard.
 */
AFRAME.registerComponent('search', {
  init: function() {
    this.eventDetail = {results: []};
    this.queryObject = {query: ''};

    // Populate popular.
    this.search('');
  },

  superkeyboardchange: bindEvent(function (evt) {
    this.search(evt.detail.value);
  }),

  search: function (query) {
    this.queryObject.query = query;
    index.search(this.queryObject, (err, content) => {
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
    this.el.sceneEl.emit('menuchallengeclick', evt.target.closest('.searchResult').dataset.id,
                         false);
  }),
});
