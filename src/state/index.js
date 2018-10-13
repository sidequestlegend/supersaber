var utils = require('../utils');

const challengeDataStore = {};
const hasInitialChallenge = !!AFRAME.utils.getUrlParameter('challenge');
const SEARCH_PER_PAGE = 6;
const SONG_NAME_TRUNCATE = 24;
const SONG_SUB_NAME_TRUNCATE = 32;

const DAMAGE_DECAY = 0.25;
const DAMAGE_MAX = 10;

/**
 * State handler.
 *
 * 1. `handlers` is an object of events that when emitted to the scene will run the handler.
 *
 * 2. The handler function modifies the state.
 *
 * 3. Entities and components that are `bind`ed automatically update:
 *    `bind__<componentName>="<propertyName>: some.item.in.state"`
 */
AFRAME.registerState({
  initialState: {
    activeHand: localStorage.getItem('hand') || 'right',
    challenge: {
      author: '',
      difficulty: '',
      id: AFRAME.utils.getUrlParameter('challenge'),
      image: '',
      isLoading: false,
      isBeatsPreloaded: false,
      songName: '',
      songSubName: ''
    },
    damage: 0,
    inVR: false,
    isGameOver: false,
    isPaused: false,  // Playing, but paused. Not active during menu.
    isPlaying: false,  // Not in the menu AND not paused.
    isSongLoading: false,
    isVictory: false,
    keyboardActive: false,
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
      index: -1,
      image: '',
      songName: '',
      songSubName: ''
    },
    multiplierText: '1x',
    score: {
      combo: 0,
      score: 0,
      multiplier: 1
    },
    search: {
      active: true,
      page: 0,
      hasNext: false,
      hasPrev: false,
      results: [],
      songNameTexts: '',
      songSubNameTexts: ''
    },
    searchResultsPage: []
  },

  handlers: {
    /**
     * Swap left-handed or right-handed mode.
     */
    activehandswap: state => {
      state.activeHand = state.activeHand === 'right' ? 'left' : 'right';
      localStorage.setItem('activeHand', state.activeHand);
    },

    beathit: state => {
      if (state.damage > DAMAGE_DECAY) {
        state.damage -= DAMAGE_DECAY;
      }
      state.score.score += 1;
      state.score.combo += 1;
    },

    beatmiss: state => {
      takeDamage(state);
    },

    beatwrong: state => {
      takeDamage(state);
    },

    beatloaderfinish: (state) => {
      state.challenge.isLoading = false;
    },

    beatloaderpreloadfinish: (state) => {
      state.challenge.isBeatsPreloaded = true;
    },

    beatloaderstart: (state) => {
      state.challenge.isBeatsPreloaded = false;
      state.challenge.isLoading = true;
    },

    keyboardclose: (state) => {
      state.keyboardActive = false;
    },

    keyboardopen: (state) => {
      state.keyboardActive = true;
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
        state.menuDifficulties.unshift(challengeData.difficulties[i]);
      }
      state.menuDifficulties.sort(difficultyComparator);
      // Default to easiest difficulty.
      state.menuSelectedChallenge.difficulty = state.menuDifficulties[0];

      state.menuSelectedChallenge.image = utils.getS3FileUrl(id, 'image.jpg');
      state.menuSelectedChallenge.downloadsText = `${challengeData.downloads} Plays`;
      computeMenuSelectedChallengeIndex(state);
    },

    menuchallengeunselect: () => {
      state.menuSelectedChallenge.id = '';
    },

    menudifficultyselect: (state, difficulty) => {
      state.menuSelectedChallenge.difficulty = difficulty;
    },

    pausegame: (state) => {
      if (!state.isPlaying) { return; }
      state.isPaused = true;
    },

    pausemenuresume: (state) => {
      state.isPaused = false;
    },

    pausemenurestart: (state) => {
      resetScore(state);
      state.isBeatsPreloaded = false;
      state.isGameOver = false;
      state.isPaused = false;
    },

    pausemenuexit: (state) => {
      resetScore(state);
      state.isBeatsPreloaded = false;
      state.isGameOver = false;
      state.isPaused = false;
      state.isVictory = false;
      state.menu.active = true;
      state.challenge.id = '';
    },

    /**
     * Start challenge.
     * Transfer staged challenge to the active challenge.
     */
    playbuttonclick: (state) => {
      resetScore(state);

      // Set challenge. `beat-loader` is listening.
      Object.assign(state.challenge, state.menuSelectedChallenge);

      // Reset menu.
      state.menu.active = false;
      state.menuSelectedChallenge.id = '';

      state.keyboardActive = false;
      state.challenge.isLoading = true;
      state.isSongLoading = true;
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
        result.songSubName = result.songSubName || 'Unknown Artist';
        result.shortSongName = truncate(result.songName, SONG_NAME_TRUNCATE).toUpperCase();
        result.shortSongSubName = truncate(result.songSubName, SONG_SUB_NAME_TRUNCATE);
        challengeDataStore[result.id] = result
      }
      computeSearchPagination(state);
      computeMenuSelectedChallengeIndex(state);
    },

    songloadfinish: (state) => {
      state.isSongLoading = false;
    },

    songloadstart: (state) => {
      state.isSongLoading = true;
    },

    'enter-vr': (state) => {
      state.inVR = true;
    },

    'exit-vr': (state) => {
      state.inVR = false;
    },

    victory: function (state) {
      state.isVictory = true;
    }
  },

  /**
   * Post-process the state after each action.
   */
  computeState: (state) => {
    state.isPlaying =
      !state.menu.active && !state.isPaused && !state.isVictory && !state.isGameOver &&
      !state.challenge.isLoading && !state.isSongLoading;
    state.leftRaycasterActive = !state.isPlaying && state.activeHand === 'left' && state.inVR;
    state.rightRaycasterActive = !state.isPlaying && state.activeHand === 'right' && state.inVR;
    state.multiplierText = `${state.score.multiplier}x`;
  }
});

