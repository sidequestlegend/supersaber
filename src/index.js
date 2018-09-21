function requireAll (req) { req.keys().forEach(req); }

require('aframe-animation-component');
require('aframe-audioanalyser-component');
require('aframe-cubemap-component');
require('aframe-event-set-component');
require('aframe-haptics-component');
require('aframe-layout-component');
require('aframe-orbit-controls');
require('aframe-particle-system-component');
require('aframe-proxy-event-component');
require('aframe-state-component');
require('aframe-slice9-component');
require('aframe-super-keyboard');
require('aframe-particleplayer-component');

requireAll(require.context('./components/', true, /\.js$/));
requireAll(require.context('./state/', true, /\.js$/));
