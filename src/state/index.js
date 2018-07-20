var hasInitialChallenge = !!AFRAME.utils.getUrlParameter('challenge');

AFRAME.registerState({
  initialState: {
    challenge: {
      id: AFRAME.utils.getUrlParameter('challenge'),
      isLoading: false
    },
    discoLightsOn: true,
    discotube: {speedX: -0.05, speedY: -0.1},
    inVR: false,
    maxStreak: 0,
    menuActive: true,
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
      state.menuActive = false;
      setScreen(state, 'challenge');
    },

    playbuttonclick: function (state) {
      state.menuActive = false;
    },

    /**
     * Update search results. Will automatically render using `bind-for` (menu.html).
     */
    searchresults: function (state, payload) {
      var i;
      state.searchResults.length = 0;
      for (i = 0; i < 6; i++) {
        if (!payload.results[i]) { continue; }
        state.searchResults.push(payload.results[i]);
      }
      state.searchResults.__dirty = true;
    },

    togglediscolights: function (state, payload) {
      state.discoLightsOn = !state.discoLightsOn;
    },

    togglemenu: function (state) {
      state.menuActive = !state.menuActive;
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
