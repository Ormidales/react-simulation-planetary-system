// src/components/Planet.tsx
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface PlanetData { // Exportons l'interface pour l'utiliser dans System
    id: string; // Pour la key React
    color: THREE.Color;
    size: number;
    orbitRadius: number;
    orbitSpeed: number;
    rotationSpeed: number;
    initialAngle: number;
    metalness: number;
    roughness: number;
}


const Planet: React.FC<PlanetData> = ({
  color,
  size,
  orbitRadius,
  orbitSpeed,
  rotationSpeed,
  initialAngle,
  metalness,
  roughness
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const angle = initialAngle + time * orbitSpeed;

    // Position orbitale
    const x = Math.cos(angle) * orbitRadius;
    const z = Math.sin(angle) * orbitRadius;
    meshRef.current.position.x = x;
    meshRef.current.position.z = z;

    // Rotation sur elle-même
    meshRef.current.rotation.y += rotationSpeed;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 32, 32]} />
      {/* Matériau avec propriétés aléatoires */}
      <meshStandardMaterial
        color={color}
        metalness={metalness} // Apparence métallique (0 = diélectrique, 1 = métal)
        roughness={roughness} // Rugosité de la surface (0 = lisse/miroir, 1 = mat)
        // envMapIntensity={0.5} // Optionnel: ajoute un peu de réflexion de l'environnement
      />
    </mesh>
  );
};

export default Planet;