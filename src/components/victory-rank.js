/**
 * Rank color.
 */
AFRAME.registerComponent('victory-rank', {
  schema: {
    rank: {type: 'string'}
  },

  update: function () {
    const rank = this.data.rank;
    if (!rank) { return; }

    this.el.setAttribute('text', 'value', rank);
    switch (rank[0]) {
      case 'S': {
        this.setColor('#FFF');
        break;
      }
      case 'A': {
        this.setColor('#c2d076');
        break;
      }
      case 'B': {
        this.setColor('#23f0c7');
        break;
      }
      case 'C': {
        this.setColor('#ffe347');
        break;
      }
      case 'D': {
        this.setColor('#ce6c47');
        break;
      }
      case 'F': {
        this.setColor('#960200');
        break;
      }
    }
  },

  setColor: function (color) {
    this.el.setAttribute('text', 'color', color);
  }
});
