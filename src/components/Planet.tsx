import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlanetProps {
  color: string;
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  initialAngle?: number;
}

const Planet: React.FC<PlanetProps> = ({
  color,
  size,
  orbitRadius,
  orbitSpeed,
  initialAngle = 0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const angle = initialAngle + time * orbitSpeed;

    const x = Math.cos(angle) * orbitRadius;
    const z = Math.sin(angle) * orbitRadius;

    meshRef.current.position.x = x;
    meshRef.current.position.z = z;

    meshRef.current.rotation.y += 0.005;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

export default Planet;