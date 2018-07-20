var algoliasearch = require('algoliasearch/lite');
var bindEvent = require('aframe-event-decorators').bindEvent;
var utils = require('../utils');

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
AFRAME.registerComponent('search-result', {
  init: function() {
    var el = this.el;
    this.audio = new Audio();
    this.audio.currentTime = el.getAttribute('data-preview-start-time');
    this.audio.src = utils.getS3FileUrl(el.getAttribute('data-id'), 'song.ogg');
    this.audio.volume = 0;
    this.eventDetail = {};

    this.volumeTarget = {volume: 0};
    this.animation = AFRAME.anime({
      targets: this.volumeTarget,
      delay: 250,
      duration: 1500,
      easing: 'easeInQuad',
      volume: 0.5,
      autoplay: false,
      loop: false,
      update: () => {
        this.audio.volume = this.volumeTarget.volume;
      }
    });
  },

  remove: function () {
    if (this.animation) { this.animation.pause(); }
    this.audio.pause();
  },

  /**
   * Preview song.
   */
  mouseenter: bindEvent(function () {
    this.audio.volume = 0;
    this.volumeTarget.volume = 0;
    this.audio.play();
    this.animation.restart();
  }),

  mouseleave: bindEvent(function () {
    if (this.animation) { this.animation.pause(); }
    this.audio.pause();
  }),

  click: bindEvent(function () {
    var el = this.el;
    this.eventDetail.id = el.getAttribute('data-id');
    this.eventDetail.title = el.getAttribute('data-title');

    // Tell application we are starting a challenge and initiate beat-loader.
    el.sceneEl.emit('challengeset', this.eventDetail);
  }),
});
