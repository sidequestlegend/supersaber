var hasInitialChallenge = !!AFRAME.utils.getUrlParameter('challenge');

AFRAME.registerState({
  initialState: {
    challenge: {
      id: AFRAME.utils.getUrlParameter('challenge'),
      isLoading: false,
      loadingText: ''
    },
    discoLightsOn: true,
    discotube: {speedX: -0.05, speedY: -0.1},
    featuredPanelShowing: !hasInitialChallenge,
    inVR: false,
    isChallengeScreen: hasInitialChallenge,
    isFeaturedScreen: !hasInitialChallenge,
    isSearchScreen: false,
    maxStreak: 0,
    menuActive: true,
    playButtonShowing: hasInitialChallenge,
    playButtonText: 'Play',
    score: 0,
    scoreText: '',
    screen: hasInitialChallenge ? 'challenge' : 'featured',
    screenHistory: [],
    searchResults: [],
    streak: 0
  },

  handlers: {
    /**
     * Update search results. Will automatically render using `bind-for` (menu.html).
     */
    searchresults: function (state, payload) {
      var i;
      state.searchResults.length = 0;
      for (i = 0; i < 6; i++) {
        state.searchResults.push(payload.results[i]);
      }
    },

    setscreen: function (state, payload) {
      console.log('setscreen: ' + payload.screen);
      if (state.screen === payload.screen) {
        return;
      }
      switch (payload.screen) {
        case 'challenge':
        case 'featured':
        case 'search':
          state.screenHistory.push(state.screen);
          state.screen = payload.screen;
          break;
        default:
          console.log('Unknown screen set: ' + payload.screen);
      }
    },

    popscreen: function (state, payload) {
      var prevScreen = state.screenHistory.pop();
      if (!prevScreen) {
        return;
      }
      state.screen = prevScreen;
      console.log('popscreen: ' + state.screen);
    },

    challengeloaded: function (state, payload) {
      state.challenge.isLoading = false;
      state.isLoadingFrames = false;
      state.isLoadingPunches = false;
      state.score = 0;
    },

    challengeloadstart: function (state, payload) {
      state.challenge.isLoading = true;
    },

    challengeloadingframes: function (state, payload) {
      state.challenge.isLoadingPunches = false;
      state.challenge.isLoadingFrames = true;
    },

    challengeloadingpunches: function (state, payload) {
      state.challenge.isLoadingPunches = true;
      state.challenge.isLoadingFrames = false;
    },

    challengeset: function (state, payload) {
      state.challenge.id = payload.challengeId;
      state.score = 0;
      state.streak = 0;
      state.maxStreak = 0;
      state.menuActive = false;

      this.setscreen(state, {screen: 'challenge'});
    },

    playbuttonclick: function (state) {
      state.menuActive = false;
    },

    searchblur: function (state) {
      this.popscreen(state);
    },

    searchfocus: function (state) {
      this.setscreen(state, {screen: 'search'});
    },

    togglemenu: function (state) {
      state.menuActive = !state.menuActive;
    },

    togglediscolights: function (state, payload) {
      state.discoLightsOn = !state.discoLightsOn;
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
    state.isFeaturedScreen = state.screen === 'featured';
    state.isSearchScreen = state.screen === 'search';
    state.isChallengeScreen = state.screen === 'challenge';

    state.featuredPanelShowing = state.isFeaturedScreen || (state.isChallengeScreen && state.menuActive);

    if (state.challenge.isLoading) {
      state.loadingText = 'Loading challenge...';
    } else {
      state.loadingText = '';
    }
  }
});
