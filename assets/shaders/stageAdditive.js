module.exports = {
  vertexShader : `
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
    uniform vec3 redColor;
    uniform vec3 blueColor;
    uniform sampler2D src;

    void main() {
      vec4 col = texture2D(src, uvs);
      gl_FragColor = col;
    }
  `
};
