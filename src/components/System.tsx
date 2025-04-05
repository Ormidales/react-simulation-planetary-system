import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import Planet, { PlanetData } from './Planet';
import Star from './Star';

const randomFloat = (min: number, max: number): number => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number): number => Math.floor(randomFloat(min, max + 1));

const Loader: React.FC = () => null;

interface StarData {
    id: string;
    position: THREE.Vector3;
    size: number;
    color: THREE.Color;
}

const System: React.FC = () => {
  const systemData = useMemo(() => {
    const planets: PlanetData[] = [];
    const stars: StarData[] = [];
    const numPlanets = randomInt(3, 8);
    const numStars = 1500;
    const minOrbit = 6;
    const maxOrbitStep = 15;
    const minOrbitStep = 5;

    let currentOrbitRadius = minOrbit;

    for (let i = 0; i < numPlanets; i++) {
      const size = randomFloat(0.5, 3.0);
      currentOrbitRadius += randomFloat(minOrbitStep + size, maxOrbitStep + size);
      const orbitSpeed = randomFloat(0.04, 0.4) / (currentOrbitRadius * 0.1);
      const rotationSpeed = randomFloat(0.005, 0.05);
      const initialAngle = randomFloat(0, Math.PI * 2);
      const metalness = Math.random() > 0.7 ? randomFloat(0.6, 1.0) : randomFloat(0, 0.2);
      const roughness = randomFloat(0.3, 0.9);
      const seed = randomInt(1, 1000000);

      const textureParams = {
           scale: randomFloat(20, 80),
           octaves: randomInt(3, 6),
           waterLevel: randomFloat(0.2, 0.5),
      };

      planets.push({
          id: `planet-${i}-${seed}`,
          seed,
          size,
          orbitRadius: currentOrbitRadius,
          orbitSpeed,
          rotationSpeed,
          initialAngle,
          metalness,
          roughness,
          textureParams
      });
    }

    const starFieldRadius = 250;
    for (let i = 0; i < numStars; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const x = starFieldRadius * Math.sin(phi) * Math.cos(theta);
      const y = starFieldRadius * Math.sin(phi) * Math.sin(theta);
      const z = starFieldRadius * Math.cos(phi);

      const baseBrightness = 0.7;
      const colorVariation = 0.3;
      const r = baseBrightness + Math.random() * colorVariation;
      const g = baseBrightness + Math.random() * colorVariation;
      const b = baseBrightness + Math.random() * colorVariation;
      const color = new THREE.Color(r, g, b);

      stars.push({
        id: `star-${i}`,
        position: new THREE.Vector3(x, y, z),
        size: randomFloat(0.05, 0.35),
        color: color
      });
    }

    const sunSize = randomFloat(2.5, 4.5);
    const sunColor = new THREE.Color().setHSL(randomFloat(0.05, 0.15), 1.0, 0.6);
    const sunIntensity = randomFloat(10, 11.5);

    return { planets, stars, sunSize, sunColor, sunIntensity };
  }, []);

  return (
    <Canvas camera={{ position: [0, 40, 80], fov: 50 }}>
      <ambientLight intensity={0.1} />
      <pointLight
        position={[0, 0, 0]}
        intensity={systemData.sunIntensity}
        color={systemData.sunColor}
        decay={1}
        distance={400}
        />
      <OrbitControls />

      <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[systemData.sunSize, 32, 32]} />
          <meshBasicMaterial color={systemData.sunColor} />
      </mesh>

      <Suspense fallback={<Loader />}>
        {systemData.planets.map((planet) => (
            <Planet key={planet.id} {...planet} />
        ))}
        {systemData.stars.map((star) => (
            <Star key={star.id} {...star} />
        ))}
      </Suspense>
    </Canvas>
  );
};

export default System;