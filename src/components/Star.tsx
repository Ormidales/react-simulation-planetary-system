// src/components/Star.tsx
import React, { useMemo } from 'react';
import * as THREE from 'three';

interface StarProps {
  position: THREE.Vector3;
  size: number;
  color: THREE.Color;
}

const Star: React.FC<StarProps> = ({ position, size, color }) => {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 8, 8]} /> {/* Géométrie simple */}
      <meshBasicMaterial color={color} transparent opacity={0.8} /> {/* Auto-illuminé */}
    </mesh>
  );
};

export default Star;