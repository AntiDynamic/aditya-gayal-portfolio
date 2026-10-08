import * as THREE from "three";

export class SheetShadows {
  readonly mesh: THREE.InstancedMesh;
  private geometry = new THREE.PlaneGeometry(1, 1);
  private material = new THREE.ShaderMaterial({
    vertexShader: `attribute vec4 shadowShape;varying vec2 vUv;varying vec4 vShape;void main(){vUv=uv;vShape=shadowShape;gl_Position=projectionMatrix*modelViewMatrix*instanceMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 vUv;varying vec4 vShape;void main(){vec2 position=(vUv-.5)*vShape.xy;vec2 outside=max(abs(position)-(vShape.xy*.5-vec2(vShape.z*3.)),vec2(0.));float distance=length(outside)/max(1.,vShape.z);float edge=smoothstep(0.,.025,min(min(vUv.x,1.-vUv.x),min(vUv.y,1.-vUv.y)));gl_FragColor=vec4(0.,0.,0.,exp(-distance*distance*.5)*vShape.w*edge);}`,
    transparent: true, depthWrite: false, depthTest: false,
  });
  private shapes: THREE.InstancedBufferAttribute;
  private matrix = new THREE.Matrix4();
  private position = new THREE.Vector3();
  private scale = new THREE.Vector3();
  private quaternion = new THREE.Quaternion();
  private count = 0;
  constructor(capacity: number) {
    this.shapes = new THREE.InstancedBufferAttribute(new Float32Array(capacity * 4), 4);
    this.geometry.setAttribute("shadowShape", this.shapes);
    this.mesh = new THREE.InstancedMesh(this.geometry, this.material, capacity);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -10;
  }
  begin() { this.count = 0; }
  add(sheet: THREE.Mesh, cameraDistance: number) {
    if (!sheet.visible) return;
    const perspective = cameraDistance / (cameraDistance - sheet.position.z);
    const width = sheet.scale.x * perspective;
    const height = sheet.scale.y * perspective;
    const blur = 12 + Math.max(0, sheet.position.z) * .14;
    this.position.set(sheet.position.x * perspective + 7, sheet.position.y * perspective - 12 - Math.max(0, sheet.position.z) * .08, -.5);
    this.scale.set(width + blur * 6, height + blur * 6, 1);
    this.matrix.compose(this.position, this.quaternion, this.scale);
    this.mesh.setMatrixAt(this.count, this.matrix);
    this.shapes.setXYZW(this.count, this.scale.x, this.scale.y, blur, .1);
    this.count++;
  }
  commit() { this.mesh.count = this.count; this.mesh.visible = this.count > 0; this.mesh.instanceMatrix.needsUpdate = true; this.shapes.needsUpdate = true; }
  dispose() { this.geometry.dispose(); this.material.dispose(); this.mesh.dispose(); }
}
