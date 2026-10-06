"use client";
import { useEffect, useMemo } from "react";
import { ExtrudeGeometry, Shape, Path } from "three";

export function RevealInstrument({
  color = "#214bc9",
  opening = 0,
}: {
  color?: string;
  opening?: number;
}) {
  const geometries = useMemo(() => {
    const body = new Shape();
    body.moveTo(-1.15, -0.48);
    body.bezierCurveTo(-1.4, 0.18, -0.78, 1.05, -0.2, 0.9);
    body.lineTo(0.75, 0.48);
    body.quadraticCurveTo(1, 0.22, 0.69, -0.05);
    body.lineTo(0.04, -0.82);
    body.quadraticCurveTo(-0.8, -1.02, -1.15, -0.48);
    const aperture = new Path();
    aperture.absellipse(-0.1, 0.04, 0.46, 0.36, 0, Math.PI * 2, true, -0.35);
    body.holes.push(aperture);
    const blade = new Shape();
    blade.moveTo(-0.2, -0.65);
    blade.quadraticCurveTo(0.65, -0.82, 1.25, -0.08);
    blade.lineTo(0.84, 0.61);
    blade.quadraticCurveTo(0.26, 0.25, -0.2, -0.65);
    return [
      new ExtrudeGeometry(body, {
        depth: 0.19,
        bevelEnabled: true,
        bevelSize: 0.04,
        bevelThickness: 0.04,
        bevelSegments: 3,
        curveSegments: 24,
      }),
      new ExtrudeGeometry(blade, {
        depth: 0.13,
        bevelEnabled: true,
        bevelSize: 0.035,
        bevelThickness: 0.035,
        bevelSegments: 3,
        curveSegments: 20,
      }),
    ];
  }, []);
  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);
  return (
    <group rotation={[0.12, -0.16, -0.1]}>
      <mesh geometry={geometries[0]} castShadow receiveShadow>
        <meshStandardMaterial
          color="#ece6db"
          roughness={0.57}
          metalness={0.025}
        />
      </mesh>
      <group
        name="key-wing"
        position={[0.47, -0.25, 0.12]}
        rotation={[0, opening * 0.25, -0.22 - opening * 0.42]}
      >
        <mesh
          name="key-enamel"
          geometry={geometries[1]}
          position={[-0.47, 0.25, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            color={color}
            roughness={0.39}
            metalness={0.08}
          />
        </mesh>
        <mesh position={[0, 0, 0.2]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.085, 0.085, 0.09, 24]} />
          <meshStandardMaterial
            color="#b2afa6"
            metalness={0.7}
            roughness={0.38}
          />
        </mesh>
      </group>
      <mesh position={[-0.96, -0.47, -0.09]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.17, 0.42, 0.13]} />
        <meshStandardMaterial color="#25231f" roughness={0.94} />
      </mesh>
      <mesh position={[-0.36, 0.72, 0.23]} rotation={[Math.PI / 2, 0, -0.3]}>
        <torusGeometry args={[0.1, 0.016, 8, 28]} />
        <meshStandardMaterial
          color="#a09a8e"
          metalness={0.55}
          roughness={0.45}
        />
      </mesh>
    </group>
  );
}
