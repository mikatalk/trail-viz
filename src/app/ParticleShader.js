export default class ParticleShader {
  
  constructor() {
  
    this.fragment = `
/*************************************************************************/
uniform vec3 color;

const float pi2 = 6.283;

varying vec3 vColor;

void main() {

    gl_FragColor = vec4( color * vColor, 1.0 );
    gl_FragColor.a *= (sin(distance(gl_PointCoord.xy, vec2(0.5, .5) ) * pi2));

}
/*************************************************************************/
`;

    this.vertex = `
/*************************************************************************/
attribute float size;
attribute vec3 customColor;

varying vec3 vColor;

void main() {

    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    gl_PointSize = size * ( 200.0 / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;

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