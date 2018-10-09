AFRAME.registerComponent('debug-states', {
  schema: {
    isPlaying: {default: false},
    isPaused: {default: false},
    isGameOver: {default: false}
  },
  update: function(){
    document.getElementById('debugIsGameOver').className = this.data.isGameOver ? 'active': '';
    document.getElementById('debugIsPaused').className = this.data.isPaused ? 'active': '';
    document.getElementById('debugIsPlaying').className = this.data.isPlaying ? 'active': '';
    console.log(`%c gameover: ${this.data.isGameOver}, paused: ${this.data.isPaused}, playing: ${this.data.isPlaying}`, 'background: #222; color: #bada55');
  }
});