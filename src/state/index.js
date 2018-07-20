var utils = require('../utils');

var hasInitialChallenge = !!AFRAME.utils.getUrlParameter('challenge');

var challengeDataStore = {};

AFRAME.registerState({
  initialState: {
    challenge: {
      difficulty: '',
      id: AFRAME.utils.getUrlParameter('challenge'),
      isLoading: false
    },
    inVR: false,
    maxStreak: 0,
    menu: {
      active: true
    },
    menuDifficulties: [],
    menuSelectedChallenge: {
      id: '',
      image: ''
    },
    playButtonText: 'Play',
    score: 0,
    scoreText: '',
    // screen: keep track of layers or depth. Like breadcrumbs.
    screen: hasInitialChallenge ? 'challenge' : 'home',
    screenHistory: [],
    searchResults: [],
    streak: 0
  },

  handlers: {
    beatloaderfinish: function (state, payload) {
      state.challenge.isLoading = false;
    },

    beatloaderstart: function (state, payload) {
      state.challenge.isLoading = true;
    },

    challengeset: function (state, payload) {
      state.challenge.id = payload.challengeId;
      state.score = 0;
      state.streak = 0;
      state.maxStreak = 0;
      state.menu.active = false;
      state.menuSelectedChallenge.id = '';
      setScreen(state, 'challenge');
    },

    /**
     * Song clicked from menu.
     */
    menuchallengeselect: function (state, id) {
      let challengeData = challengeDataStore[id];
      state.menuSelectedChallenge.id = id;
      state.menuDifficulties.length = 0;
      for (let i = 0; i < challengeData.difficulties.length; i++) {
        state.menuDifficulties.push(challengeData.difficulties[i]);
      }
      state.menuSelectedChallenge.image = utils.getS3FileUrl(id, 'image.jpg');
    },

    menudifficultyselect: function (state, difficulty) {
      state.menuSelectedChallenge.difficulty = difficulty;
    },

    playbuttonclick: function (state) {
      state.menu.active = false;
    },

    /**
     * Update search results. Will automatically render using `bind-for` (menu.html).
     */
    searchresults: function (state, payload) {
      var i;
      state.searchResults.length = 0;
      for (i = 0; i < 6; i++) {
        if (!payload.results[i]) { continue; }
        challengeDataStore[payload.results[i].id] = payload.results[i];
        payload.results[i].songSubName = payload.results[i].songSubName || 'Unknown Arist';
        state.searchResults.push(payload.results[i]);
      }
      state.searchResults.__dirty = true;
    },

    togglemenu: function (state) {
      state.menu.active = !state.menu.active;
    },

    'enter-vr': function (state, payload) {
      state.inVR = true;
    },

    'exit-vr': function (state, payload) {
      state.inVR = false;
    }
  },

  computeState: function (state) {
    state.scoreText = `Streak: ${state.streak} / Max Streak: ${state.maxStreak} / Score: ${state.score}`;
  }
});

/**
 * Push screen onto history and set to current.
 */
function setScreen (state, screen) {
  if (state.screen === screen) { return; }
  state.screenHistory.push(screen);
  state.screen = screen;
}

/**
 * Pop screen off history.
 * Set new current screen if any.
 */
function popScreen (state) {
  var prevScreen;
  prevScreen = state.screenHistory.pop();
  if (state.screenHistory.length === 0) {
    state.screen = '';
    return;
  }
  state.screen = state.screenHistory[state.screenHistory.length - 1];
}
