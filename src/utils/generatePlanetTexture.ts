// src/utils/generatePlanetTexture.ts
import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';

interface TextureGenerationParams {
    seed: number;
    resolution?: number; // Largeur de la texture (hauteur = largeur / 2)
    scale?: number; // Échelle du bruit (plus petit = plus gros motifs)
    octaves?: number; // Nombre de couches de bruit pour plus de détails
    persistence?: number; // Influence des octaves supérieures
    lacunarity?: number; // Changement d'échelle entre octaves
    waterLevel?: number; // Seuil pour l'eau
    sandLevel?: number; // Seuil pour le sable/désert
    grassLevel?: number; // Seuil pour la terre/herbe
    // Couleurs (exprimées comme THREE.Color pour faciliter)
    deepWaterColor?: THREE.Color;
    shallowWaterColor?: THREE.Color;
    sandColor?: THREE.Color;
    grassColor?: THREE.Color;
    rockColor?: THREE.Color;
    snowColor?: THREE.Color;
}

// Palette de couleurs par défaut
const defaultColors = {
    deepWaterColor: new THREE.Color(0x00004d),
    shallowWaterColor: new THREE.Color(0x001f7e),
    sandColor: new THREE.Color(0xc2b280),
    grassColor: new THREE.Color(0x228b22),
    rockColor: new THREE.Color(0x808080),
    snowColor: new THREE.Color(0xffffff),
};

export function generatePlanetTexture(params: TextureGenerationParams): { map: THREE.CanvasTexture, bumpMap: THREE.CanvasTexture } {
    const {
        seed,
        resolution = 512, // Texture 512x256
        scale = 50,
        octaves = 4,
        persistence = 0.5,
        lacunarity = 2.0,
        waterLevel = 0.3,
        sandLevel = 0.4,
        grassLevel = 0.6,
        ...colors
    } = params;

    const finalColors = { ...defaultColors, ...colors };

    const width = resolution;
    const height = resolution / 2; // Ratio standard pour textures sphériques

    const simplex = new SimplexNoise(seed);

    const mapCanvas = document.createElement('canvas');
    mapCanvas.width = width;
    mapCanvas.height = height;
    const mapCtx = mapCanvas.getContext('2d')!;

    const bumpCanvas = document.createElement('canvas');
    bumpCanvas.width = width;
    bumpCanvas.height = height;
    const bumpCtx = bumpCanvas.getContext('2d')!;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            // Coordonnées UV normalisées (0 à 1)
            const u = x / width;
            const v = y / height;

            // --- Génération du bruit Fractal Brownian Motion (fBm) ---
            let amplitude = 1.0;
            let frequency = 1.0;
            let noiseValue = 0;

            for (let i = 0; i < octaves; i++) {
                // Conversion UV -> Coordonnées sphériques (approximation pour bruit 2D)
                // Une meilleure approche utiliserait noise3D sur des coordonnées sphériques réelles
                const nx = u * frequency * (width / scale);
                const ny = v * frequency * (height / scale);
                // Ajouter le bruit 2D (valeurs entre -1 et 1)
                noiseValue += simplex.noise2D(nx, ny) * amplitude;

                amplitude *= persistence; // Réduit l'influence des octaves suivantes
                frequency *= lacunarity; // Augmente la fréquence pour les détails
            }

            // Normaliser la valeur de bruit entre 0 et 1 (approx)
            const normalizedNoise = (noiseValue / (2 - Math.pow(2, 1 - octaves))) * 0.5 + 0.5; // Ajustement empirique


            // --- Assignation des Couleurs basée sur le bruit (altitude simulée) ---
            let finalColor: THREE.Color;
            if (normalizedNoise < waterLevel) {
                const waterRatio = normalizedNoise / waterLevel;
                finalColor = finalColors.deepWaterColor.clone().lerp(finalColors.shallowWaterColor, waterRatio);
            } else if (normalizedNoise < sandLevel) {
                finalColor = finalColors.sandColor;
            } else if (normalizedNoise < grassLevel) {
                finalColor = finalColors.grassColor;
            } else {
                const rockRatio = Math.min(1, (normalizedNoise - grassLevel) / (1 - grassLevel));
                finalColor = finalColors.rockColor.clone().lerp(finalColors.snowColor, rockRatio * rockRatio); // Plus de neige aux 'sommets'
            }

            // Dessiner le pixel sur le canvas de la texture de couleur
            mapCtx.fillStyle = `#${finalColor.getHexString()}`;
            mapCtx.fillRect(x, y, 1, 1);

            // --- Génération de la Bump Map ---
            // Utiliser directement la valeur de bruit normalisée comme intensité de gris
            // Les zones "hautes" (proche de 1) seront claires, les zones "basses" sombres
            const bumpIntensity = Math.floor(normalizedNoise * 255);
            bumpCtx.fillStyle = `rgb(${bumpIntensity}, ${bumpIntensity}, ${bumpIntensity})`;
            bumpCtx.fillRect(x, y, 1, 1);
        }
    }

    // Créer les textures Three.js à partir des canvas
    const mapTexture = new THREE.CanvasTexture(mapCanvas);
    mapTexture.needsUpdate = true; // Important!

    const bumpMapTexture = new THREE.CanvasTexture(bumpCanvas);
    bumpMapTexture.needsUpdate = true; // Important!

    return { map: mapTexture, bumpMap: bumpMapTexture };
}