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
    #define FOG_RADIUS  55.0
    #define FOG_FALLOFF 50.0
    #define FOG_COLOR_MULT 0.85
    varying vec2 uvs;
    varying vec3 worldPos;
    uniform vec3 color;
    uniform sampler2D src;

    void main() {
      vec4 col = texture2D(src, uvs);
      float mask = step(0.5, uvs.x);
      mask = min(mask, max(step(0.75, uvs.x), 1.0 - step(0.5, uvs.y)));
      col = mix(col * vec4(color, 1.0), col, mask);
      col.xyz = mix(color * FOG_COLOR_MULT, col.xyz, clamp(distance(worldPos, vec3(0., 0., -FOG_RADIUS)) / FOG_FALLOFF, 0., 1.));
      gl_FragColor = col;
    }
  `
};
