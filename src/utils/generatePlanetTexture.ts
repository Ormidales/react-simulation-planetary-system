import * as THREE from 'three';
import { SimplexNoise } from 'simplex-noise';

interface TextureGenerationParams {
    seed: number;
    resolution?: number;
    scale?: number;
    octaves?: number;
    persistence?: number;
    lacunarity?: number;
    waterLevel?: number;
    sandLevel?: number;
    grassLevel?: number;
    deepWaterColor?: THREE.Color;
    shallowWaterColor?: THREE.Color;
    sandColor?: THREE.Color;
    grassColor?: THREE.Color;
    rockColor?: THREE.Color;
    snowColor?: THREE.Color;
}

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
        resolution = 512,
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
    const height = resolution / 2;

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
            const u = x / width;
            const v = y / height;

            let amplitude = 1.0;
            let frequency = 1.0;
            let noiseValue = 0;

            for (let i = 0; i < octaves; i++) {
                const nx = u * frequency * (width / scale);
                const ny = v * frequency * (height / scale);
                noiseValue += simplex.noise2D(nx, ny) * amplitude;

                amplitude *= persistence;
                frequency *= lacunarity;
            }

            const normalizedNoise = (noiseValue / (2 - Math.pow(2, 1 - octaves))) * 0.5 + 0.5;

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
                finalColor = finalColors.rockColor.clone().lerp(finalColors.snowColor, rockRatio * rockRatio);
            }

            mapCtx.fillStyle = `#${finalColor.getHexString()}`;
            mapCtx.fillRect(x, y, 1, 1);

            const bumpIntensity = Math.floor(normalizedNoise * 255);
            bumpCtx.fillStyle = `rgb(${bumpIntensity}, ${bumpIntensity}, ${bumpIntensity})`;
            bumpCtx.fillRect(x, y, 1, 1);
        }
    }

    const mapTexture = new THREE.CanvasTexture(mapCanvas);
    mapTexture.needsUpdate = true;

    const bumpMapTexture = new THREE.CanvasTexture(bumpCanvas);
    bumpMapTexture.needsUpdate = true;

    return { map: mapTexture, bumpMap: bumpMapTexture };
}