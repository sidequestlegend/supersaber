AFRAME.registerShader('superCutFxShader', {
  schema: {
    starttime: {type: 'float', is: 'uniform'},
    timems: {type: 'time', is: 'uniform'}
  },

  vertexShader: `
    varying vec2 uvs;
    varying vec3 worldPos;
    void main() {
      uvs.xy = uv.xy;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,

  fragmentShader: `
    uniform float starttime;
    uniform float timems;
    varying vec2 uvs;
    varying vec3 worldPos;

    #define COLOR vec3(0, 0.67, 0.98)

    void main() {
      float time = (timems - starttime) / 2000.0;
      vec2 p = uvs.xy - 0.5;
      float r = p.x * p.x + p.y * p.y;
      float alpha = 1.0 - smoothstep(time - 0.01, time, r);
      alpha *= smoothstep(time - 0.1, time, r);
      alpha *= 1.0 - time * 5.5;
      gl_FragColor = vec4(COLOR, alpha);
    }
  `
});
