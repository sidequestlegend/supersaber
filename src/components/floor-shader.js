AFRAME.registerShader('floor-shader', {
  schema: {
    src: {type: 'map', is: 'uniform'},
    normalMap: {type: 'map', is: 'uniform'},
    envMap: {type: 'map', is: 'uniform'},
    hitRight: {type: 'vec3', is: 'uniform', default: {x: 0, y: 1, z: 0}},
    hitLeft: {type: 'vec3', is: 'uniform', default: {x: 0, y: 0, z: 0}}
  },

  vertexShader: `
    varying vec2 uvs;
    varying vec3 worldPos;
    void main() {
      uvs.xy = uv.xy;
      vec4 p = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      worldPos = (modelMatrix * vec4( position, 1.0 )).xyz;
      gl_Position = p;
    }
  `,

  fragmentShader: `
    varying vec2 uvs;
    varying vec3 worldPos;
    uniform sampler2D src;
    uniform sampler2D normalMap;
    uniform sampler2D envMap;
    uniform vec3 hitRight;
    uniform vec3 hitLeft;

    vec3 drawCircle(vec3 p, vec3 center, float radius, float edgeWidth, vec3 color) {
      return color*(1.0-smoothstep(radius, radius+edgeWidth, length(p-center)));
    }

    void main() {
      vec2 p = uvs.xy - 0.5;
      p*= 4.0;

      vec3 col = texture2D(src, uvs).xyz;

      col += drawCircle(worldPos, hitRight, 0.04, 0.05, vec3(1.0, 0.4, 0.4));
      col += drawCircle(worldPos, hitRight, 0.02, 0.005, vec3(1.0, 1.0, 1.0));
      col += drawCircle(worldPos, hitLeft, 0.04, 0.05, vec3(1.0, 0.4, 0.4));
      col += drawCircle(worldPos, hitLeft, 0.02, 0.005, vec3(1.0, 1.0, 1.0));

      vec3 normal = normalize(texture2D(normalMap, uvs).xyz);

      // environment reflection
      vec3 reflectVec = normalize(reflect(normalize(worldPos - cameraPosition), normal));
      vec3 reflectView = normalize((viewMatrix * vec4(reflectVec, 0.0)).xyz + vec3(0.0, 0.0, 1.0));

      gl_FragColor = vec4(texture2D(envMap, reflectView.xy * vec2(0.5, -1.0) + vec2(0.75, 1.1)).xyz * 0.08 + col, 0.9 + col.x);
    }
  `
});
