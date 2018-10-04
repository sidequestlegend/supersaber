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

AFRAME.registerComponent('search-result-image', {
  dependencies: ['material'],

  schema: {
    id: {type: 'string'}
  },

  init: function () {
    this.materialUpdateObj = {color: '#223'};

    this.el.addEventListener('materialtextureloaded', () => {
      this.el.setAttribute('material', 'color', '#FFF');
    });
  },

  update: function () {
    this.el.components.material.material.map = null;
    this.el.components.material.material.needsUpdate = true;

    this.materialUpdateObj.src =
      `https://s3-us-west-2.amazonaws.com/supersaber/${this.data.id}-image.jpg`
    this.el.setAttribute('material', this.materialUpdateObj);
  },
});
