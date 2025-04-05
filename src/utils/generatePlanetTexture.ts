// src/utils/generatePlanetTexture.ts
import * as THREE from 'three';
// Importer la fonction factory createNoise2D
import { createNoise2D } from 'simplex-noise';
// Importer le générateur de nombres aléatoires seedé
import alea from 'alea';

// Interface pour les paramètres de génération de texture
interface TextureGenerationParams {
    seed: number; // Seed pour le générateur de nombres aléatoires (PRNG)
    resolution?: number; // Largeur de la texture (hauteur = largeur / 2)
    scale?: number; // Échelle du bruit (valeur plus petite = motifs plus grands)
    octaves?: number; // Nombre de couches de bruit pour les détails
    persistence?: number; // Influence des octaves supérieures (amplitude)
    lacunarity?: number; // Augmentation de la fréquence entre les octaves
    waterLevel?: number; // Seuil pour la profondeur de l'eau
    sandLevel?: number; // Seuil pour le sable/désert
    grassLevel?: number; // Seuil pour l'herbe/terre
    // Couleurs optionnelles personnalisées (format THREE.Color)
    deepWaterColor?: THREE.Color;
    shallowWaterColor?: THREE.Color;
    sandColor?: THREE.Color;
    grassColor?: THREE.Color;
    rockColor?: THREE.Color;
    snowColor?: THREE.Color;
}

// Palette de couleurs par défaut
const defaultColors = {
    deepWaterColor: new THREE.Color(0x00004d),    // Bleu foncé
    shallowWaterColor: new THREE.Color(0x001f7e), // Bleu plus clair
    sandColor: new THREE.Color(0xc2b280),         // Beige/Sable
    grassColor: new THREE.Color(0x228b22),        // Vert forêt
    rockColor: new THREE.Color(0x808080),         // Gris
    snowColor: new THREE.Color(0xffffff),         // Blanc
};

/**
 * Génère des textures procédurales de carte de couleur (map) et de relief (bumpMap)
 * pour une planète en utilisant le bruit Simplex.
 * @param params - Paramètres de génération de texture, y compris la seed.
 * @returns Un objet contenant map (THREE.CanvasTexture) et bumpMap (THREE.CanvasTexture).
 */
