// src/components/Planet.tsx
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { generatePlanetTexture } from '../utils/generatePlanetTexture'; // Importer le générateur

export interface PlanetData {
  id: string;
  seed: number; // Ajout d'une seed pour la génération procédurale
  size: number;
  orbitRadius: number;
  orbitSpeed: number;
  rotationSpeed: number;
  initialAngle: number;
  metalness: number; // On garde pour varier l'aspect global
  roughness: number; // Idem
  // Optionnel : on pourrait aussi randomiser les params de texture ici
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
  textureParams // paramètres optionnels pour la génération
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Générer les textures en utilisant useMemo pour ne le faire qu'une fois par seed
  const { map, bumpMap } = useMemo(() => {
    console.log(`Generating textures for planet seed: ${seed}`); // Pour vérifier la génération
    return generatePlanetTexture({
      seed: seed,
      ...(textureParams || {}) // Applique les paramètres spécifiques si fournis
    });
  }, [seed, textureParams]); // Re-génère si la seed ou les params changent

  useFrame((state) => {
    // ... (logique de mouvement inchangée)
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
      <sphereGeometry args={[size, 64, 64]} /> {/* Augmenter un peu les segments pour la bump map */}
      <meshStandardMaterial
        map={map}               // Texture de couleur procédurale
        bumpMap={bumpMap}       // Texture de relief procédurale
        bumpScale={0.015 * size} // Échelle du relief (ajuster si besoin), dépendant de la taille
        metalness={metalness}   // Gardé pour la variation globale
        roughness={roughness}   // Gardé pour la variation globale
      // displacementMap={bumpMap} // On *pourrait* utiliser la même texture pour déplacer la géométrie
      // displacementScale={0.1 * size} // Mais bumpMap est moins coûteux
      />
    </mesh>
  );
};

export default Planet;