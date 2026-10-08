import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
uniform float uVelocity;
uniform float uHover;
uniform float uPortrait;
uniform vec2 uPointer;
uniform float uTension;
void main(){
  vUv=uv;
  vec3 transformed=position;
  float edge=pow(abs(uv.x-.5)*2.,4.);
  float vertical=sin(uv.y*3.14159265);
  transformed.z+=edge*vertical*uVelocity*(1.-uPortrait*.7)*.07;
  transformed.z+=edge*uHover*(uPointer.x-.5)*.018;
  transformed.z+=sin(uv.x*3.14159265)*vertical*uTension*.016;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(transformed,1.);
}`;

const fragmentShader = `
varying vec2 vUv;
uniform sampler2D uMap;
uniform vec2 uCover;
uniform vec2 uPointer;
uniform float uHover;
uniform float uReveal;
uniform float uPortrait;
uniform sampler2D uNextMap;
uniform vec2 uNextCover;
uniform float uBlend;
uniform float uEdgeReveal;
uniform float uSeam;
uniform float uWidth;
uniform float uWipeAxis;
uniform vec3 uAccent;
uniform vec4 uCrop;
uniform float uOpacity;
uniform float uParallax;
uniform float uZoom;
void main(){
  vec2 uv=(vUv-.5)*uCover*(1.-uZoom)+.5;
  uv.y+=uParallax;
  uv=clamp(uv,vec2(.001),vec2(.999));
  uv=uCrop.xy+uv*uCrop.zw;
  float edge=pow(abs(vUv.x-.5)*2.,4.);
  uv+=(uPointer-.5)*uHover*.009*edge;
  vec4 color=texture2D(uMap,uv);
  if(uBlend>0.){
    vec2 nextUv=(vUv-.5)*uNextCover*(1.-uZoom)+.5;
    nextUv.y+=uParallax;
    nextUv=clamp(nextUv,vec2(.001),vec2(.999));
    float coordinate=uWipeAxis<.5?vUv.x:uWipeAxis<1.5?vUv.y:1.-vUv.y;
    float seam=smoothstep(coordinate-.025,coordinate+.025,uBlend*1.05-.025);
    color=mix(color,texture2D(uNextMap,nextUv),seam);
    float redEdge=(1.-smoothstep(1./uWidth,2./uWidth,abs(coordinate-(uBlend*1.05-.025))))*uSeam;
    color.rgb=mix(color.rgb,uAccent,redEdge);
  }
  float sweep=exp(-pow((vUv.x+vUv.y*.32-(uPointer.x*1.5-.15))*9.,2.));
  color.rgb+=sweep*uHover*.027*(1.-uPortrait*.8);
  float boundary=1.-uReveal;
  float mask=mix(smoothstep(boundary-.002,boundary+.002,vUv.y),1.-smoothstep(uReveal-.002,uReveal+.002,vUv.x),uEdgeReveal);
  if(uReveal>=.999) mask=1.;
  float revealEdge=(1.-smoothstep(.001,.004,abs(vUv.x-uReveal)))*uEdgeReveal*step(.01,uReveal)*(1.-step(.99,uReveal));
  color.rgb=mix(color.rgb,uAccent,revealEdge);
  float rim=1.-smoothstep(.001,.004,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));
  color.rgb+=vec3(rim*.025*(1.-uPortrait));
  gl_FragColor=vec4(color.rgb,color.a*mask*uOpacity);
  #include <colorspace_fragment>
}`;

export function mediaMaterial(texture: THREE.Texture, portrait: boolean) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uMap: { value: texture }, uCover: { value: new THREE.Vector2(1, 1) },
      uPointer: { value: new THREE.Vector2(.5, .5) }, uVelocity: { value: 0 },
      uHover: { value: 0 }, uReveal: { value: 1 }, uPortrait: { value: portrait ? 1 : 0 },
      uNextMap: { value: texture }, uNextCover: { value: new THREE.Vector2(1, 1) }, uBlend: { value: 0 }, uEdgeReveal: { value: 0 }, uTension: { value: 0 }, uSeam: { value: 0 }, uWidth: { value: 1 },
      uAccent: { value: new THREE.Color(0xa43128) }, uCrop: { value: new THREE.Vector4(0, 0, 1, 1) }, uOpacity: { value: 1 }, uWipeAxis: { value: 0 }, uParallax: { value: 0 }, uZoom: { value: 0 },
    }, vertexShader, fragmentShader, transparent: true, depthWrite: false, toneMapped: false, side: THREE.DoubleSide,
  });
}
