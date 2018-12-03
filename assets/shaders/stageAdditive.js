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
    uniform vec3 tunnelNeon;
    uniform sampler2D src;

    void main() {
      vec4 col = texture2D(src, uvs);
      float mask = min(step(0.87, uvs.x), step(0.5, uvs.y));
      mask = min(mask, 1.0 - step(0.75, uvs.y));
      col.xyz = mix(col.xyz, col.xyz * tunnelNeon, mask);
      gl_FragColor = col;
    }
  `
};
