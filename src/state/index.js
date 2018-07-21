var utils = require('../utils');

var hasInitialChallenge = !!AFRAME.utils.getUrlParameter('challenge');

var challengeDataStore = {};

AFRAME.registerState({
  initialState: {
    challenge: {
      author: '',
      difficulty: '',
      id: AFRAME.utils.getUrlParameter('challenge'),
      image: '',
      isLoading: false,
      songName: '',
      songSubName: ''
    },
    inVR: false,
    menu: {
      active: true,
      playButtonText: 'Play'
    },
    menuDifficulties: [],
    menuSelectedChallenge: {
      author: '',
      difficulty: '',
      downloads: '',
      downloadsText: '',
      id: '',
      image: '',
      songName: '',
      songSubName: ''
    },
    score: {
      maxStreak: 0,
      score: 0,
      streak: 0
    },
    // screen: keep track of layers or depth. Like breadcrumbs.
    screen: hasInitialChallenge ? 'challenge' : 'home',
    screenHistory: [],
    searchResults: []
  },

  handlers: {
    beatloaderfinish: (state) => {
      state.challenge.isLoading = false;
    },

    beatloaderstart: (state) => {
      state.challenge.isLoading = true;
    },

    /**
     * Song clicked from menu.
     */
    menuchallengeselect: (state, id) => {
      // Copy from challenge store populated from search results.
      let challengeData = challengeDataStore[id];
      Object.assign(state.menuSelectedChallenge, challengeData);

      state.menuDifficulties.length = 0;
      for (let i = 0; i < challengeData.difficulties.length; i++) {
        state.menuDifficulties.push(challengeData.difficulties[i]);
      }

      state.menuSelectedChallenge.image = utils.getS3FileUrl(id, 'image.jpg');
      state.menuSelectedChallenge.downloadsText = `${challengeData.downloads} Plays`;

      // Choose first difficulty.
      // TODO: Default and order by easiest to hardest.
      state.menuSelectedChallenge.difficulty = state.menuDifficulties[0];
    },

    menudifficultyselect: (state, difficulty) => {
      state.menuSelectedChallenge.difficulty = difficulty;
    },

    /**
     * Start challenge.
     * Transfer staged challenge to the active challenge.
     */
    playbuttonclick: (state) => {
      // Reset score.
      state.score.maxStreak = 0;
      state.score.score = 0;
      state.score.streak = 0;

      // Set challenge. `beat-loader` is listening.
      Object.assign(state.challenge, state.menuSelectedChallenge);

      // Reset menu.
      state.menu.active = false;
      state.menuSelectedChallenge.id = '';
    },

    /**
     * Update search results. Will automatically render using `bind-for` (menu.html).
     */
    searchresults: (state, payload) => {
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

    togglemenu: (state) => {
      state.menu.active = !state.menu.active;
    },

    'enter-vr': (state) => {
      state.inVR = true;
    },

    'exit-vr': (state) => {
      state.inVR = false;
    }
  },

  /**
   * Post-process the state after each action.
   */
  computeState: (state) => {
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
