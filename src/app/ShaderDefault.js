export default class ShaderDefault {
  
  constructor(maxAltitude) {
  
    this.fragment = `
/*************************************************************************/
varying vec2 vUv;
varying vec3 pos;
const float maxAltitude = ${maxAltitude};


void main() {

/* r   g   b
 * 55  231 146
 * 129 81  44
 * diff:
 * 74  150 100 */

  vec3 color = vec3(0.0);
  color.r = (129.0 + 74.0 * pos.z / maxAltitude ) / 255.0;
  color.g = (81.0 + 150.0 * pos.z / maxAltitude ) / 255.0;
  color.b = (44.0 + 100.0 * pos.z / maxAltitude ) / 255.0;
  float ratio = (sin(vUv.x*3.14)+sin(vUv.y*3.14))*.3;
  color.r = color.r*ratio +  170.0/255.0*(1.0-ratio);
  color.g = color.g*ratio +  204.0/255.0*(1.0-ratio);
  color.b = color.b*ratio +  204.0/255.0*(1.0-ratio);
  gl_FragColor = vec4( color.rgb, ratio);
  // gl_FragColor = vec4( color.rgb, 1.0);
}
/*************************************************************************/
`;

    this.vertex = `
/*************************************************************************/
varying vec2 vUv;
varying vec3 pos;

void main() {
  
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  vUv = uv;
  pos = position;

}
/*************************************************************************/
`;
    
  }

  getFragment() {
    return this.fragment;
  }
  
  getVertex() {
    return this.vertex;
  }

}