function computeSearchPagination (state) {
  let numPages = Math.ceil(state.search.results.length / SEARCH_PER_PAGE);
  state.search.hasPrev = state.search.page > 0;
  state.search.hasNext = state.search.page < numPages - 1;

  state.search.songNameTexts = '';
  state.search.songSubNameTexts = '';

  state.searchResultsPage.length = 0;
  state.searchResultsPage.__dirty = true;
  for (let i = state.search.page * SEARCH_PER_PAGE;
       i < state.search.page * SEARCH_PER_PAGE + SEARCH_PER_PAGE; i++) {
    if (!state.search.results[i]) { break; }
    state.searchResultsPage.push(state.search.results[i]);

    state.search.songNameTexts +=
      truncate(state.search.results[i].songName, SONG_NAME_TRUNCATE).toUpperCase() + '\n';
    state.search.songSubNameTexts +=
      truncate(state.search.results[i].songSubName, SONG_SUB_NAME_TRUNCATE) + '\n';
  }

  for (i = 0; i < state.searchResultsPage.length; i++) {
    state.searchResultsPage[i].index = i;
  }

  computeMenuSelectedChallengeIndex(state);
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

function takeDamage (state) {
  state.damage++;
  state.score.combo = 0;
  checkGameOver(state);
}

function checkGameOver (state) {
  if (state.damage >= DAMAGE_MAX) {
    state.damage = 0;
    state.isGameOver = true;
  }
}

function resetScore (state) {
  state.damage = 0;
  state.score.combo = 0;
  state.score.score = 0;
  state.score.multiplier = 1;
}

function computeMenuSelectedChallengeIndex (state) {
  state.menuSelectedChallenge.index = -1;
  for (let i = 0; i < state.searchResultsPage.length; i++) {
    if (state.searchResultsPage[i].id === state.menuSelectedChallenge.id) {
      state.menuSelectedChallenge.index = i;
      break;
    }
  }
}
