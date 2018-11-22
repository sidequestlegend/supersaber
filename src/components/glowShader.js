AFRAME.registerShader('glowShader', {
  schema: {
    color: {type: 'color', is:'uniform', default: '#f00'}
  },

  vertexShader: `
    varying vec2 uvs;
    varying vec3 worldPos;
    varying float alpha;
    void main() {
      uvs.xy = uv.xy;
      vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vec3 viewVector = normalize(worldPos.xyz - cameraPosition);
      alpha = pow(dot(viewVector, worldNormal), 2.0);
      alpha *= uv.y * 2.0;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,

  fragmentShader: `
    uniform vec3 color;
    varying vec2 uvs;
    varying float alpha;

    void main() {
      gl_FragColor = vec4(color, alpha);
    }
  `
});
