import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generatePlanetTexture } from '../utils/generatePlanetTexture';

export interface PlanetData {
  id: string;
  seed: number;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  initialAngle: number;
  metalness: number;
  roughness: number;
  textureParams?: Partial<Parameters<typeof generatePlanetTexture>[0]>;
}

const Planet: React.FC<PlanetData> = ({
  seed,
  size,
  orbitRadius,
  orbitSpeed,
  rotationSpeed,
  initialAngle,
  metalness,
  roughness,
  textureParams
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  const { map, bumpMap } = useMemo(() => {
    console.log(`Generating textures for planet seed: ${seed}`);
    return generatePlanetTexture({
      seed: seed,
      ...(textureParams || {})
    });
  }, [seed, textureParams]);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const angle = initialAngle + time * orbitSpeed;
    const x = Math.cos(angle) * orbitRadius;
    const z = Math.sin(angle) * orbitRadius;
    meshRef.current.position.x = x;
    meshRef.current.position.z = z;
    meshRef.current.rotation.y += rotationSpeed;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 64, 64]} />
      <meshStandardMaterial
        map={map}
        bumpMap={bumpMap}
        bumpScale={0.015 * size}
        metalness={metalness}
        roughness={roughness}
      />
    </mesh>
  );
};

export default Planet;