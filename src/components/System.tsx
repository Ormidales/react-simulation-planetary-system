import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Planet from './Planet';

const System: React.FC = () => {
  return (
    <Canvas camera={{ position: [0, 20, 35], fov: 60 }}>
      <ambientLight intensity={0.3} />
      <pointLight position={[0, 0, 0]} intensity={1.5} color="yellow" />
      <OrbitControls />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[2.5, 32, 32]} />
        <meshBasicMaterial color="yellow" />
      </mesh>
      <Planet
        color="sienna"
        size={0.5}
        orbitRadius={5}
        orbitSpeed={0.8}
      />
      <Planet
        color="orange"
        size={0.8}
        orbitRadius={8}
        orbitSpeed={0.5}
        initialAngle={Math.PI / 2}
      />
      <Planet
        color="dodgerblue"
        size={1}
        orbitRadius={12}
        orbitSpeed={0.3}
        initialAngle={Math.PI}
      />
       <Planet
        color="red"
        size={0.7}
        orbitRadius={16}
        orbitSpeed={0.2}
        initialAngle={3 * Math.PI / 2}
      />
    </Canvas>
  );
};

export default System;