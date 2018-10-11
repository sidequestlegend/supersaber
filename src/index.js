function requireAll (req) { req.keys().forEach(req); }

require('../vendor/BufferGeometryUtils');

require('aframe-atlas-uvs-component');
require('aframe-audioanalyser-component');
require('aframe-event-set-component');
require('aframe-geometry-merger-component');
require('aframe-haptics-component');
require('aframe-layout-component');
require('aframe-orbit-controls');
require('aframe-proxy-event-component');
require('aframe-state-component');
require('aframe-slice9-component');
require('aframe-super-keyboard');
require('aframe-thumb-controls-component');

requireAll(require.context('./components/', true, /\.js$/));
requireAll(require.context('./state/', true, /\.js$/));

require('./style.css');
