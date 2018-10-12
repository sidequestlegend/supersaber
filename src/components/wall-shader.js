AFRAME.registerShader('wall-shader', {
  schema: {
    iTime: {type: 'time', is: 'uniform'},
    tex: {type: 'map', is: 'uniform'}
  },
  vertexShader: `
    varying vec2 uvs;
    void main() {
      uvs.xy = uv.xy;
      gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
    }
  `,
  fragmentShader: `
    // based on https://www.shadertoy.com/view/ldlXRS
    varying vec2 uvs;
    uniform float iTime;
    uniform sampler2D tex;

    #define time iTime/1000.0*0.15
    #define tau 6.2831853

    mat2 makem2(in float theta){float c = cos(theta);float s = sin(theta);return mat2(c,-s,s,c);}
    float noise( in vec2 x ){return texture2D(tex, x*.01).x;}

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
        
      col += smoothstep(0.49, 0.495, abs(pp.x));
      col += smoothstep(0.49, 0.495, abs(pp.y));
        
      gl_FragColor = vec4(col, 0.2 + smoothstep(0.0, 0.6, col.x));
    }
  ` 
});
