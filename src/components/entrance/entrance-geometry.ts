import { BufferGeometry, Float32BufferAttribute, Shape } from "three";
import type { EntranceComposition } from "./entrance-manifest";
import type { Point } from "./entrance-break";

/** One shared screen-to-world outline, preserving authored fracture corners. */
export function surfaceOutline(points: Point[], composition: EntranceComposition) {
  const shape=new Shape();
  points.forEach(([x,y],index)=>{
    const px=(x-composition.width/2)/100, py=(composition.height/2-y)/100;
    if (!index) shape.moveTo(px,py); else shape.lineTo(px,py);
  });
  shape.closePath();
  return shape;
}

/** Continuous recessed walls with setback, rather than stacked cobalt polygons. */
export function cavityWall(points: Point[], composition: EntranceComposition) {
  const positions:number[]=[], colors:number[]=[];
  for (let index=0;index<points.length;index++) {
    const next=(index+1)%points.length;
    const front=(i:number):number[] => [(points[i][0]-composition.width/2)/100,(composition.height/2-points[i][1])/100,.065];
    const back=(i:number):number[] => [(points[i][0]-composition.width/2+11)/100,(composition.height/2-points[i][1]-13)/100,-2.65];
    for (const vertex of [front(index),back(index),front(next),front(next),back(index),back(next)]) {
      positions.push(...vertex);
      colors.push(...(vertex[2]>0 ? [.048,.075,.16] : [.008,.013,.034]));
    }
  }
  const geometry=new BufferGeometry();
  geometry.setAttribute("position",new Float32BufferAttribute(positions,3));
  geometry.setAttribute("color",new Float32BufferAttribute(colors,3));
  geometry.computeVertexNormals();
  return geometry;
}
