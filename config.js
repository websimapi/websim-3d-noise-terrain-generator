// Configuration settings for the terrain generator
export const config = {
    // Terrain dimensions
    chunkSize: 16,       // Size of each chunk in blocks
    viewDistance: 3,     // How many chunks to render in each direction
    
    // Noise settings
    noiseScale: 0.05,    // Scale of the noise (lower = more stretched out terrain)
    amplitude: 25,       // Height multiplier for the terrain
    octaves: 3,          // Number of noise layers (more = more detail)
    persistence: 0.5,    // How much each octave contributes
    lacunarity: 2.0,     // How much detail is added at each octave
    
    // Rendering settings
    cameraHeight: 100,   // Starting camera height
    cameraDistance: 200, // Camera distance from center
    rotationSpeed: 0.3,  // Rotation speed for automatic camera movement
    
    // Colors
    grassColor: 0x3bba5d,
    stoneColor: 0x808080,
    snowColor: 0xffffff,
    waterColor: 0x1e90ff
};

