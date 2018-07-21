var utils = require('../utils');

const challengeDataStore = {};
const hasInitialChallenge = !!AFRAME.utils.getUrlParameter('challenge');
const SEARCH_PER_PAGE = 6;

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
    search: {
      page: 0,
      hasNext: false,
      hasPrev: false,
      results: [],
    },
    searchResultsPage: []
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

      // Populate difficulty options.
      state.menuDifficulties.length = 0;
      for (let i = 0; i < challengeData.difficulties.length; i++) {
        state.menuDifficulties.push(challengeData.difficulties[i]);
      }
      state.menuDifficulties.sort(difficultyComparator);
      // Default to easiest difficulty.
      state.menuSelectedChallenge.difficulty = state.menuDifficulties[0];

      state.menuSelectedChallenge.image = utils.getS3FileUrl(id, 'image.jpg');
      state.menuSelectedChallenge.downloadsText = `${challengeData.downloads} Plays`;
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

    searchprevpage: function (state) {
      if (state.search.page === 0) { return; }
      state.search.page--;
      computeSearchPagination(state);
    },

    searchnextpage: function (state) {
      if (state.search.page > Math.floor(state.search.results.length / SEARCH_PER_PAGE)) {
        return;
      }
      state.search.page++;
      computeSearchPagination(state);
    },

    /**
     * Update search results. Will automatically render using `bind-for` (menu.html).
     */
    searchresults: (state, payload) => {
      var i;
      state.search.page = 0;
      state.search.results = payload.results;
      for (i = 0; i < payload.results.length; i++) {
        let result = payload.results[i];
        result.songSubName = result.songSubName || 'Unknown Arist';
        result.shortSongName = truncate(result.songName, 32);
        result.shortSongSubName = truncate(result.songSubName, 32);
        challengeDataStore[result.id] = result
      }
      computeSearchPagination(state);
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
  // computeState: (state) => { }
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

function computeSearchPagination (state) {
  let numPages = Math.ceil(state.search.results.length / SEARCH_PER_PAGE);
  state.search.hasPrev = state.search.page > 0;
  state.search.hasNext = state.search.page < numPages - 1;

  state.searchResultsPage.length = 0;
  for (i = state.search.page * SEARCH_PER_PAGE;
       i < state.search.page * SEARCH_PER_PAGE + SEARCH_PER_PAGE; i++) {
    if (!state.search.results[i]) { break; }
    state.searchResultsPage.push(state.search.results[i]);
  }
}

function truncate (str, length) {
  if (!str) { return ''; }
  if (str.length >= length) {
    return str.substring(0, length - 3) + '...';
  }
  return str;
}

const DIFFICULTIES = ['Easy', 'Normal', 'Hard', 'Expert', 'ExpertPlus'];
function difficultyComparator (a, b) {
  const aIndex = DIFFICULTIES.indexOf(a);
  const bIndex = DIFFICULTIES.indexOf(b);
  if (aIndex < bIndex) { return -1; }
  if (aIndex > bIndex) { return 1; }
  return 0;
}
