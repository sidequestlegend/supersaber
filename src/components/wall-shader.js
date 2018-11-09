
AFRAME.registerShader('wall-shader', {
  schema: {
    iTime: {type: 'time', is: 'uniform'},
    tex: {type: 'map', is: 'uniform'},
    env: {type: 'map', is: 'uniform'},
    hitRight: {type: 'vec3', is: 'uniform', default: {x: 0, y: 1, z: 0}},
    hitLeft: {type: 'vec3', is: 'uniform', default: {x: 0, y: 0, z: 0}}
  },

  vertexShader: `
    varying vec2 uvs;
    varying vec3 nrml;
    varying vec3 worldPos;
    void main() {
      uvs.xy = uv.xy;
      nrml.xyz = normal.xyz;
      vec4 p = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
      worldPos = (modelMatrix * vec4( position, 1.0 )).xyz;
      gl_Position = p;
    }
  `,

  fragmentShader: `
    // based on https://www.shadertoy.com/view/ldlXRS
    varying vec2 uvs;
    varying vec3 nrml;
    varying vec3 worldPos;
    uniform float iTime;
    uniform sampler2D tex;
    uniform sampler2D env;
    uniform vec3 hitRight;
    uniform vec3 hitLeft;

    #define time iTime/1000.0*0.15
    #define tau 6.2831853

    mat2 makem2(in float theta){float c = cos(theta);float s = sin(theta);return mat2(c,-s,s,c);}
    float noise( in vec2 x ){return texture2D(tex, x*.007).x;}

    float fbm(in vec2 p) {
      float z=2.;
      float rz = 0.;
      vec2 bp = p;
      for (float i= 1.;i < 6.;i++)
      {
        rz+= abs((noise(p)-0.5)*2.)/z;
        z = z*2.;
        p = p*2.;
      }
      return rz;
    }

    float dualfbm(in vec2 p) {
      vec2 p2 = p*.4;
      vec2 basis = vec2(fbm(p2-time*1.6),fbm(p2+time*1.7));
      basis = (basis-.5)*.2;
      p += basis;

      return fbm(p*makem2(time*0.2));
    }

    vec3 drawCircle(vec3 p, vec3 center, float radius, float edgeWidth, vec3 color) {
      return color*(1.0-smoothstep(radius, radius+edgeWidth, length(p-center)));
    }

    void main() {

      vec2 p = uvs.xy-0.5;// / iResolution.xy-0.5;
      vec2 pp = p;
      p*= 4.0;

      float rz = dualfbm(p)*5.0;

      p += time * 20.0;
      rz *= pow(abs(cos(p.x*.2) + sin(p.y*1.4)*0.1), .4);

      vec3 col = vec3(0.2,0.0,0.0) / rz;
      col.g = smoothstep(0.6, 1.0, col.r);
      col.b = smoothstep(0.6, 1.0, col.r);

      col += smoothstep(0.48, 0.495, abs(pp.x));
      col += smoothstep(0.48, 0.495, abs(pp.y));

      col += drawCircle(worldPos, hitRight, 0.04, 0.05, vec3(1.0, 0.4, 0.4));
      col += drawCircle(worldPos, hitRight, 0.02, 0.005, vec3(1.0, 1.0, 1.0));
      col += drawCircle(worldPos, hitLeft, 0.04, 0.05, vec3(1.0, 0.4, 0.4));
      col += drawCircle(worldPos, hitLeft, 0.02, 0.005, vec3(1.0, 1.0, 1.0));

      //gl_FragColor = vec4(col, 1.0);

      // add environment reflection
      vec3 reflectVec = normalize(reflect(normalize(worldPos - cameraPosition), normalize(nrml + col)));
      vec3 reflectView = normalize( ( viewMatrix * vec4( reflectVec, 0.0 ) ).xyz + vec3( 0.0, 0.0, 1.0 ) );

      gl_FragColor = vec4(texture2D(env, reflectView.xy * 0.5 + 0.5).xyz * 0.05 + col, 0.9 + col.x);
    }
  `
});
