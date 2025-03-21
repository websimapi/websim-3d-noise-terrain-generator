import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TerrainGenerator } from './terrainGenerator.js';
import { config } from './config.js';

class TerrainApp {
    constructor() {
        this.setupRenderer();
        this.setupScene();
        this.setupLights();
        this.setupControls();
        this.setupEventListeners();
        
        // Create terrain generator
        this.terrainGenerator = new TerrainGenerator();
        this.generateTerrain();
        
        // Start animation loop
        this.animate();
    }
    
    setupRenderer() {
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('terrainCanvas'),
            antialias: true
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Handle window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }
    
    setupScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue
        this.scene.fog = new THREE.FogExp2(0x87ceeb, 0.002);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        this.camera.position.y = config.cameraHeight;
        this.camera.position.z = config.cameraDistance;
        this.camera.lookAt(0, 0, 0);
    }
    
    setupLights() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        
        // Add directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 0.8, 0.5);
        this.scene.add(directionalLight);
    }
    
    setupControls() {
        // Add orbit controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 500;
        this.controls.maxPolarAngle = Math.PI / 2;
    }
    
    setupEventListeners() {
        // Setup UI controls
        document.getElementById('generate').addEventListener('click', () => {
            this.terrainGenerator.regenerateNoise();
            this.generateTerrain();
        });
        
        document.getElementById('scaleSlider').addEventListener('input', (e) => {
            this.updateTerrainParameters();
        });
        
        document.getElementById('amplitudeSlider').addEventListener('input', (e) => {
            this.updateTerrainParameters();
        });
        
        document.getElementById('octavesSlider').addEventListener('input', (e) => {
            this.updateTerrainParameters();
        });
    }
    
    updateTerrainParameters() {
        const scale = parseFloat(document.getElementById('scaleSlider').value);
        const amplitude = parseFloat(document.getElementById('amplitudeSlider').value);
        const octaves = parseInt(document.getElementById('octavesSlider').value);
        
        this.terrainGenerator.updateParameters(scale, amplitude, octaves);
        this.generateTerrain();
    }
    
    generateTerrain() {
        // Clear existing terrain meshes from the scene
        this.scene.children = this.scene.children.filter(child => {
            if (child.isTerrainChunk) {
                return false; // Remove terrain chunks
            }
            return true; // Keep other objects (lights, etc.)
        });
        
        this.terrainGenerator.generateTerrain(this.scene);
    }
    
    animate() {
        requestAnimationFrame(this.animate.bind(this));
        
        // Update controls
        this.controls.update();
        
        // Render the scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new TerrainApp();
});