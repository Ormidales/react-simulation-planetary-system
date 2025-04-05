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
      <sphereGeometry args={[size, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </mesh>
  );
};

export default Star;