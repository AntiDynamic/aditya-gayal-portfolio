import { BufferGeometry, Float32BufferAttribute, Mesh, RawShaderMaterial, Scene, Camera, WebGLRenderer, GLSL3, Vector2, Vector3, Matrix3, CanvasTexture, LinearFilter, NoToneMapping } from "three";
import { blackHoleFragment } from "./black-hole-shader";

const smooth = (a:number,b:number,x:number) => { const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t); };
const vertex = `precision highp float; in vec3 position; void main(){gl_Position=vec4(position,1.0);}`;

/** A single fullscreen triangle traces 3D null geodesics. No scene textures/models. */
export class BlackHoleRenderer {
  private gl: WebGLRenderer;
  private scene = new Scene();
  private camera = new Camera();
  private geometry = new BufferGeometry();
  private material: RawShaderMaterial;
  private type: CanvasTexture;
  private position = new Vector3();
  private forward = new Vector3();
  private right = new Vector3();
  private up = new Vector3();
  private worldUp = new Vector3(0,1,0);
  private rolledRight = new Vector3();
  private basis = new Matrix3();
  private width=1; private height=1; private mobile=false;
  private scale=.85; private average=16.7; private samples=0; private cooldown=0;
  draws=0;

  constructor(private canvas:HTMLCanvasElement, private report:HTMLElement, private lost:()=>void) {
    this.gl = new WebGLRenderer({canvas,antialias:false,alpha:false,powerPreference:"high-performance"});
    this.gl.toneMapping=NoToneMapping;
    this.mobile=matchMedia("(max-width: 767px)").matches;
    this.scale=this.mobile?.7:.85;
    const atlas=document.createElement("canvas");atlas.width=2048;atlas.height=768;
    const ctx=atlas.getContext("2d")!;
    ctx.fillStyle="#000";ctx.fillRect(0,0,2048,768);
    ctx.fillStyle="#fff";ctx.textAlign="center";ctx.textBaseline="middle";
    const family=getComputedStyle(document.documentElement).getPropertyValue("--font-display");
    ctx.font=`650 132px ${family || "sans-serif"}`;
    ctx.fillText("STRANGE QUESTIONS.",1024,130,1950);
    ctx.fillText("USEFUL SYSTEMS.",1024,640,1780);
    this.type=new CanvasTexture(atlas);this.type.minFilter=LinearFilter;this.type.magFilter=LinearFilter;this.type.generateMipmaps=false;
    const inner=3,peak=inner*49/36;
    this.material=new RawShaderMaterial({glslVersion:GLSL3,vertexShader:vertex,fragmentShader:blackHoleFragment,
      defines:{MAX_STEPS:this.mobile?144:224},depthTest:false,depthWrite:false,
      uniforms:{uResolution:{value:new Vector2()},uTime:{value:0},uCamPos:{value:this.position},uCamMat:{value:this.basis},uTanHalfFov:{value:.43},
        uStepScale:{value:this.mobile?1.35:1.05},uDiskInner:{value:inner},uDiskOuter:{value:13},uDiskTemp:{value:6400},uTempNorm:{value:1/Math.pow((1-Math.sqrt(inner/peak))/peak**3,.25)},
        uDiskBrightness:{value:1.3},uBeaming:{value:1},uOrbitDir:{value:1},uTimeScale:{value:1},uStarIntensity:{value:.65},uExposure:{value:1},uToneMap:{value:1},uSpin:{value:0},uHorizon:{value:1},uViewMode:{value:0},uProgress:{value:0},uReduced:{value:0},uType:{value:this.type}}});
    this.geometry.setAttribute("position",new Float32BufferAttribute([-1,-1,0,3,-1,0,-1,3,0],3));
    const triangle=new Mesh(this.geometry,this.material);triangle.frustumCulled=false;this.scene.add(triangle);
    this.gl.debug.onShaderError=()=>this.lost();
    canvas.addEventListener("webglcontextlost",this.contextLost);
  }
  private contextLost=(event:Event)=>{event.preventDefault();this.lost();};
  resize(width:number,height:number) {
    this.width=width;this.height=height;
    const mobile=width<768;
    if(mobile!==this.mobile){
      this.mobile=mobile;this.scale=mobile?.7:.85;this.samples=0;this.average=16.7;
      this.material.defines.MAX_STEPS=mobile?144:224;
      this.material.uniforms.uStepScale.value=mobile?1.35:1.05;
      this.material.needsUpdate=true;
    }
    const cap=Math.min(this.scale,Math.sqrt(950000/(width*height)));
    this.gl.setPixelRatio(cap);this.gl.setSize(width,height,false);
    this.gl.getDrawingBufferSize(this.material.uniforms.uResolution.value);
    this.report.dataset.renderSize=`${this.canvas.width}×${this.canvas.height}`;
    this.report.dataset.raySteps=String(this.mobile?144:224);
    this.report.dataset.renderScale=cap.toFixed(2);
  }
  draw(progress:number,reduced:boolean,frameMs=0) {
    // Only sustained *active* frame intervals are evidence. Idle/first compile gaps
    // do not count. Quality can drop twice per visit, never oscillate frame to frame.
    if(frameMs>5 && frameMs<100 && progress<.80 && !reduced){
      this.average+=(frameMs-this.average)*.05;this.samples++;this.cooldown--;
      if(this.samples>90 && this.cooldown<=0 && this.average>25 && this.scale>(this.mobile?.5:.6)){
        this.scale=Math.max(this.mobile?.5:.6,this.scale-.12);this.resize(this.width,this.height);this.cooldown=240;this.samples=0;
      }
    }
    const p=reduced?.30:Math.min(progress,.775);
    // Logarithmic distance change, restrained orbit, then a final look back toward
    // the disk. Static-observer GR ends outside r_s; the interior is expressive.
    let distance=62*Math.exp(-.57*smooth(.07,.24,p)-1.08*smooth(.24,.48,p)-.97*smooth(.48,.64,p)-1.36*smooth(.64,.78,p));
    distance=Math.max(1.055,distance);
    const theta=-.20+.48*smooth(.18,.68,p);
    const elevation=.20+.12*smooth(.22,.55,p)-.18*smooth(.60,.775,p);
    this.position.set(Math.sin(theta)*Math.cos(elevation),Math.sin(elevation),Math.cos(theta)*Math.cos(elevation)).multiplyScalar(distance);
    this.forward.copy(this.position).negate().normalize();
    this.right.crossVectors(this.forward,this.worldUp).normalize();
    this.up.crossVectors(this.right,this.forward).normalize();
    const turn=smooth(.54,.76,p)*.72;
    this.forward.multiplyScalar(Math.cos(turn)).addScaledVector(this.up,Math.sin(turn)).normalize();
    this.up.crossVectors(this.right,this.forward).normalize();
    const roll=.08+.22*smooth(.50,.77,p);
    const rx=this.rolledRight.copy(this.right).multiplyScalar(Math.cos(roll)).addScaledVector(this.up,Math.sin(roll));
    this.up.multiplyScalar(Math.cos(roll)).addScaledVector(this.right,-Math.sin(roll));this.right.copy(rx);
    this.basis.set(this.right.x,this.up.x,this.forward.x,this.right.y,this.up.y,this.forward.y,this.right.z,this.up.z,this.forward.z);
    const u=this.material.uniforms;
    u.uTanHalfFov.value=this.width<768?.65:.43;
    u.uProgress.value=progress;u.uReduced.value=reduced?1:0;u.uTime.value=p*17;
    u.uExposure.value=reduced?1.05:(.015+smooth(.015,.17,p)*1.15)*(1-.65*smooth(.60,.78,p));
    this.gl.render(this.scene,this.camera);this.draws++;
    this.report.dataset.draws=String(this.draws);this.report.dataset.observerDistance=distance.toFixed(3);
  }
  dispose(){this.canvas.removeEventListener("webglcontextlost",this.contextLost);this.geometry.dispose();this.material.dispose();this.type.dispose();this.gl.dispose();this.gl.forceContextLoss();}
}
