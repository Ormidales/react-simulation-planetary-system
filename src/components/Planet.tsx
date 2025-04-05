import React, { useRef, Suspense } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

interface PlanetProps {
  textureURL: string; // URL de la texture de couleur
  normalMapURL?: string; // URL optionnelle de la normal map
  // bumpMapURL?: string; // Optionnel: URL de la bump map
  // displacementMapURL?: string; // Optionnel: URL de la displacement map
  // displacementScale?: number; // Optionnel: Echelle pour la displacement map
  size: number; // Rayon de la planète
  orbitRadius: number; // Distance du centre (Soleil)
  orbitSpeed: number; // Vitesse de rotation autour du centre
  rotationSpeed: number; // Vitesse de rotation sur elle-même
  initialAngle?: number; // Position de départ sur l'orbite
}

const Planet: React.FC<PlanetProps> = ({
  textureURL,
  normalMapURL,
  // bumpMapURL,
  // displacementMapURL,
  // displacementScale = 0.05, // Valeur par défaut si displacement utilisé
  size,
  orbitRadius,
  orbitSpeed,
  rotationSpeed,
  initialAngle = 0,
}) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Prépare la liste des textures à charger
  const texturePaths = [textureURL];
  if (normalMapURL) texturePaths.push(normalMapURL);
  // if (bumpMapURL) texturePaths.push(bumpMapURL);
  // if (displacementMapURL) texturePaths.push(displacementMapURL);

  // Charge les textures en utilisant le hook useTexture (gère Suspense)
  const textures = useTexture(texturePaths);

  // Assigne les textures chargées aux variables correspondantes
  const map = textures[0] as THREE.Texture; // Texture de couleur
  const normalMap = normalMapURL ? textures[1] as THREE.Texture : undefined;
  // const bumpMap = bumpMapURL ? textures[texturePaths.indexOf(bumpMapURL)] as THREE.Texture : undefined;
  // const displacementMap = displacementMapURL ? textures[texturePaths.indexOf(displacementMapURL)] as THREE.Texture : undefined;

  // Optionnel : Appliquer des répétitions si la texture n'est pas parfaitement sphérique
  // map.wrapS = map.wrapT = THREE.RepeatWrapping;
  // map.repeat.set(1, 1); // Ajustez si nécessaire

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    const angle = initialAngle + time * orbitSpeed;

    // Calcul et màj position orbitale
    const x = Math.cos(angle) * orbitRadius;
    const z = Math.sin(angle) * orbitRadius;
    meshRef.current.position.x = x;
    meshRef.current.position.z = z;

    // Rotation de la planète sur elle-même
    meshRef.current.rotation.y += rotationSpeed;
  });

  // Augmenter les segments pour un meilleur rendu avec displacement/normal maps si nécessaire
  const segments = normalMapURL ? 64 : 32; // Plus de détails si normal map

  return (
    <mesh ref={meshRef}>
      {/* Augmentation des segments (3ème et 4ème args) pour un meilleur rendu des textures/reliefs */}
      <sphereGeometry args={[size, segments, segments]} />
      {/* Matériau standard qui réagit à la lumière et utilise les textures */}
      <meshStandardMaterial
        map={map} // Applique la texture de couleur
        normalMap={normalMap} // Applique la normal map pour le relief simulé
        // bumpMap={bumpMap} // Optionnel: Applique la bump map
        // bumpScale={0.05}   // Optionnel: Intensité de la bump map
        // displacementMap={displacementMap} // Optionnel: Applique la displacement map
        // displacementScale={displacementScale} // Optionnel: Intensité de la displacement map
        metalness={0.1} // Ajustez pour un aspect plus ou moins métallique
        roughness={0.7} // Ajustez pour une surface plus ou moins rugueuse/réfléchissante
      />
    </mesh>
  );
};

// Important : Envelopper l'exportation dans Suspense pour gérer le chargement asynchrone des textures
// Nous mettons un fallback simple (rien) car le Suspense principal sera dans System.tsx
const PlanetWithSuspense: React.FC<PlanetProps> = (props) => (
  <Suspense fallback={null}>
    <Planet {...props} />
  </Suspense>
);


export default PlanetWithSuspense;
// Note: On exporte PlanetWithSuspense qui inclut le Suspense nécessaire pour useTexture