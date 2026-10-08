import { CanvasTexture, DoubleSide, InstancedBufferAttribute, InstancedMesh, LinearFilter, PerspectiveCamera, PlaneGeometry, Scene, ShaderMaterial, WebGLRenderer } from "three";

const words = ["TIME", "SPACE", "LIGHT", "BEFORE", "AFTER", "HERE", "NOW", "REALITY"];
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ?.";

export class InformationArchive {
  private scene = new Scene();
  private camera = new PerspectiveCamera(48, 1, .05, 260);
  private geometry = new PlaneGeometry(1, 1, 8, 2);
  private atlas: CanvasTexture;
  private material: ShaderMaterial;
  private fragments: InstancedMesh;
  private mobileCount = 0;
  private reducedCount = 0;

  constructor() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const context = canvas.getContext("2d")!;
    const family = getComputedStyle(document.documentElement).getPropertyValue("--font-display") || "sans-serif";
    context.fillStyle = "#ede9df";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "650 92px " + family;
    Array.from(alphabet).forEach((letter, index) => {
      context.fillText(letter, (index % 8) * 128 + 64, Math.floor(index / 8) * 128 + 66, 114);
    });
    this.atlas = new CanvasTexture(canvas);
    this.atlas.minFilter = LinearFilter;
    this.atlas.magFilter = LinearFilter;
    this.atlas.generateMipmaps = false;

    const glyphs: number[] = [];
    const bands: number[] = [];
    for (let group = 0; group < 16; group++) {
      const word = words[group % words.length];
      Array.from(word).forEach((letter, index) => {
        for (let band = 0; band < 3; band++) {
          glyphs.push(alphabet.indexOf(letter), index - (word.length - 1) / 2, group, word.length);
          bands.push(band);
        }
      });
      if (group === 11) this.mobileCount = bands.length;
      if (group === 7) this.reducedCount = bands.length;
    }
    this.geometry.setAttribute("aGlyph", new InstancedBufferAttribute(new Float32Array(glyphs), 4));
    this.geometry.setAttribute("aBand", new InstancedBufferAttribute(new Float32Array(bands), 1));
    this.material = new ShaderMaterial({
      transparent: true, depthWrite: false, side: DoubleSide,
      uniforms: { uP: { value: 0 }, uAtlas: { value: this.atlas }, uReduced: { value: 0 } },
      vertexShader: `
attribute vec4 aGlyph;
attribute float aBand;
uniform float uP;
uniform float uReduced;
varying vec2 vUv;
varying float vCell;
varying float vDepth;
varying float vLight;
float hash(float seed){return fract(sin(seed*127.1+311.7)*43758.5453);}
void main(){
  float group=aGlyph.z;
  float seed=group*31.0+aGlyph.y*3.0+aBand;
  vCell=aGlyph.x;
  vUv=vec2(uv.x,(uv.y+aBand)/3.0);
  float motion=1.0-uReduced;
  float travel=smoothstep(.59,.765,uP)*48.0*motion;
  float fracture=smoothstep(.632,.78,uP)*motion;
  float collapse=smoothstep(.765,.848,uP);
  float angle=group*2.39996;
  float radius=2.8+hash(group+9.0)*5.5;
  vec3 center=vec3(cos(angle)*radius,sin(angle)*radius*.58,-11.0-group*5.1+travel);
  if(group<.5)center.xy=vec2(-1.8,1.2);
  float size=1.05+hash(group+4.0)*.65;
  center.x+=aGlyph.y*size*.62;
  center+=fracture*vec3((hash(seed+2.0)-.5)*5.0,(hash(seed+7.0)-.5)*3.0,(hash(seed+11.0)-.5)*12.0);
  float fault=smoothstep(.66,.71,uP)*(1.0-smoothstep(.728,.775,uP))*motion;
  center.x+=fault*(aBand-1.0)*size*1.8;
  center.z-=fault*hash(group+3.0)*5.0;
  vec3 local=vec3(position.x*.88,(position.y/3.0+(aBand-1.0)/3.0)*1.3,0.0)*size;
  float tide=smoothstep(.585,.64,uP)*(1.0-smoothstep(.71,.76,uP))*motion;
  local.x*=1.0+tide*.65;
  local.y*=1.0+tide*1.4;
  local.z+=sin(uv.x*3.14159)*size*tide*.9;
  float tilt=(hash(seed+19.0)-.5)*fracture*1.9;
  local.xy=mat2(cos(tilt),-sin(tilt),sin(tilt),cos(tilt))*local.xy;
  float yaw=(hash(group+1.0)-.5)*.45+fracture*(hash(seed+5.0)-.5)*1.8;
  local=vec3(local.x*cos(yaw),local.y,-local.x*sin(yaw)+local.z);
  center=mix(center,vec3(0.0,0.0,-16.0),collapse);
  local*=max(.0001,1.0-collapse);
  vec3 point=center+local;
  vDepth=-point.z;
  vLight=.7+.3*abs(cos(yaw));
  gl_Position=projectionMatrix*modelViewMatrix*vec4(point,1.0);
}
`,
      fragmentShader: `
uniform sampler2D uAtlas;
uniform float uP;
varying vec2 vUv;
varying float vCell;
varying float vDepth;
varying float vLight;
void main(){
  if(vDepth<.15)discard;
  vec2 atlasUv=vec2((mod(vCell,8.0)+vUv.x)/8.0,1.0-(floor(vCell/8.0)+1.0-vUv.y)/4.0);
  vec4 ink=texture2D(uAtlas,atlasUv);
  if(ink.a<.015)discard;
  float arrival=smoothstep(.575,.625,uP);
  float vanish=1.0-smoothstep(.831,.853,uP);
  float distanceFade=exp(-vDepth*.035)*(1.0-smoothstep(25.0,100.0,vDepth));
  float opacity=ink.a*distanceFade*smoothstep(.75,5.0,vDepth)*arrival*vanish;
  gl_FragColor=vec4(ink.rgb*vLight,opacity);
}
`,
    });
    this.fragments = new InstancedMesh(this.geometry, this.material, bands.length);
    this.fragments.frustumCulled = false;
    this.scene.add(this.fragments);
  }

  draw(renderer: WebGLRenderer, progress: number, width: number, height: number, reduced: boolean) {
    if (progress < .575 || progress > .855) return;
    this.camera.aspect = width / height;
    this.camera.fov = width < 768 ? 60 : 48;
    this.camera.updateProjectionMatrix();
    this.camera.position.set(reduced ? 0 : Math.sin(progress * 8) * .6, reduced ? 0 : Math.cos(progress * 5) * .35, 0);
    this.camera.lookAt(0, 0, -20);
    this.fragments.count = reduced ? this.reducedCount : width < 768 ? this.mobileCount : this.fragments.instanceMatrix.count;
    this.material.uniforms.uP.value = progress;
    this.material.uniforms.uReduced.value = reduced ? 1 : 0;
    renderer.autoClear = false;
    renderer.clearDepth();
    renderer.render(this.scene, this.camera);
    renderer.autoClear = true;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.atlas.dispose();
    this.fragments.dispose();
  }
}
