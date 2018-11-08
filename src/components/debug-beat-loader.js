AFRAME.registerComponent('debug-beat-loader', {
  dependencies: ['beat-loader'],

  schema: {
    beatEnabled: {default: false},
    stageEnabled: {default: false}
  },

  init: function () {
    this.beatLoader = this.el.components['beat-loader'];
    this.selectedBeat = {
      color: 'red',
      position: 'middleCenterLeft',
      type: 'arrow',
      orientation: 'up'
    };

    this.onKeyDown = this.onKeyDown.bind(this);

    if (this.data.stageEnabled || AFRAME.utils.getUrlParameter('debugstage')) {
      this.addDebugStageControls();
    }

    if (this.data.beatEnabled ||
        AFRAME.utils.getUrlParameter('debugstate').trim() === 'gameplay') {
      window.addEventListener('keydown', this.onKeyDown);
      this.addDebugBeatControls();
    }
  },

  /**
   * Debug generate beats.
   */
  onKeyDown: function (event) {
    const keyCode = event.keyCode;
    switch (keyCode) {
      case 32: {  // Space bar.
       this.beatLoader.generateBeat({
          _lineIndex: this.beatLoader.positionHumanized[this.selectedBeat.position].index,
          _lineLayer: this.beatLoader.positionHumanized[this.selectedBeat.position].layer,
          _cutDirection: this.selectedBeat.type === 'dot'
            ? 8
            : this.beatLoader.orientationsHumanized.indexOf(this.selectedBeat.orientation),
          _type: type });
        break;
      }
    }
  },

  addDebugBeatControls: function () {
    const parentDiv = document.createElement('div');
    const self = this;

    parentDiv.style.position = 'absolute';
    parentDiv.style.right = '0';
    parentDiv.style.top = '0';
    parentDiv.style.padding = '10px';
    parentDiv.style.width = '500px';
    parentDiv.style.height = '600px';
    document.body.appendChild(parentDiv);

    addTypeBeatMenu();
    addColorBeatMenu();
    addOrientationMenu();
    addBeatPositionMenu();
    addGenerateButton();

    function addOrientationMenu () {
      const menuDiv = addMenu('orientation');
      addButton('top', menuDiv);
      addButton('left', menuDiv);
      addButton('right', menuDiv);
      addButton('down', menuDiv);
      parentDiv.appendChild(menuDiv);
    }

    function addColorBeatMenu () {
      const menuDiv = addMenu('color');
      addButton('blue', menuDiv);
      addButton('red', menuDiv);
      parentDiv.appendChild(menuDiv);
    }

    function addTypeBeatMenu () {
      const menuDiv = addMenu('type');
      addButton('arrow', menuDiv);
      addButton('dot', menuDiv);
      addButton('mine', menuDiv);
      parentDiv.appendChild(menuDiv);
    }

    function addBeatPositionMenu () {
      const menuDiv = addMenu('position');
      addButton('topLeft', menuDiv);
      addButton('topCenterLeft', menuDiv);
      addButton('topCenterRight', menuDiv);
      addButton('topRight', menuDiv);

      addButton('middleLeft', menuDiv);
      addButton('middleCenterLeft', menuDiv);
      addButton('middleCenterRight', menuDiv);
      addButton('middleRight', menuDiv);

      addButton('bottomLeft', menuDiv);
      addButton('bottomCenterLeft', menuDiv);
      addButton('bottomCenterRight', menuDiv);
      addButton('bottomRight', menuDiv);
    }

    function addMenu (name) {
      const menuDiv = document.createElement('div');
      menuDiv.id = name;
      menuDiv.style.marginBottom = '20px';
      menuDiv.style.width = '500px';
      menuDiv.style.display = 'inline-block';
      parentDiv.appendChild(menuDiv);
      return menuDiv;
    }

    function addButton (text, containerEl, clickHandler) {
      const div = document.createElement('div');
      const handler = clickHandler || function onClick () {
        const buttons = div.parentElement.querySelectorAll('.button');
        for (let i = 0; i < buttons.length; i++) { buttons[i].style.background = '#000'; }
        div.style.background = '#66f';
        self.selectedBeat[div.parentElement.id] = div.innerHTML;
      };
      div.classList.add('button');
      div.id = 'button' + text;
      div.style.width = '100px';
      div.style.height = '30px';
      div.style.background = '#000';
      div.style.color = '#fff';
      div.style.zIndex = 999999999;
      div.style.padding = '5px';
      div.style.margin = '5px';
      div.style.font = '14px sans-serif';
      div.style.textAlign = 'center';
      div.style.lineHeight = '30px';
      div.style.cursor = 'pointer';
      div.style.display = 'inline-block';
      div.innerHTML = text;
      containerEl.appendChild(div);
      div.addEventListener('click', handler);
      return div;
    };

    function addGenerateButton (text, containerEl) {
      const buttonEl = addButton('Spawn Beat (Space Bar)', parentDiv, () => {
        var type;
        if (self.selectedBeat.type === 'mine') {
          type = 3;
        } else {
          type = self.selectedBeat.color === 'red' ? 0 : 1;
        }
        self.beatLoader.generateBeat({
          _lineIndex: self.beatLoader.positionHumanized[self.selectedBeat.position].index,
          _lineLayer: self.beatLoader.positionHumanized[self.selectedBeat.position].layer,
          _cutDirection: self.selectedBeat.type === 'dot'
            ? 8
            : self.beatLoader.orientationsHumanized.indexOf(self.selectedBeat.orientation),
          _type: type
        });
      });
      buttonEl.style.width = '440px';
    }
  },

  addDebugStageControls: function () {
    var currControl = 0;

    const addControl = (i, name, type) => {
      const div = document.createElement('div');
      div.style.position = 'absolute';
      div.id = 'stagecontrol' + i;
      div.style.width = '100px';
      div.style.height = '30px';
      div.style.top = type === 'element' ? '20px' : '70px';
      div.style.background = '#000';
      div.style.color = '#fff';
      div.style.zIndex = 999999999;
      div.style.padding = '5px';
      div.style.font = '14px sans-serif';
      div.style.textAlign = 'center';
      div.style.cursor = 'pointer';
      div.style.left = (20 + i * 120)+'px';
      div.innerHTML = name;
      if (type === 'element') {
        div.addEventListener('click', () => {
          document.getElementById('stagecontrol' + currControl).style.background = '#000';
          div.style.background = '#66f';
          currControl = i;
        });
      } else {
        div.addEventListener('click', () => {
          this.beatLoader.generateEvent({_type: currControl, _value: i})
        })
      }
      document.body.appendChild(div);
    };

    [
      'sky',
      'tunnelNeon',
      'leftStageLasers',
      'rightStageLasers',
      'floor'
    ].forEach((id, i) => { addControl(i, id, 'element'); });

    [
      'off',
      'blue',
      'blue',
      'bluefade',
      '',
      'red',
      'red',
      'redfade'
    ].forEach((id, i) => { addControl(i, id, 'value'); });
  }
});
