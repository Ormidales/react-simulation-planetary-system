import React, { Suspense } from 'react'; // Importer Suspense
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei'; // Ajout de Stars
import Planet from './Planet'; // S'assure d'importer PlanetWithSuspense maintenant
import * as THREE from 'three';

// Composant pour le fallback pendant le chargement
const Loader: React.FC = () => {
  return (
    <mesh visible={false}> {/* Peut être un spinner ou un simple message */}
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial wireframe color="white" />
    </mesh>
  );
}

const System: React.FC = () => {
  // URLs des textures (à placer dans public/textures/) - EXEMPLES
  // Remplacez par les chemins vers VOS fichiers textures
  const textureBaseUrl = '/textures/'; // Base URL pour les textures dans le dossier public

  const sunTextureUrl = textureBaseUrl + '2k_sun.jpg';
  const mercuryTextureUrl = textureBaseUrl + '2k_mercury.jpg';
  const venusTextureUrl = textureBaseUrl + '2k_venus_surface.jpg';
  const earthTextureUrl = textureBaseUrl + '2k_earth_daymap.jpg';
  const earthNormalUrl = textureBaseUrl + '2k_earth_normal_map.png'; // Exemple de Normal Map
  const marsTextureUrl = textureBaseUrl + '2k_mars.jpg';
  const jupiterTextureUrl = textureBaseUrl + '2k_jupiter.jpg';
  // ... ajoutez les autres planètes (Saturne, etc.)

  return (
    <Canvas camera={{ position: [0, 30, 60], fov: 50 }}> {/* Ajustement caméra */}
      {/* Éclairage */}
      <ambientLight intensity={0.2} />
      {/* La source de lumière principale vient du soleil */}
      <pointLight position={[0, 0, 0]} intensity={2.5} color="white" />

      {/* Contrôles */}
      <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />

      {/* Étoiles en fond (de @react-three/drei) */}
      <Stars radius={200} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

      {/* Suspense est nécessaire car useTexture charge les textures de manière asynchrone */}
      <Suspense fallback={<Loader />}> {/* Affiche le Loader pendant le chargement */}
        {/* Le Soleil (avec une texture auto-illuminée) */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[3.5, 64, 64]} />
          {/* Utilisation de useLoader pour la texture du soleil car pas besoin de Suspense ici */}
          <meshBasicMaterial map={useLoader(THREE.TextureLoader, sunTextureUrl)} />
        </mesh>

        {/* Instanciation des planètes avec textures */}
        <Planet
          textureURL={mercuryTextureUrl}
          size={0.6}
          orbitRadius={7}
          orbitSpeed={0.9}
          rotationSpeed={0.01}
        />
        <Planet
          textureURL={venusTextureUrl}
          size={0.9}
          orbitRadius={11}
          orbitSpeed={0.6}
          rotationSpeed={0.005}
          initialAngle={Math.PI / 2}
        />
        <Planet
          textureURL={earthTextureUrl}
          normalMapURL={earthNormalUrl} // Ajout de la normal map
          size={1}
          orbitRadius={16}
          orbitSpeed={0.4}
          rotationSpeed={0.02}
          initialAngle={Math.PI}
        />
        <Planet
          textureURL={marsTextureUrl}
          // Ajoutez une normal map pour Mars si vous en avez une
          size={0.8}
          orbitRadius={22}
          orbitSpeed={0.3}
          rotationSpeed={0.018}
          initialAngle={3 * Math.PI / 2}
        />
        <Planet
          textureURL={jupiterTextureUrl}
          size={2.5} // Jupiter est bien plus grande
          orbitRadius={35}
          orbitSpeed={0.15}
          rotationSpeed={0.04} // Rotation rapide
        />
        {/* Ajoutez Saturne (avec anneaux !), Uranus, Neptune... */}

      </Suspense>
    </Canvas>
  );
};

export default System;