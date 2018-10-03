/**
 * Create beat from pool, collision detection, clipping planes.
 */
AFRAME.registerComponent('beat', {
  schema: {
    color: {default: 'red', oneOf: ['red', 'blue']},
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
    arrow: {obj: '#beat-obj'},
    dot: {obj: '#beat-obj'},
    mine: {obj: '#mine-obj'}
  },

  signModels: {
    arrow: {obj: '#arrow-obj'},
    dot: {obj: '#dot-obj'}
  },

  init: function () {
    var el = this.el;
    var color;
    var size = this.data.size;
    this.beatBoundingBox = new THREE.Box3();
    this.boundingBox = new THREE.Box3();
    this.saberEls = this.el.sceneEl.querySelectorAll('[saber-controls]');
    this.backToPool = false;
    this.gravityVelocity = 0;
    this.returnToPoolTimer = 800;
    this.rightCutPlanePoints = [];
    this.leftCutPlanePoints = [];
    this.missElLeft = document.querySelector('#missLeft'); 
    this.missElRight = document.querySelector('#missRight');
    this.initBlock();
    this.initColliders();
    this.initFragments();
  },

  update: function () {
    this.updateBlock();
    this.updateFragments();
  },

  initBlock: function () {
    var el = this.el;
    var blockEl = this.blockEl = document.createElement('a-entity');
    var signEl = this.signEl = document.createElement('a-entity');

    // Small offset to prevent z-fighting when the blocks are far away
    signEl.object3D.position.z += 0.02;
    blockEl.appendChild(signEl);
    el.appendChild(blockEl);
  },

  updateBlock: function () {
    var blockEl = this.blockEl;
    var signEl = this.signEl;

    blockEl.setAttribute('obj-model', this.models[this.data.type]);
    blockEl.setAttribute('material', {
      metalness: 0.6,
      roughness: 0.12,
      sphericalEnvMap: '#envmapTexture',
      color: this.materialColor[this.data.color]
    });

    // Model is 0.29 size. We make it 1.0 so we can easily scale based on 1m size.
    blockEl.object3D.scale.multiplyScalar(3.45).multiplyScalar(this.data.size);

    if (this.data.type === 'mine') {
      blockEl.addEventListener('model-loaded', evt => {
        var model = evt.detail.model.children[0];
        model.material = this.el.sceneEl.components.stagecolors.mineMaterial;
      });
    }

    signEl.setAttribute('obj-model', this.signModels[this.data.type]);
    signEl.setAttribute('material', {shader: 'flat', color: '#88f'});
  },

  initColliders: function () {
    var data = this.data;
    var i;
    var size;
    var hitColliderConfiguration =  {
      position: {x: 0, y: data.size / 2, z: 0}, 
      size: {width: data.size, height: data.size / 5.0, depth: data.size}
    };

    var hitColliderEl = this.hitColliderEl = document.createElement('a-entity');
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
    var partEl;
    var cutEl;
    var color = this.data.color === 'red' ? '#5b0502' : '#083771';
    var size = this.data.size;
    var geometry = {primitive: 'box', height: size, width: size, depth: size};

    this.cutDirection = new THREE.Vector3();
    this.rotationAxis = new THREE.Vector3();

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

  updateFragments: function () {
    var cutLeftEl = this.cutLeftEl;
    var cutRightEl = this.cutRightEl;
    var partLeftEl = this.partLeftEl;
    var partRightEl = this.partRightEl;

    partLeftEl.setAttribute('obj-model', this.models.dot);
    partLeftEl.setAttribute('material', {
      metalness: 0.8,
      roughness: 0.12,
      sphericalEnvMap: '#envmapTexture',
      color: this.materialColor[this.data.color],
      side: 'double'
    });
    partLeftEl.object3D.visible = false;

    cutLeftEl.setAttribute('obj-model', this.models.dot);
    cutLeftEl.setAttribute('material', {
      shader: 'flat',
      color: this.data.cutColor,
      side: 'double'
    });

    partRightEl.setAttribute('obj-model', this.models.dot);
    partRightEl.setAttribute('material', {
      metalness: 0.8,
      roughness: 0.12,
      sphericalEnvMap: '#envmapTexture',
      color: this.materialColor[this.data.color],
      side: 'double'
    });
    partRightEl.object3D.visible = false;

    cutRightEl.setAttribute('obj-model', this.models.dot);
    cutRightEl.setAttribute('material', {
      shader: 'flat',
      color: this.data.cutColor,
      side: 'double'
    });
  },

  missBeat: function (hand) {
    var missEl = hand === 'left' ? this.missElLeft : this.missElRight;
    if (!missEl) { return; }
    missEl.object3D.position.copy(this.el.object3D.position);
    missEl.object3D.position.y += 0.5;
    missEl.object3D.position.z -= 0.5;
    missEl.object3D.visible = true;
    setTimeout(function () {
      missEl.object3D.visible = false;
    }, 3000);
    this.destroyed = true;
  },

  destroyBeat: (function () {
    var parallelPlaneMaterial = new THREE.MeshBasicMaterial({color: '#00008b', side: THREE.DoubleSide});
    var planeMaterial = new THREE.MeshBasicMaterial({color: 'grey', side: THREE.DoubleSide});
    var point1 = new THREE.Vector3();
    var point2 = new THREE.Vector3();
    var point3 = new THREE.Vector3();

    return function (saberEl) {
      var coplanarPoint;
      var cutThickness = this.cutThickness = 0.02;
      var direction = this.cutDirection;
      var focalPoint;
      var i;
      var leftBorderInnerPlane = this.leftBorderInnerPlane;
      var leftBorderOuterPlane = this.leftBorderOuterPlane;
      var leftCutPlane = this.leftCutPlane;
      var parallelPlane2;
      var parallelPlane;
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

      this.partLeftEl.object3D.position.set(0, 0, 0);
      this.partLeftEl.object3D.rotation.set(0, 0, 0)
      this.partLeftEl.object3D.updateMatrixWorld();

      this.partRightEl.object3D.position.set(0, 0, 0);
      this.partRightEl.object3D.rotation.set(0, 0, 0);
      this.partRightEl.object3D.updateMatrixWorld();

      this.rightCutPlanePoints.length = 0;
      this.rightCutPlanePoints.push(this.partRightEl.object3D.worldToLocal(point1.clone()));
      this.rightCutPlanePoints.push(this.partRightEl.object3D.worldToLocal(point2.clone()));
      this.rightCutPlanePoints.push(this.partRightEl.object3D.worldToLocal(point3.clone()));

      this.leftCutPlanePoints.length = 0;
      this.leftCutPlanePoints.push(this.partLeftEl.object3D.worldToLocal(point3.clone()));
      this.leftCutPlanePoints.push(this.partLeftEl.object3D.worldToLocal(point2.clone()));
      this.leftCutPlanePoints.push(this.partLeftEl.object3D.worldToLocal(point1.clone()));

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

        parallelPlaneMesh = new THREE.Mesh(planeGeometry, parallelPlaneMaterial);
        this.el.sceneEl.setObject3D('planeParallel', parallelPlaneMesh);
      }

      this.blockEl.object3D.visible = false;

      const partRightMaterial = this.partRightEl.getObject3D('mesh').material;
      partRightMaterial.clippingPlanes = partRightMaterial.clippingPlanes || [];
      partRightMaterial.clippingPlanes.length = 0;
      partRightMaterial.clippingPlanes.push(rightCutPlane);

      const cutRightMaterial = this.cutRightEl.getObject3D('mesh').material;
      cutRightMaterial.clippingPlanes = cutRightMaterial.clippingPlanes || [];
      cutRightMaterial.clippingPlanes.length  = 0
      cutRightMaterial.clippingPlanes.push(rightBorderOuterPlane)
      cutRightMaterial.clippingPlanes.push(rightBorderInnerPlane)

      const partLeftMaterial = this.partLeftEl.getObject3D('mesh').material;
      partLeftMaterial.clippingPlanes = partLeftMaterial.clippingPlanes || [];
      partLeftMaterial.clippingPlanes.length = 0;
      partLeftMaterial.clippingPlanes.push(leftCutPlane);

      const cutLeftMaterial = this.cutLeftEl.getObject3D('mesh').material;
      cutLeftMaterial.clippingPlanes = cutLeftMaterial.clippingPlanes || [];
      cutLeftMaterial.clippingPlanes.length = 0;
      cutLeftMaterial.clippingPlanes.push(leftBorderInnerPlane)
      cutLeftMaterial.clippingPlanes.push(leftBorderOuterPlane)

      this.partLeftEl.object3D.visible = true;
      this.partRightEl.object3D.visible = true;

      this.el.sceneEl.renderer.localClippingEnabled = true;
      this.destroyed = true;
      this.gravityVelocity = 0.1;

      this.rotationAxis.copy(this.rightCutPlanePoints[0]).sub(this.rightCutPlanePoints[1]);

      this.returnToPoolTimer = 800;

      // this.el.sceneEl.components['json-particles__hit'].explode(this.el.object3D.position, rightCutPlane.normal, direction, this.data.color);
    }
  })(),

  pause: function () {
    this.el.object3D.visible = false;
    this.partLeftEl.object3D.visible = false;
    this.partRightEl.object3D.visible = false;
  },

  play: function () {
    this.destroyed = false;
    this.el.object3D.visible = true;
    this.blockEl.object3D.visible = true;
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
    partRightEl.object3D.localToWorld(rightCutPlanePointsWorld[0].copy(this.rightCutPlanePoints[0]));
    partRightEl.object3D.localToWorld(rightCutPlanePointsWorld[1].copy(this.rightCutPlanePoints[1]));
    partRightEl.object3D.localToWorld(rightCutPlanePointsWorld[2].copy(this.rightCutPlanePoints[2]));

    partLeftEl.object3D.updateMatrixWorld();
    partLeftEl.object3D.localToWorld(leftCutPlanePointsWorld[0].copy(this.leftCutPlanePoints[0]));
    partLeftEl.object3D.localToWorld(leftCutPlanePointsWorld[1].copy(this.leftCutPlanePoints[1]));
    partLeftEl.object3D.localToWorld(leftCutPlanePointsWorld[2].copy(this.leftCutPlanePoints[2]));

    rightCutPlane.setFromCoplanarPoints(rightCutPlanePointsWorld[0], rightCutPlanePointsWorld[1], rightCutPlanePointsWorld[2]);
    rightBorderOuterPlane.set(rightCutPlane.normal, rightCutPlane.constant + this.cutThickness);

    leftCutPlane.setFromCoplanarPoints(leftCutPlanePointsWorld[0], leftCutPlanePointsWorld[1], leftCutPlanePointsWorld[2]);
    leftBorderOuterPlane.set(leftCutPlane.normal, leftCutPlane.constant + this.cutThickness);

    rightBorderInnerPlane.setFromCoplanarPoints(rightCutPlanePointsWorld[2], rightCutPlanePointsWorld[1], rightCutPlanePointsWorld[0]);
    leftBorderInnerPlane.setFromCoplanarPoints(leftCutPlanePointsWorld[2], leftCutPlanePointsWorld[1], leftCutPlanePointsWorld[0]);
  },

  returnToPool: function () {
    var poolName;
    var type;
    if (!this.backToPool) { return; }
    type = this.data.type;
    poolName = 'pool__beat-' + type;
    if (type !== 'mine') { poolName  += '-' + this.data.color; }
    this.el.sceneEl.components[poolName].returnEntity(this.el);
  },

  tock: (function () {
    var leftCutNormal = new THREE.Vector3();
    var leftRotation = 0;
    var rightCutNormal = new THREE.Vector3();
    var rightRotation = 0;
    var rotationStep = 2 * Math.PI / 150;

    return function (time, timeDelta) {
      var beatBoundingBox;
      var boundingBox;
      var i;
      var plane;
      var saberBoundingBox;
      var saberEls = this.saberEls;

      if (!this.destroyed) {
        if (!this.hitColliderEl.getObject3D('mesh')) { return; }
        boundingBox = this.boundingBox.setFromObject(this.hitColliderEl.getObject3D('mesh'));
        beatBoundingBox = this.beatBoundingBox.setFromObject(this.blockEl.getObject3D('mesh'));
        for (i = 0; i < saberEls.length; i++) {
          saberBoundingBox = saberEls[i].components['saber-controls'].boundingBox;
          if (!boundingBox || !saberBoundingBox) { break; } 
          if (saberBoundingBox.intersectsBox(boundingBox)) {
            this.destroyBeat(saberEls[i]);
            this.el.sceneEl.emit('beathit', null, false);
            break;
          }
          if (saberBoundingBox.intersectsBox(beatBoundingBox)) {
            this.destroyBeat(saberEls[i]);
            this.missBeat(saberEls[i].getAttribute('saber-controls').hand);
            this.el.sceneEl.emit('beatmissed', null, false);
            break;
          }
        }

        this.el.object3D.position.z += this.data.speed * (timeDelta / 1000);
        this.backToPool = this.el.object3D.position.z >= 2;
      } else {
        // Update gravity velocity.
        this.gravityVelocity = getGravityVelocity(this.gravityVelocity, timeDelta);
        this.el.object3D.position.y += this.gravityVelocity * (timeDelta / 1000);

        rightCutNormal.copy(this.rightCutPlane.normal).multiplyScalar((this.data.speed / 2) * (timeDelta / 500));
        rightCutNormal.y = 0;  // Y handled by gravity.
        this.partRightEl.object3D.position.add(rightCutNormal);
        this.partRightEl.object3D.setRotationFromAxisAngle(this.rotationAxis, rightRotation);
        rightRotation = rightRotation >= 2 * Math.PI ? 0 : rightRotation + rotationStep;

        leftCutNormal.copy(this.leftCutPlane.normal).multiplyScalar((this.data.speed / 2) * (timeDelta / 500));
        leftCutNormal.y = 0;  // Y handled by gravity.
        this.partLeftEl.object3D.position.add(leftCutNormal);
        this.partLeftEl.object3D.setRotationFromAxisAngle(this.rotationAxis, leftRotation);
        leftRotation = leftRotation >= 2 * Math.PI ? 0 : leftRotation + rotationStep;

        this.generateCutClippingPlanes();

        this.returnToPoolTimer -= timeDelta;
        this.backToPool = this.returnToPoolTimer <= 0;
      }

      this.returnToPool();
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
