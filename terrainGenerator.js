import { createNoise3D } from 'simplex-noise';
import * as THREE from 'three';
import { config } from './config.js';

export class TerrainGenerator {
    constructor() {
        this.noise = createNoise3D();
        this.chunks = new Map(); // Store chunks using a map with string keys
        this.meshes = new Map(); // Store the corresponding meshes
    }
    
    regenerateNoise() {
        // Create a new noise function with a random seed
        this.noise = createNoise3D();
        // Clear existing chunks to force regeneration
        this.chunks.clear();
    }
    
    // Get noise value at a specific point
    getNoise(x, y, z) {
        let amplitude = config.amplitude;
        let frequency = config.noiseScale;
        let noiseHeight = 0;
        let normalizer = 0;
        
        for(let i = 0; i < config.octaves; i++) {
            const sampleX = x * frequency;
            const sampleY = y * frequency;
            const sampleZ = z * frequency;
            
            noiseHeight += this.noise(sampleX, sampleY, sampleZ) * amplitude;
            normalizer += amplitude;
            
            amplitude *= config.persistence;
            frequency *= config.lacunarity;
        }
        
        return noiseHeight / normalizer;
    }
    
    // Generate a terrain chunk at the specified coordinates
    generateChunk(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        
        // Return existing chunk if already generated
        if (this.chunks.has(chunkKey)) {
            return this.chunks.get(chunkKey);
        }
        
        const size = config.chunkSize;
        const chunkData = new Float32Array(size * size);
        
        // Generate height values for the chunk
        for (let z = 0; z < size; z++) {
            for (let x = 0; x < size; x++) {
                const worldX = x + chunkX * size;
                const worldZ = z + chunkZ * size;
                
                // Use 3D noise for terrain generation
                const height = this.getNoise(worldX, 0, worldZ);
                chunkData[x + z * size] = height;
            }
        }
        
        this.chunks.set(chunkKey, chunkData);
        return chunkData;
    }
    
    // Create a THREE.js mesh for a chunk
    createChunkMesh(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        const chunkData = this.generateChunk(chunkX, chunkZ);
        const size = config.chunkSize;
        
        // Create geometry
        const geometry = new THREE.PlaneGeometry(
            size, 
            size, 
            size - 1, 
            size - 1
        );
        
        // Rotate the plane to be horizontal
        geometry.rotateX(-Math.PI / 2);
        
        // Update vertices based on height data
        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length / 3; i++) {
            const x = i % size;
            const z = Math.floor(i / size);
            vertices[i * 3 + 1] = chunkData[x + z * size] * config.amplitude;
        }
        
        // Update normals for proper lighting
        geometry.computeVertexNormals();
        
        // Create the material
        const material = new THREE.MeshPhongMaterial({
            vertexColors: true,
            flatShading: true
        });
        
        // Add vertex colors based on height
        const colors = [];
        for (let i = 0; i < vertices.length / 3; i++) {
            const height = vertices[i * 3 + 1];
            
            // Determine color based on height
            let color = new THREE.Color();
            if (height > 15) {
                color.setHex(config.snowColor); // Snow at peaks
            } else if (height > 5) {
                color.setHex(config.stoneColor); // Stone at middle heights
            } else if (height > 0) {
                color.setHex(config.grassColor); // Grass at low heights
            } else {
                color.setHex(config.waterColor); // Water below sea level
            }
            
            colors.push(color.r, color.g, color.b);
        }
        
        // Add colors to geometry
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        // Create mesh and position it
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(
            chunkX * size - (config.viewDistance * size) / 2,
            0,
            chunkZ * size - (config.viewDistance * size) / 2
        );
        
        this.meshes.set(chunkKey, mesh);
        return mesh;
    }
    
    // Generate terrain chunks around a center position
    generateTerrain(scene) {
        // Clear existing terrain
        this.meshes.forEach(mesh => {
            scene.remove(mesh);
        });
        this.meshes.clear();
        
        // Generate new chunks
        const distance = config.viewDistance;
        for (let x = -distance; x <= distance; x++) {
            for (let z = -distance; z <= distance; z++) {
                const mesh = this.createChunkMesh(x, z);
                scene.add(mesh);
            }
        }
    }
    
    // Update terrain parameters and regenerate
    updateParameters(noiseScale, amplitude, octaves) {
        config.noiseScale = noiseScale;
        config.amplitude = amplitude;
        config.octaves = octaves;
    }
}

