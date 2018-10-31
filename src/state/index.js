/* global localStorage */
var utils = require('../utils');

const challengeDataStore = {};
const SEARCH_PER_PAGE = 6;
const SONG_NAME_TRUNCATE = 24;
const SONG_SUB_NAME_TRUNCATE = 32;

const DAMAGE_DECAY = 0.25;
const DAMAGE_MAX = 10;

const DEBUG_CHALLENGE = {
  author: 'Superman',
  difficulty: 'Normal',
  id: '517',
  image: 'assets/img/molerat.jpg',
  songName: 'Friday',
  songLength: 100,
  songSubName: 'Rebecca Black'
};

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
  nonBindedStateKeys: ['genres'],

  initialState: {
    activeHand: localStorage.getItem('hand') || 'right',
    challenge: {  // Actively playing challenge.
      author: '',
      difficulty: '',
      id: AFRAME.utils.getUrlParameter('challenge'),  // Will be empty string if not playing.
      image: '',
      isLoading: false,
      isBeatsPreloaded: false,  // Whether we have passed the negative time.
      songDuration: 0,
      songName: '',
      songSubName: ''
    },
    damage: 0,
    genre: '',
    genres: require('../constants/genres'),
    genreMenuOpen: false,
    inVR: false,
    isGameOver: false,  // Game over screen.
    isPaused: false,  // Playing, but paused. Not active during menu.
    isPlaying: false,  // Actively playing (slicing beats).
    isSearching: false,  // Whether search is open.
    isSongFetching: false,  // Fetching stage.
    isSongLoading: false,  // Either fetching or decoding.
    isVictory: false,  // Victory screen.
    menuActive: true,  // Main menu active.
    menuDifficulties: [],  // List of strings of available difficulties for selected.
    menuSelectedChallenge: {  // Currently selected challenge in the main menu.
      author: '',
      difficulty: '',
      downloads: '',
      downloadsText: '',
      genre: '',
      id: '',
      index: -1,
      image: '',
      numBeats: undefined,
      songDuration: 0,
      songInfoText: '',
      songLength: undefined,
      songName: '',
      songSubName: ''
    },
    score: {
      accuracy: 0,
      accuracyText: '',
      beatsHit: 0,
      beatsMissed: 0,
      combo: 0,
      maxCombo: 0,
      maxComboText: 0,
      multiplier: 1,
      rank: '',  // Grade (S to F).
      score: 0
    },
    search: {
      active: true,
      page: 0,
      hasError: false,
      hasNext: false,
      hasPrev: false,
      query: '',
      results: [],
      songNameTexts: '',  // All names in search results merged together.
      songSubNameTexts: ''  // All sub names in search results merged together.
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

    beathit: (state, payload) => {
      var score = 0;
      if (state.damage > DAMAGE_DECAY) {
        state.damage -= DAMAGE_DECAY;
      }
      state.score.beatsHit++;
      state.score.combo++;
      if (state.score.combo > state.score.maxCombo) {
        state.score.maxCombo = state.score.combo;
      }

      score += payload.angleBeforeHit >= 90 ? 70 : (payload.angleBeforeHit / 90) * 70;
      score += payload.angleAfterHit >= 60 ? 30 : (payload.angleAfterHit / 60) * 30;
      state.score.score += Math.floor(score * state.score.multiplier);

      state.score.multiplier = state.score.combo >= 8
        ? 8
        : 2 * Math.floor(Math.log2(state.score.combo));

      // console.log("BEAT SCORE: " + score + " " + payload.angleBeforeHit + " " + payload.angleAfterHit);
    },

    beatmiss: state => {
      state.score.beatsMissed++;
      takeDamage(state);
    },

    beatwrong: state => {
      state.score.beatsMissed++;
      takeDamage(state);
    },

    beatloaderfinish: (state, payload) => {
      state.challenge.isLoading = false;
    },

    beatloaderpreloadfinish: (state) => {
      state.challenge.isBeatsPreloaded = true;
    },

    beatloaderstart: (state) => {
      state.challenge.isBeatsPreloaded = false;
      state.challenge.isLoading = true;
    },

    /**
     * To work on game over page.
     *
     * ?debugstate=gameover
     */
    debuggameover: state => {
      state.isGameOver = true;
      state.menuActive = false;
    },

    /**
     * To work on victory page.
     *
     * ?debugstate=loading
     */
    debugloading: state => {
      Object.assign(state.menuSelectedChallenge, DEBUG_CHALLENGE);
      Object.assign(state.challenge, DEBUG_CHALLENGE);
      state.menuActive = false;
      state.isSongFetching = true;
      state.isSongLoading = true;
    },

    /**
     * To work on victory page.
     *
     * ?debugstate=victory
     */
    debugvictory: state => {
      Object.assign(state.menuSelectedChallenge, DEBUG_CHALLENGE);
      Object.assign(state.challenge, DEBUG_CHALLENGE);
      state.isVictory = true;
      state.menuActive = false;
      state.score.accuracy = .88;
      state.score.accuracyText = '99.99%';
      state.score.maxComboText = 'MAX COMBO - 123';
      state.score.rank = 'B';
      state.score.score = 9001;
    },

    gamemenuresume: (state) => {
      state.isPaused = false;
    },

    gamemenurestart: (state) => {
      resetScore(state);
      state.isBeatsPreloaded = false;
      state.isGameOver = false;
      state.isPaused = false;
      state.isSongLoading = true;
      state.isVictory = false;
    },

    gamemenuexit: (state) => {
      resetScore(state);
      state.isBeatsPreloaded = false;
      state.isGameOver = false;
      state.isPaused = false;
      state.isVictory = false;
      state.menuActive = true;
      state.challenge.id = '';
    },

    genreclear: (state) => {
      state.genre = '';
    },

    genremenuclose: (state) => {
      state.genreMenuOpen = false;
    },

    genremenuopen: (state) => {
      state.genreMenuOpen = true;
    },

    keyboardclose: (state) => {
      state.isSearching = false;
    },

    keyboardopen: (state) => {
      state.isSearching = true;
      state.menuSelectedChallenge.id = '';
    },

    /**
     * Song clicked from menu.
     */
    menuchallengeselect: (state, id) => {
      // Copy from challenge store populated from search results.
      let challenge = challengeDataStore[id];
      Object.assign(state.menuSelectedChallenge, challenge);

      // Populate difficulty options.
      state.menuDifficulties.length = 0;
      for (let i = 0; i < challenge.difficulties.length; i++) {
        state.menuDifficulties.unshift(challenge.difficulties[i]);
      }
      state.menuDifficulties.sort(difficultyComparator);

      // Default to easiest difficulty.
      state.menuSelectedChallenge.difficulty = state.menuDifficulties[0];

      state.menuSelectedChallenge.image = utils.getS3FileUrl(id, 'image.jpg');
      state.menuSelectedChallenge.songInfoText = `By ${truncate(challenge.author, 12)} ${challenge.genre && challenge.genre !== 'Uncategorized' ? '/ ' + challenge.genre : ''}\n${challenge.downloads} Downloads\nUpvotes: ${challenge.upvotes} / Downvotes: ${challenge.downvotes}\n${formatSongLength(challenge.songDuration)} / ${challenge.numBeats[state.menuSelectedChallenge.difficulty]} beats`;

      computeMenuSelectedChallengeIndex(state);
      state.isSearching = false;
    },

    menuchallengeunselect: state => {
      state.menuSelectedChallenge.id = '';
    },

    menudifficultyselect: (state, difficulty) => {
      state.menuSelectedChallenge.difficulty = difficulty;
    },

    minehit: state => {
      takeDamage(state);
    },

    pausegame: (state) => {
      if (!state.isPlaying) { return; }
      state.isPaused = true;
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
      state.menuActive = false;
      state.menuSelectedChallenge.id = '';

      state.isSearching = false;
      state.isSongLoading = true;
    },

    searcherror: (state, payload) => {
      state.search.hasError = true;
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
      state.search.hasError = false;
      state.search.page = 0;
      state.search.query = payload.query;
      state.search.results = payload.results;
      for (i = 0; i < payload.results.length; i++) {
        let result = payload.results[i];
        result.songSubName = result.songSubName || 'Unknown Artist';
        result.shortSongName = truncate(result.songName, SONG_NAME_TRUNCATE).toUpperCase();
        result.shortSongSubName = truncate(result.songSubName, SONG_SUB_NAME_TRUNCATE);
        challengeDataStore[result.id] = result;
      }
      computeSearchPagination(state);

      if (payload.isGenreSearch) {
        state.genreMenuOpen = false;
        state.genre = payload.genre;
        state.menuSelectedChallenge.id = '';
      } else {
        state.genre = '';
        computeMenuSelectedChallengeIndex(state);
      }
    },

    songfetchfinish: (state) => {
      state.isSongFetching = false;
    },

    songloadfinish: (state) => {
      state.isSongFetching = false;
      state.isSongLoading = false;
    },

    songloadstart: (state) => {
      state.isSongFetching = true;
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

      const accuracy =
        state.score.beatsHit /
        (state.score.beatsMissed + state.score.beatsHit);
      state.score.accuracy = accuracy;
      state.score.accuracyText = `${(accuracy * 100).toFixed()}%`;
      state.score.maxComboText = `MAX COMBO - ${state.score.maxCombo}`;

      if (accuracy === 1) {
        state.score.rank = 'S';
      } else if (accuracy >= .98) {
        state.score.rank = 'A+';
      } else if (accuracy >= .93) {
        state.score.rank = 'A';
      } else if (accuracy >= .9) {
        state.score.rank = 'A-';
      } else if (accuracy >= .88) {
        state.score.rank = 'B+';
      } else if (accuracy >= .83) {
        state.score.rank = 'B';
      } else if (accuracy >= .8) {
        state.score.rank = 'B-';
      } else if (accuracy >= .78) {
        state.score.rank = 'C+';
      } else if (accuracy >= .73) {
        state.score.rank = 'C';
      } else if (accuracy >= .7) {
        state.score.rank = 'C-';
      } else if (accuracy >= .60) {
        state.score.rank = 'D';
      } else {
        state.score.rank = 'F';
      }
    },

    wallhitstart: function (state) {
      takeDamage(state);
    }
  },

  /**
   * Post-process the state after each action.
   */
  computeState: (state) => {
    state.isPlaying =
      !state.menuActive && !state.isPaused && !state.isVictory && !state.isGameOver &&
      !state.challenge.isLoading && !state.isSongLoading;

    const anyMenuOpen = state.menuActive || state.isPaused || state.isVictory ||
                        state.isGameOver;
    state.leftRaycasterActive = anyMenuOpen && state.activeHand === 'left' && state.inVR;
    state.rightRaycasterActive = anyMenuOpen && state.activeHand === 'right' && state.inVR;

    // Song is decoding if it is loading, but not fetching.
    if (state.isSongLoading) {
      state.loadingText = state.isSongFetching ? 'Downloading song...' : 'Processing song...';
    } else {
      state.loadingText = '';
    }
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

  for (let i = 0; i < state.searchResultsPage.length; i++) {
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
  if (!state.isPlaying) { return; }
  state.score.combo = 0;
  state.score.multiplier = Math.ceil(state.score.multiplier / 2);
  if (AFRAME.utils.getUrlParameter('godmode')) { return; }
  state.damage++;
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
  state.score.beatsHit = 0;
  state.score.beatsMissed = 0;
  state.score.combo = 0;
  state.score.maxCombo = 0;
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

function formatSongLength (songLength) {
  songLength /= 60;
  const minutes = `${Math.floor(songLength)}`;
  return `${minutes}:${Math.round((songLength - minutes) * 60)}`;
}
