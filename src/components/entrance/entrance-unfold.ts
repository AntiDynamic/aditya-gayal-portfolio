import { BufferGeometry, Float32BufferAttribute, type Material } from "three";

/** Subdivide the authored silhouette, preserving UV/material boundaries for a real curl. */
export function foldTopology(source: BufferGeometry, maxEdge: number) {
  const input = source.index ? source.toNonIndexed() : source;
  const position = input.getAttribute("position");
  const output: number[] = [];
  const geometry = new BufferGeometry();
  type Vertex = [number, number, number];
  const distance = (a: Vertex, b: Vertex) => Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2]);
  const midpoint = (a: Vertex, b: Vertex): Vertex => [(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
  const split = (a: Vertex, b: Vertex, c: Vertex, depth = 0) => {
    const ab = distance(a,b), bc = distance(b,c), ca = distance(c,a);
    if (depth >= 8 || Math.max(ab,bc,ca) <= maxEdge) { output.push(...a,...b,...c); return; }
    if (ab >= bc && ab >= ca) { const m=midpoint(a,b); split(a,m,c,depth+1); split(m,b,c,depth+1); }
    else if (bc >= ca) { const m=midpoint(b,c); split(a,b,m,depth+1); split(a,m,c,depth+1); }
    else { const m=midpoint(c,a); split(a,b,m,depth+1); split(m,b,c,depth+1); }
  };
  for (const group of input.groups) {
    const start = output.length / 3;
    for (let i = group.start; i < group.start + group.count; i += 3) {
      const v = (j: number): Vertex => [position.getX(j),position.getY(j),position.getZ(j)];
      split(v(i),v(i+1),v(i+2));
    }
    geometry.addGroup(start, output.length / 3 - start, group.materialIndex);
  }
  geometry.setAttribute("position",new Float32BufferAttribute(output,3));
  if (input !== source) input.dispose();
  return geometry;
}

export type FoldUniforms = {
  uFieldCurl: { value: number };
  uFieldHinge: { value: number };
  uFieldDirection: { value: number };
};

/** Same analytic bend for the visible face and its shadow caster. No per-frame vertex upload. */
export function printFold(material: Material, uniforms: FoldUniforms) {
  material.onBeforeCompile = shader => {
    Object.assign(shader.uniforms, uniforms);
    const declarations = `\nuniform float uFieldCurl;\nuniform float uFieldHinge;\nuniform float uFieldDirection;\n`;
    shader.vertexShader = declarations + shader.vertexShader;
    const angle = `float fieldDistance = max(0.0, (position.y - uFieldHinge) * uFieldDirection);\nfloat fieldAngle = fieldDistance * uFieldCurl;\n`;
    shader.vertexShader = shader.vertexShader.replace("#include <beginnormal_vertex>", `#include <beginnormal_vertex>\n${angle}\nobjectNormal.yz = mat2(cos(fieldAngle), uFieldDirection * sin(fieldAngle), -uFieldDirection * sin(fieldAngle), cos(fieldAngle)) * objectNormal.yz;`);
    shader.vertexShader = shader.vertexShader.replace("#include <begin_vertex>", `#include <begin_vertex>\nfloat foldDistance = max(0.0, (position.y - uFieldHinge) * uFieldDirection);\nfloat foldAngle = foldDistance * uFieldCurl;\nfloat safeCurl = max(0.00001, uFieldCurl);\ntransformed.y += uFieldDirection * (sin(foldAngle) / safeCurl - foldDistance);\ntransformed.z += (1.0 - cos(foldAngle)) / safeCurl;`);
  };
  material.customProgramCacheKey = () => "field-paper-fold-v1";
}

export const sectionProgress = (p: number, start: number, end: number) => {
  const t = Math.max(0,Math.min(1,(p-start)/(end-start)));
  return t*t*(3-2*t);
};
