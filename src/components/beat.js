import {BEAT_WARMUP_OFFSET, BEAT_WARMUP_SPEED, BEAT_WARMUP_TIME} from '../constants/beat';

const auxObj3D = new THREE.Object3D();
const BEAT_WARMUP_ROTATION_CHANGE = Math.PI / 5;
const BEAT_WARMUP_ROTATION_OFFSET = 0.4;
const BEAT_WARMUP_ROTATION_TIME = 750;
const ONCE = {once: true};
const SIGN_MATERIAL = {shader: 'flat', color: '#88f'};

/**
 * Create beat from pool, collision detection, clipping planes.
 */
AFRAME.registerComponent('beat', {
  schema: {
    color: {default: 'red', oneOf: ['red', 'blue']},
    cutDirection: {type: 'string'},
    debug: {default: false},
    size: {default: 0.30},
    speed: {default: 1.0},
    type: {default: 'arrow', oneOf: ['arrow', 'dot', 'mine']}
  },

  materialColor: {
    blue: '#08083E',
    red: '#290404'
  },

  cutColor: {
    blue: '#b3dcff',
    red: '#ffb3ca'
  },

  models: {
    arrow: 'beatObjTemplate',
    dot: 'beatObjTemplate',
    mine: 'mineObjTemplate'
  },

  signModels: {
    arrow: 'arrowObjTemplate',
    dot: 'dotObjTemplate'
  },

  init: function () {
    this.backToPool = false;
    this.beams = document.getElementById('beams').components.beams;
    this.beatBoundingBox = new THREE.Box3();
    this.currentRotationWarmupTime = 0;
    this.cutDirection = new THREE.Vector3();
    this.destroyed = false;
    this.gravityVelocity = 0;
    this.hitEventDetail = {};
    this.hitBoundingBox = new THREE.Box3();
    this.poolName = undefined;
    this.returnToPoolTimer = 800;
    this.rotationAxis = new THREE.Vector3();
    this.saberEls = this.el.sceneEl.querySelectorAll('[saber-controls]');
    this.startPositionZ = undefined;
    this.rightCutPlanePoints = [
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3()
    ];
    this.leftCutPlanePoints = [
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3()
    ];

    this.wrongElLeft = document.getElementById('wrongLeft');
    this.wrongElRight = document.getElementById('wrongRight');
    this.missElLeft = document.getElementById('missLeft');
    this.missElRight = document.getElementById('missRight');
    this.particles = document.getElementById('saberParticles');
    this.mineParticles = document.getElementById('mineParticles');

    this.saberColors = {right: 'blue', left: 'red'};

    this.onEndStroke = this.onEndStroke.bind(this);

    this.initBlock();
    this.initColliders();
    if (this.data.type === 'mine') {
      this.initMineFragments();
    } else {
      this.initFragments();
    };
  },

  update: function () {
    this.updateBlock();
    this.updateFragments();

    if (this.data.type === 'mine') {
      this.poolName = `pool__beat-mine`;
    } else {
      this.poolName = `pool__beat-${this.data.type}-${this.data.color}`;
    }
  },

  pause: function () {
    this.el.object3D.visible = false;
    if (this.data.type !== 'mine') {
      this.partLeftEl.object3D.visible = false;
      this.partRightEl.object3D.visible = false;
    }
  },

  play: function () {
    this.blockEl.object3D.visible = true;
    this.destroyed = false;
    this.el.object3D.visible = true;
  },

  tock: function (time, timeDelta) {
    const el = this.el;
    const position = el.object3D.position;

    if (this.destroyed) {
      this.tockDestroyed(timeDelta);
    } else {
      // Only check collisions when close.
      const collisionZThreshold = -4;

      if (position.z > collisionZThreshold) { this.checkCollisions(); }

      // Move.
      if (position.z < this.startPositionZ) {
        let newPositionZ = position.z + BEAT_WARMUP_SPEED * (timeDelta / 1000);
        // Warm up / warp in.
        if (newPositionZ < this.startPositionZ) {
          this.beams.newBeam(this.data.color, position);
          position.z = newPositionZ;
        } else {
          position.z = this.startPositionZ;
        }
      } else {
        // Standard moving.
        position.z += this.data.speed * (timeDelta / 1000);
      }

      if (position.z > (this.startPositionZ - BEAT_WARMUP_ROTATION_OFFSET) &&
          this.currentRotationWarmupTime < BEAT_WARMUP_ROTATION_TIME) {
        const progress = AFRAME.ANIME.easings.easeOutBack(
          this.currentRotationWarmupTime / BEAT_WARMUP_ROTATION_TIME);
        el.object3D.rotation.z = this.rotationZStart + (progress * this.rotationZChange);
        this.currentRotationWarmupTime += timeDelta;
      }

      // Check.
      this.backToPool = position.z >= 2;
      if (this.backToPool) { this.missHit(); }
    }
    this.returnToPool();
  },

  /**
   * Called when summoned by beat-loader.
   */
  onGenerate: function () {
    this.startPositionZ = this.el.object3D.position.z;
    this.el.object3D.position.z -= BEAT_WARMUP_OFFSET;

    // Set up rotation warmup.
    this.currentRotationWarmupTime = 0;
    this.rotationZChange = BEAT_WARMUP_ROTATION_CHANGE;
    if (Math.random > 0.5) { this.rotationZChange *= -1; }
    this.el.object3D.rotation.z -= this.rotationZChange;
    this.rotationZStart = this.el.object3D.rotation.z;

    // Reset mine.
    if (this.data.type == 'mine') { this.resetMineFragments(); }
  },

  initBlock: function () {
    var el = this.el;
    var blockEl = this.blockEl = document.createElement('a-entity');
    var signEl = this.signEl = document.createElement('a-entity');

    blockEl.setAttribute('mixin', 'beatBlock');
    blockEl.setAttribute('mixin', 'beatSign');

    // Small offset to prevent z-fighting when the blocks are far away
    signEl.object3D.position.z += 0.02;
    blockEl.appendChild(signEl);
    el.appendChild(blockEl);
  },

  updateBlock: function () {
    var blockEl = this.blockEl;
    var signEl = this.signEl;

    blockEl.setAttribute('material', {
      metalness: 0.6,
      roughness: 0.12,
      sphericalEnvMap: '#envmapTexture',
      color: this.materialColor[this.data.color]
    });
    this.setObjModelFromTemplate(blockEl, this.models[this.data.type]);

    // Model is 0.29 size. We make it 1.0 so we can easily scale based on 1m size.
    blockEl.object3D.scale.set(1, 1, 1);
    blockEl.object3D.scale.multiplyScalar(3.45).multiplyScalar(this.data.size);

    if (this.data.type === 'mine') {
      const model = blockEl.getObject3D('mesh');
      model.material = this.el.sceneEl.components['stage-colors'].mineMaterial;
    } else {
      signEl.setAttribute('material', SIGN_MATERIAL);
      this.setObjModelFromTemplate(signEl, this.signModels[this.data.type]);
    }
  },

  initColliders: function () {
    var data = this.data;
    var hitColliderConfiguration;
    var hitColliderEl;

    if (this.data.type === 'dot' || this.data.type === 'mine') { return; }

    hitColliderConfiguration = {
      position: {x: 0, y: data.size / 2, z: 0},
      size: {width: data.size, height: data.size / 5.0, depth: data.size}
    };

    hitColliderEl = this.hitColliderEl = document.createElement('a-entity');
    hitColliderEl.setAttribute('geometry', {
      primitive: 'box',
      height: hitColliderConfiguration.size.height,
      width: hitColliderConfiguration.size.width,
      depth: hitColliderConfiguration.size.depth
    });

    hitColliderEl.object3D.position.copy(hitColliderConfiguration.position);
    hitColliderEl.object3D.visible = false;
    this.el.appendChild(hitColliderEl);

    if (data.debug) {
      hitColliderEl.object3D.visible = true;
      hitColliderEl.setAttribute('material', 'color', 'purple');
    }
  },

  initFragments: function () {
    var cutEl;
    var partEl;

    partEl = this.partLeftEl = document.createElement('a-entity');
    cutEl = this.cutLeftEl = document.createElement('a-entity');

    partEl.appendChild(cutEl);
    this.el.appendChild(partEl);

    partEl = this.partRightEl = document.createElement('a-entity');
    cutEl = this.cutRightEl = document.createElement('a-entity');

    partEl.appendChild(cutEl);
    this.el.appendChild(partEl);

    this.initCuttingClippingPlanes();
  },

  initMineFragments: function () {
    var fragment;
    var fragments = this.el.sceneEl.systems['mine-fragments-loader'].fragments.children;
    var material = this.el.sceneEl.components['stage-colors'].mineMaterial;

    this.randVec = new THREE.Vector3(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI);

    this.mineFragments = [];
    this.mineBroken = document.createElement('a-entity');
    this.el.appendChild(this.mineBroken);

    for (var i = 0; i < fragments.length; i++) {
      fragment = new THREE.Mesh(fragments[i].geometry, material);
      fragment.speed = new THREE.Vector3();
      fragment.speed.set(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5);
      this.mineFragments.push(fragment);
      this.mineBroken.object3D.add(fragment);
    }
  },

  updateFragments: function () {
    var cutLeftEl = this.cutLeftEl;
    var cutRightEl = this.cutRightEl;
    var partLeftEl = this.partLeftEl;
    var partRightEl = this.partRightEl;
    var fragment;

    if (this.data.type === 'mine') {
      this.resetMineFragments();
      return;
    }

    partLeftEl.setAttribute('material', {
      metalness: 0.8,
      roughness: 0.12,
      sphericalEnvMap: '#envmapTexture',
      color: this.materialColor[this.data.color],
      side: 'double'
    });
    this.setObjModelFromTemplate(partLeftEl, this.models.dot);
    partLeftEl.object3D.visible = false;

    cutLeftEl.setAttribute('material', {
      shader: 'flat',
      color: this.data.cutColor,
      side: 'double'
    });
    this.setObjModelFromTemplate(cutLeftEl, this.models.dot);

    partRightEl.setAttribute('material', {
      metalness: 0.8,
      roughness: 0.12,
      sphericalEnvMap: '#envmapTexture',
      color: this.materialColor[this.data.color],
      side: 'double'
    });
    this.setObjModelFromTemplate(partRightEl, this.models.dot);
    partRightEl.object3D.visible = false;

    cutRightEl.setAttribute('material', {
      shader: 'flat',
      color: this.data.cutColor,
      side: 'double'
    });
    this.setObjModelFromTemplate(cutRightEl, this.models.dot);
  },

  resetMineFragments: function () {
    if (this.data.type !== 'mine') { return; }
    for (let i = 0; i < this.mineFragments.length; i++) {
      let fragment = this.mineFragments[i];
      fragment.visible = false;
      fragment.position.set(0, 0, 0);
      fragment.scale.set(1, 1, 1);
      fragment.speed.set(
        Math.random() * 5 - 2.5,
        Math.random() * 5 - 2.5,
        Math.random() * 5 - 2.5);
    }
  },

  wrongHit: function (hand) {
    var wrongEl = hand === 'left' ? this.wrongElLeft : this.wrongElRight;
    if (!wrongEl) { return; }
    wrongEl.object3D.position.copy(this.el.object3D.position);
    wrongEl.object3D.position.y += 0.2;
    wrongEl.object3D.position.z -= 0.5;
    wrongEl.object3D.visible = true;
    wrongEl.emit('beatwrong', null, true);
    this.destroyed = true;
  },

  missHit: function (hand) {
    var missEl = hand === 'left' ? this.missElLeft : this.missElRight;
    if (!missEl) { return; }
    missEl.object3D.position.copy(this.el.object3D.position);
    missEl.object3D.position.y += 0.2;
    missEl.object3D.position.z -= 0.5;
    missEl.object3D.visible = true;
    missEl.emit('beatmiss', null, true);
  },

  destroyBeat: (function () {
    var parallelPlaneMaterial = new THREE.MeshBasicMaterial({
      color: '#00008b',
      side: THREE.DoubleSide
    });
    var planeMaterial = new THREE.MeshBasicMaterial({color: 'grey', side: THREE.DoubleSide});
    var point1 = new THREE.Vector3();
    var point2 = new THREE.Vector3();
    var point3 = new THREE.Vector3();

    return function (saberEl) {
      var coplanarPoint;
      var cutThickness = this.cutThickness = 0.02;
      var direction = this.cutDirection;
      var leftBorderInnerPlane = this.leftBorderInnerPlane;
      var leftBorderOuterPlane = this.leftBorderOuterPlane;
      var leftCutPlane = this.leftCutPlane;
      var planeGeometry;
      var planeMesh;
      var rightBorderInnerPlane = this.rightBorderInnerPlane;
      var rightBorderOuterPlane = this.rightBorderOuterPlane;
      var rightCutPlane = this.rightCutPlane;
      var trailPoints = saberEl.components.trail.saberTrajectory;

      point1.copy(trailPoints[0].top);
      point2.copy(trailPoints[0].center);
      point3.copy(trailPoints[trailPoints.length - 1].top);
      direction.copy(point1).sub(point3);

      this.partRightEl.object3D.position.set(0, 0, 0);
      this.partRightEl.object3D.rotation.set(0, 0, 0);
      this.partRightEl.object3D.updateMatrixWorld();

      this.partRightEl.object3D.worldToLocal(this.rightCutPlanePoints[0].copy(point1));
      this.partRightEl.object3D.worldToLocal(this.rightCutPlanePoints[1].copy(point2));
      this.partRightEl.object3D.worldToLocal(this.rightCutPlanePoints[2].copy(point3));

      this.partLeftEl.object3D.position.set(0, 0, 0);
      this.partLeftEl.object3D.rotation.set(0, 0, 0);
      this.partLeftEl.object3D.updateMatrixWorld();

      this.partLeftEl.object3D.worldToLocal(this.leftCutPlanePoints[0].copy(point3));
      this.partLeftEl.object3D.worldToLocal(this.leftCutPlanePoints[1].copy(point2));
      this.partLeftEl.object3D.worldToLocal(this.leftCutPlanePoints[2].copy(point1));

      this.generateCutClippingPlanes();

      if (this.data.debug) {
        coplanarPoint = new THREE.Vector3();
        planeGeometry = new THREE.PlaneGeometry(4.0, 4.0, 1.0, 1.0);

        rightCutPlane.coplanarPoint(coplanarPoint);
        planeGeometry.lookAt(rightCutPlane.normal);
        planeGeometry.translate(coplanarPoint.x, coplanarPoint.y, coplanarPoint.z);

        planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
        this.el.sceneEl.setObject3D('rightCutPlane', planeMesh);

        planeGeometry = new THREE.PlaneGeometry(4.0, 4.0, 1.0, 1.0);

        rightBorderOuterPlane.coplanarPoint(coplanarPoint);
        planeGeometry.lookAt(rightBorderOuterPlane.normal);
        planeGeometry.translate(coplanarPoint.x, coplanarPoint.y, coplanarPoint.z);

        const parallelPlaneMesh = new THREE.Mesh(planeGeometry, parallelPlaneMaterial);
        this.el.sceneEl.setObject3D('planeParallel', parallelPlaneMesh);
      }

      this.blockEl.object3D.visible = false;

      const partRightMaterial = this.partRightEl.getObject3D('mesh').material;
      partRightMaterial.clippingPlanes = partRightMaterial.clippingPlanes || [];
      partRightMaterial.clippingPlanes.length = 0;
      partRightMaterial.clippingPlanes.push(rightCutPlane);

      const cutRightMaterial = this.cutRightEl.getObject3D('mesh').material;
      cutRightMaterial.clippingPlanes = cutRightMaterial.clippingPlanes || [];
      cutRightMaterial.clippingPlanes.length = 0;
      cutRightMaterial.clippingPlanes.push(rightBorderOuterPlane);
      cutRightMaterial.clippingPlanes.push(rightBorderInnerPlane);

      const partLeftMaterial = this.partLeftEl.getObject3D('mesh').material;
      partLeftMaterial.clippingPlanes = partLeftMaterial.clippingPlanes || [];
      partLeftMaterial.clippingPlanes.length = 0;
      partLeftMaterial.clippingPlanes.push(leftCutPlane);

      const cutLeftMaterial = this.cutLeftEl.getObject3D('mesh').material;
      cutLeftMaterial.clippingPlanes = cutLeftMaterial.clippingPlanes || [];
      cutLeftMaterial.clippingPlanes.length = 0;
      cutLeftMaterial.clippingPlanes.push(leftBorderInnerPlane);
      cutLeftMaterial.clippingPlanes.push(leftBorderOuterPlane);

      this.partLeftEl.object3D.visible = true;
      this.partRightEl.object3D.visible = true;

      this.el.sceneEl.renderer.localClippingEnabled = true;
      this.destroyed = true;
      this.gravityVelocity = 0.1;

      this.rotationAxis.copy(this.rightCutPlanePoints[0]).sub(this.rightCutPlanePoints[1]);

      this.returnToPoolTimer = 800;

      auxObj3D.up.copy(rightCutPlane.normal);
      auxObj3D.lookAt(direction);
      this.particles.emit('explode', {
        position: this.el.object3D.position,
        rotation: auxObj3D.rotation
      });
    };
  })(),

  destroyMine: function () {
    for (let i = 0; i < this.mineFragments.length; i++) {
      this.mineFragments[i].visible = true;
    }

    this.blockEl.object3D.visible = false;
    this.destroyed = true;
    this.gravityVelocity = 0.1;
    this.returnToPoolTimer = 800;

    this.mineParticles.emit('explode', {
      position: this.el.object3D.position,
      rotation: this.randVec
    });
  },

  initCuttingClippingPlanes: function () {
    this.leftCutPlanePointsWorld = [
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3()
    ];
    this.rightCutPlanePointsWorld = [
      new THREE.Vector3(),
      new THREE.Vector3(),
      new THREE.Vector3()
    ];

    this.rightCutPlane = new THREE.Plane();
    this.rightBorderOuterPlane = new THREE.Plane();
    this.rightBorderInnerPlane = new THREE.Plane();

    this.leftCutPlane = new THREE.Plane();
    this.leftBorderOuterPlane = new THREE.Plane();
    this.leftBorderInnerPlane = new THREE.Plane();
  },

  generateCutClippingPlanes: function () {
    var leftBorderInnerPlane = this.leftBorderInnerPlane;
    var leftBorderOuterPlane = this.leftBorderOuterPlane;
    var leftCutPlane = this.leftCutPlane;
    var leftCutPlanePointsWorld = this.leftCutPlanePointsWorld;
    var partLeftEl = this.partLeftEl;
    var partRightEl = this.partRightEl;
    var rightBorderInnerPlane = this.rightBorderInnerPlane;
    var rightBorderOuterPlane = this.rightBorderOuterPlane;
    var rightCutPlane = this.rightCutPlane;
    var rightCutPlanePointsWorld = this.rightCutPlanePointsWorld;

    partRightEl.object3D.updateMatrixWorld();
    partRightEl.object3D.localToWorld(
      rightCutPlanePointsWorld[0].copy(this.rightCutPlanePoints[0]));
    partRightEl.object3D.localToWorld(
      rightCutPlanePointsWorld[1].copy(this.rightCutPlanePoints[1]));
    partRightEl.object3D.localToWorld(
      rightCutPlanePointsWorld[2].copy(this.rightCutPlanePoints[2]));

    partLeftEl.object3D.updateMatrixWorld();
    partLeftEl.object3D.localToWorld(
      leftCutPlanePointsWorld[0].copy(this.leftCutPlanePoints[0]));
    partLeftEl.object3D.localToWorld(
      leftCutPlanePointsWorld[1].copy(this.leftCutPlanePoints[1]));
    partLeftEl.object3D.localToWorld(
      leftCutPlanePointsWorld[2].copy(this.leftCutPlanePoints[2]));

    rightCutPlane.setFromCoplanarPoints(
      rightCutPlanePointsWorld[0], rightCutPlanePointsWorld[1], rightCutPlanePointsWorld[2]);
    rightBorderOuterPlane.set(rightCutPlane.normal,
                              rightCutPlane.constant + this.cutThickness);

    leftCutPlane.setFromCoplanarPoints(
      leftCutPlanePointsWorld[0], leftCutPlanePointsWorld[1], leftCutPlanePointsWorld[2]);
    leftBorderOuterPlane.set(leftCutPlane.normal, leftCutPlane.constant + this.cutThickness);

    rightBorderInnerPlane.setFromCoplanarPoints(
      rightCutPlanePointsWorld[2], rightCutPlanePointsWorld[1], rightCutPlanePointsWorld[0]);
    leftBorderInnerPlane.setFromCoplanarPoints(
      leftCutPlanePointsWorld[2], leftCutPlanePointsWorld[1], leftCutPlanePointsWorld[0]);
  },

  returnToPool: function (force) {
    if (!this.backToPool && !force) { return; }
    this.el.sceneEl.components[this.poolName].returnEntity(this.el);
  },

  checkCollisions: function () {
    const cutDirection = this.data.cutDirection;
    const saberColors = this.saberColors;
    const saberEls = this.saberEls;
    const hitBoundingBox = this.hitColliderEl && this.hitBoundingBox.setFromObject(
      this.hitColliderEl.getObject3D('mesh'));
    const beatBoundingBox = this.beatBoundingBox.setFromObject(
      this.blockEl.getObject3D('mesh'));

    for (let i = 0; i < saberEls.length; i++) {
      let saberBoundingBox = saberEls[i].components['saber-controls'].boundingBox;
      let saberControls;
      let maxAngle;

      if (!saberBoundingBox) { break; }

      const hand = saberEls[i].getAttribute('saber-controls').hand;
      if (hitBoundingBox && saberBoundingBox.intersectsBox(hitBoundingBox)) {
        if (saberEls[i].components['saber-controls'].swinging &&
            this.data.color === saberColors[hand]) {
          saberControls = saberEls[i].components['saber-controls'];
          this.hitHand = hand;
          this.hitSaberEl = saberEls[i];
          this.hitSaberEl.addEventListener('strokeend', this.onEndStroke, ONCE);
          if (cutDirection === 'up' || cutDirection === 'down') {
            maxAngle = saberControls.maxAnglePlaneX;
          } else if (cutDirection === 'left' || cutDirection === 'right') {
            maxAngle = saberControls.maxAnglePlaneY;
          } else {
            maxAngle = saberControls.maxAnglePlaneXY;
          }
          this.angleBeforeHit = maxAngle;
          saberControls.maxAnglePlaneX = 0;
          saberControls.maxAnglePlaneY = 0;
          saberControls.maxAnglePlaneXY = 0;
        } else {
          this.wrongHit(hand);
        }
        this.el.parentNode.components['beat-hit-sound'].playSound(
          this.el, this.data.cutDirection);
        if (this.data.type === 'mine') {
          this.destroyMine();
        } else {
          this.destroyBeat(saberEls[i]);
        }
        break;
      }

      if (saberBoundingBox.intersectsBox(beatBoundingBox)) {
        this.el.parentNode.components['beat-hit-sound'].playSound(this.el);

        if (this.data.type === 'mine') {
          this.el.emit('minehit', null, true);
          this.destroyMine();
          break;
        }

        this.destroyBeat(saberEls[i]);

        if (this.data.type === 'dot' && saberEls[i].components['saber-controls'].swinging &&
            this.data.color === saberColors[hand]) {
          this.hitSaberEl = saberEls[i];
          this.hitSaberEl.addEventListener('strokeend', this.onEndStroke);
          saberControls = saberEls[i].components['saber-controls'];
          maxAngle = Math.max(saberControls.maxAnglePlaneX, saberControls.maxAnglePlaneY,
                              saberControls.maxAnglePlaneXY);
          this.hitHand = hand;
          this.angleBeforeHit = maxAngle;
          saberControls.maxAnglePlaneX = 0;
          saberControls.maxAnglePlaneY = 0;
          saberControls.maxAnglePlaneXY = 0;
        } else {
          this.wrongHit(hand);
        }
        break;
      }
    }
  },

  onEndStroke: function () {
    var saberControls = this.hitSaberEl.components['saber-controls'];
    var maxAngle;
    var cutDirection = this.data.cutDirection;
    var hitEventDetail = this.hitEventDetail;
    if (cutDirection === 'up' || cutDirection === 'down') {
      maxAngle = saberControls.maxAnglePlaneX;
    } else if (cutDirection === 'left' || cutDirection === 'right') {
      maxAngle = saberControls.maxAnglePlaneY;
    } else {
      maxAngle = saberControls.maxAnglePlaneXY;
    }
    hitEventDetail.angleBeforeHit = this.angleBeforeHit * 180 / Math.PI;
    hitEventDetail.angleAfterHit = maxAngle * 180 / Math.PI;
    // console.log("MAX ANGLE BEORE: " + this.angleBeforeHit * 180 / Math.PI);
    // console.log("MAX ANGLE AFTER: " + maxAngle  * 180 / Math.PI);

    this.el.emit('beathit', hitEventDetail, true);
    this.el.emit(`beathit${this.hitHand}`, null, true);
  },

  /**
   * Destroyed animation.
   */
  tockDestroyed: (function () {
    var leftCutNormal = new THREE.Vector3();
    var leftRotation = 0;
    var rightCutNormal = new THREE.Vector3();
    var rightRotation = 0;
    var rotationStep = 2 * Math.PI / 150;
    var fragment;

    return function (timeDelta) {
      // Update gravity velocity.
      this.gravityVelocity = getGravityVelocity(this.gravityVelocity, timeDelta);
      this.el.object3D.position.y += this.gravityVelocity * (timeDelta / 1000);

      if (this.data.type == 'mine') {
        for (var i = 0; i < this.mineFragments.length; i++) {
          fragment = this.mineFragments[i];
          if (!fragment.visible) { continue; }
          fragment.position.addScaledVector(fragment.speed, timeDelta / 1000);
          fragment.scale.multiplyScalar(0.97)
          if (fragment.scale.y < 0.1){
            fragment.visible = false;
          }
        }
        return;
      }

      rightCutNormal.copy(this.rightCutPlane.normal)
                    .multiplyScalar((this.data.speed / 2) * (timeDelta / 500));
      rightCutNormal.y = 0;  // Y handled by gravity.
      this.partRightEl.object3D.position.add(rightCutNormal);
      this.partRightEl.object3D.setRotationFromAxisAngle(this.rotationAxis, rightRotation);
      rightRotation = rightRotation >= 2 * Math.PI ? 0 : rightRotation + rotationStep;

      leftCutNormal.copy(this.leftCutPlane.normal)
                   .multiplyScalar((this.data.speed / 2) * (timeDelta / 500));
      leftCutNormal.y = 0;  // Y handled by gravity.
      this.partLeftEl.object3D.position.add(leftCutNormal);
      this.partLeftEl.object3D.setRotationFromAxisAngle(this.rotationAxis, leftRotation);
      leftRotation = leftRotation >= 2 * Math.PI ? 0 : leftRotation + rotationStep;

      this.generateCutClippingPlanes();

      this.returnToPoolTimer -= timeDelta;
      this.backToPool = this.returnToPoolTimer <= 0;
    };
  })(),

  /**
   * Load OBJ from already parsed and loaded OBJ template.
   */
  setObjModelFromTemplate: (function () {
    const geometries = {};

    return function (el, templateId) {
      if (!geometries[templateId]) {
        const templateEl = document.getElementById(templateId);
        if (templateEl.getObject3D('mesh')) {
          geometries[templateId] = templateEl.getObject3D('mesh').children[0].geometry;
        } else {
          templateEl.addEventListener('model-loaded', () => {
            geometries[templateId] = templateEl.getObject3D('mesh').children[0].geometry;
            this.setObjModelFromTemplate(el, templateId);
          });
          return;
        }
      }

      if (!el.getObject3D('mesh')) { el.setObject3D('mesh', new THREE.Mesh()); }
      el.getObject3D('mesh').geometry = geometries[templateId];
    };
  })()
});

/**
 * Get velocity given current velocity using gravity acceleration.
 */
function getGravityVelocity (velocity, timeDelta) {
  const GRAVITY = -9.8;
  return velocity + (GRAVITY * (timeDelta / 1000));
}
