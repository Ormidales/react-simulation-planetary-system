// src/components/System.tsx
import React, { useMemo, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

import Planet, { PlanetData } from './Planet'; // Importe Planet et son interface
import Star from './Star'; // Importe le nouveau composant Star

// --- Fonctions Utilitaires pour la génération aléatoire ---
const randomFloat = (min: number, max: number): number => Math.random() * (max - min) + min;
const randomInt = (min: number, max: number): number => Math.floor(randomFloat(min, max + 1));
const randomColor = (): THREE.Color => new THREE.Color(Math.random(), Math.random(), Math.random());
// ---

// Composant Loader simple (peut être amélioré)
const Loader: React.FC = () => null; // Simple fallback pour Suspense

// Interface pour les données des étoiles
interface StarData {
    id: string;
    position: THREE.Vector3;
    size: number;
    color: THREE.Color;
}

const System: React.FC = () => {

  // Utilise useMemo pour générer les données aléatoires UNE SEULE FOIS par rendu initial
  const systemData = useMemo(() => {
    const planets: PlanetData[] = [];
    const stars: StarData[] = [];
    const numPlanets = randomInt(3, 8); // Entre 3 et 8 planètes
    const numStars = 1500; // Nombre d'étoiles de fond
    const minOrbit = 5;
    const maxOrbitStep = 12;
    const minOrbitStep = 4;

    let currentOrbitRadius = minOrbit;

    // Génération des planètes
    for (let i = 0; i < numPlanets; i++) {
      const size = randomFloat(0.4, 2.8);
      currentOrbitRadius += randomFloat(minOrbitStep + size, maxOrbitStep + size); // Espace les orbites
      const orbitSpeed = randomFloat(0.05, 0.5) / (currentOrbitRadius * 0.1); // Plus loin = plus lent (approximatif)
      const rotationSpeed = randomFloat(0.005, 0.05);
      const initialAngle = randomFloat(0, Math.PI * 2);
      const color = randomColor();
      const metalness = Math.random() > 0.6 ? randomFloat(0.5, 1.0) : randomFloat(0, 0.3); // Chance d'être métallique
      const roughness = randomFloat(0.2, 0.9); // Variété de rugosité

      planets.push({
        id: `planet-${i}`,
        color,
        size,
        orbitRadius: currentOrbitRadius,
        orbitSpeed,
        rotationSpeed,
        initialAngle,
        metalness,
        roughness,
      });
    }

    // Génération des étoiles de fond
    const starFieldRadius = 200; // Rayon de la sphère où les étoiles apparaissent
    for (let i = 0; i < numStars; i++) {
        // Position aléatoire sur une sphère virtuelle
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const x = starFieldRadius * Math.sin(phi) * Math.cos(theta);
        const y = starFieldRadius * Math.sin(phi) * Math.sin(theta);
        const z = starFieldRadius * Math.cos(phi);

        // Petite variation de couleur (plutôt blanches/bleutées/jaunâtres)
        const baseBrightness = 0.7;
        const colorVariation = 0.3;
        const r = baseBrightness + Math.random() * colorVariation;
        const g = baseBrightness + Math.random() * colorVariation;
        const b = baseBrightness + Math.random() * colorVariation;
        const color = new THREE.Color(r, g, b);

        stars.push({
          id: `star-${i}`,
          position: new THREE.Vector3(x, y, z),
          // Taille un peu plus variable :
          size: randomFloat(0.05, 0.35), // Anciennement 0.05 - 0.2
          color: color // La génération de couleur actuelle est déjà bien aléatoire
        });
    }

    // Génération du "Soleil" central (l'étoile du système)
    const sunSize = randomFloat(2.5, 4.5);
    const sunColor = new THREE.Color().setHSL(randomFloat(0.05, 0.15), 1.0, 0.6); // Jaune/Orange
    const sunIntensity = randomFloat(2.0, 3.5);


    return { planets, stars, sunSize, sunColor, sunIntensity };
  }, []); // Le tableau vide assure que useMemo ne s'exécute qu'au montage


  return (
    <Canvas camera={{ position: [0, 40, 70], fov: 50 }}> {/* Position caméra ajustée */}
      <ambientLight intensity={0.1} /> {/* Lumière ambiante très faible */}
      {/* Lumière principale émise par le "Soleil" central */}
      <pointLight
          position={[0, 0, 0]}
          intensity={systemData.sunIntensity}
          color={systemData.sunColor}
          decay={1} // Atténuation réaliste
          distance={300} // Portée de la lumière
        />


      <OrbitControls />

      {/* Le "Soleil" central (étoile principale) */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[systemData.sunSize, 32, 32]} />
        <meshBasicMaterial color={systemData.sunColor} /> {/* Auto-illuminé */}
      </mesh>

      {/* Envelopper les éléments générés dans Suspense (bonne pratique) */}
      <Suspense fallback={<Loader />}>
        {/* Instanciation des planètes générées */}
        {systemData.planets.map((planet) => (
          <Planet key={planet.id} {...planet} />
        ))}

        {/* Instanciation des étoiles de fond générées */}
        {systemData.stars.map((star) => (
          <Star key={star.id} {...star} />
        ))}
      </Suspense>
    </Canvas>
  );
};

export default System;