/**
 * Keyboard bindings to control controller.
 * Position controller in front of camera.
 */
AFRAME.registerComponent('debug-controller', {
  schema: {
    enabled: { default: false },
  },

  init: function() {
    var primaryHand;
    var secondaryHand;

    if (!this.data.enabled && !AFRAME.utils.getUrlParameter('debug')) {
      return;
    }

    console.log('%c debug-controller enabled ', 'background: #111; color: red');

    this.isTriggerDown = false;

    primaryHand = document.getElementById('leftGloveContainer');
    secondaryHand = document.getElementById('rightGloveContainer');

    primaryHand.setAttribute('position', { x: 0.2, y: 1.5, z: -0.5 });
    secondaryHand.setAttribute('position', { x: -0.2, y: 1.5, z: -0.5 });
    primaryHand.setAttribute('rotation', { x: 0, y: 0, z: 0 });
    secondaryHand.setAttribute('rotation', { x: 0, y: 0, z: 0 });

    document.addEventListener('keydown', evt => {
      var primaryPosition;
      var primaryRotation;
      var secondaryPosition;

      if (!evt.shiftKey) {
        return;
      }

      // <space> for trigger.
      if (evt.keyCode === 32) {
        if (this.isTriggerDown) {
          primaryHand.emit('triggerup');
          this.isTriggerDown = false;
        } else {
          primaryHand.emit('triggerdown');
          this.isTriggerDown = true;
        }
        return;
      }

      // <n> secondary grip.
      if (evt.keyCode === 78) {
        if (this.secondaryGripDown) {
          secondaryHand.emit('gripup');
          this.secondaryGripDown = false;
        } else {
          secondaryHand.emit('gripdown');
          this.secondaryGripDown = true;
        }
      }

      // <m> primary grip.
      if (evt.keyCode === 77) {
        if (this.primaryGripDown) {
          primaryHand.emit('gripup');
          this.primaryGripDown = false;
        } else {
          primaryHand.emit('gripdown');
          this.primaryGripDown = true;
        }
      }

      // Position bindings.
      if (!evt.ctrlKey) {
        primaryPosition = primaryHand.object3D.position;
        if (evt.keyCode === 72) {
          primaryPosition.x -= 0.01;
        } // h.
        if (evt.keyCode === 74) {
          primaryPosition.y -= 0.01;
        } // j.
        if (evt.keyCode === 75) {
          primaryPosition.y += 0.01;
        } // k.
        if (evt.keyCode === 76) {
          primaryPosition.x += 0.01;
        } // l.
        if (evt.keyCode === 59 || evt.keyCode === 186) {
          primaryPosition.z -= 0.01;
        } // ;.
        if (evt.keyCode === 222) {
          primaryPosition.z += 0.01;
        } // ;.
      } else {
        secondaryPosition = secondaryHand.object3D.position;
        if (evt.keyCode === 72) {
          secondaryPosition.x -= 0.01;
        } // h.
        if (evt.keyCode === 74) {
          secondaryPosition.y -= 0.01;
        } // j.
        if (evt.keyCode === 75) {
          secondaryPosition.y += 0.01;
        } // k.
        if (evt.keyCode === 76) {
          secondaryPosition.x += 0.01;
        } // l.
        if (evt.keyCode === 59 || evt.keyCode === 186) {
          secondaryPosition.z -= 0.01;
        } // ;.
        if (evt.keyCode === 222) {
          secondaryPosition.z += 0.01;
        } // ;.
      }
    });
  },
});