export function generatePlanetTexture(params: TextureGenerationParams): { map: THREE.CanvasTexture, bumpMap: THREE.CanvasTexture } {
    // Déstructuration des paramètres avec valeurs par défaut
    const {
        seed,
        resolution = 512, // Taille par défaut : 512x256
        scale = 50,       // Échelle du bruit par défaut
        octaves = 4,      // Nombre d'octaves par défaut
        persistence = 0.5,
        lacunarity = 2.0,
        waterLevel = 0.3,
        sandLevel = 0.4,
        grassLevel = 0.6,
        ...colors // Récupère les couleurs personnalisées fournies
    } = params;

    // Fusionne les couleurs par défaut avec les couleurs personnalisées
    const finalColors = { ...defaultColors, ...colors };

    // Dimensions standard pour une texture sphérique (ratio 2:1)
    const width = resolution;
    const height = resolution / 2;

    // 1. Créer un générateur de nombres pseudo-aléatoires (PRNG) basé sur la seed
    const prng = alea(seed);
    // 2. Créer la fonction de bruit 2D en utilisant le PRNG
    const noise2D = createNoise2D(prng);

    // Créer les éléments Canvas pour dessiner les textures
    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = width;
    mapCanvas.height = height;
    // Vérifier si le contexte est bien obtenu (bonne pratique)
    const mapCtx = mapCanvas.getContext('2d');
    if (!mapCtx) throw new Error('Impossible d\'obtenir le contexte 2D pour le canvas de la map.');

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = width;
    bumpCanvas.height = height;
    const bumpCtx = bumpCanvas.getContext('2d');
    if (!bumpCtx) throw new Error('Impossible d\'obtenir le contexte 2D pour le canvas de la bump map.');


    // Parcourir chaque pixel de la future texture
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Coordonnées UV normalisées (entre 0 et 1)
            const u = x / width;
            const v = y / height;

            // --- Génération de la valeur de bruit (Fractal Brownian Motion - fBm) ---
            let amplitude = 1.0; // Influence de l'octave actuelle
            let frequency = 1.0; // Échelle de l'octave actuelle
            let noiseValue = 0; // Valeur de bruit cumulée

            // Somme de plusieurs couches (octaves) de bruit
            for (let i = 0; i < octaves; i++) {
                // Calculer les coordonnées pour l'échantillonnage du bruit
                // Note : Ce mapping 2D simple introduira une distorsion aux pôles.
                // Une méthode plus avancée mapperait UV vers des coordonnées sphériques 3D et utiliserait noise3D.
                const nx = u * frequency * (width / scale);
                const ny = v * frequency * (height / scale);

                // Obtenir la valeur de bruit (-1 à 1) pour cette octave et l'ajouter
                noiseValue += noise2D(nx, ny) * amplitude;

                // Modifier amplitude et fréquence pour l'octave suivante
                amplitude *= persistence; // Réduit l'influence des détails fins
                frequency *= lacunarity; // Augmente la fréquence pour les détails fins
            }

            // --- Normalisation et Contrainte de la valeur de bruit ---
            // Normalisation approximative pour ramener la somme vers une plage ~[0, 1]
            // Dépend du nombre d'octaves, ajustement empirique peut être nécessaire.
            let normalizedNoise = noiseValue / (2 - Math.pow(2, 1 - octaves)); // Tentative de compensation de l'accumulation
            normalizedNoise = normalizedNoise * 0.5 + 0.5; // Remapper de ~[-1, 1] vers ~[0, 1]
            normalizedNoise = Math.max(0, Math.min(1, normalizedNoise)); // Assurer que la valeur reste entre 0 et 1

            // --- Détermination de la couleur basée sur la valeur de bruit (Simulation d'altitude) ---
            let finalColor: THREE.Color;
            if (normalizedNoise < waterLevel) {
                // Eau : Interpolation entre eau profonde et peu profonde
                const waterRatio = normalizedNoise / waterLevel;
                finalColor = finalColors.deepWaterColor.clone().lerp(finalColors.shallowWaterColor, waterRatio);
            } else if (normalizedNoise < sandLevel) {
                // Sable / Plage
                finalColor = finalColors.sandColor;
            } else if (normalizedNoise < grassLevel) {
                // Herbe / Terre
                finalColor = finalColors.grassColor;
            } else {
                // Roche / Neige : Interpolation entre roche et neige
                // Utilisation d'un ratio au carré pour une transition plus rapide vers la neige aux "sommets"
                const rockRatio = Math.min(1, (normalizedNoise - grassLevel) / (1 - grassLevel));
                finalColor = finalColors.rockColor.clone().lerp(finalColors.snowColor, rockRatio * rockRatio);
            }

            // Dessiner le pixel de couleur calculé sur le canvas de la map
            mapCtx.fillStyle = `#${finalColor.getHexString()}`;
            mapCtx.fillRect(x, y, 1, 1);

            // --- Génération du pixel de la Bump Map (Niveaux de gris basés sur le bruit) ---
            // Utiliser directement la valeur de bruit normalisée pour la hauteur (0=noir=bas, 1=blanc=haut)
            const bumpIntensity = Math.floor(normalizedNoise * 255); // Convertir 0-1 en 0-255
            bumpCtx.fillStyle = `rgb(${bumpIntensity}, ${bumpIntensity}, ${bumpIntensity})`;
            bumpCtx.fillRect(x, y, 1, 1);
        }
    }

    // --- Création des Textures Three.js à partir des Canvas ---
    const mapTexture = new THREE.CanvasTexture(mapCanvas);
    mapTexture.needsUpdate = true; // Indiquer à Three.js de charger les données du canvas
    mapTexture.colorSpace = THREE.SRGBColorSpace; // Très important pour un rendu correct des couleurs

    const bumpMapTexture = new THREE.CanvasTexture(bumpCanvas);
    bumpMapTexture.needsUpdate = true; // Indiquer à Three.js de charger les données du canvas
    // Les bump maps utilisent généralement l'espace couleur linéaire (le défaut convient souvent)

    // Retourner les textures générées
    return { map: mapTexture, bumpMap: bumpMapTexture };
}