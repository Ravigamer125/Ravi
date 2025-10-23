/**
 * Cricket Pro Simulation - Advanced Renderer
 * Handles both WebGL and 2D canvas rendering with photorealistic graphics
 */

class Renderer {
    constructor(gl, canvas) {
        this.gl = gl;
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;
        
        // Rendering systems
        this.scene = new THREE.Scene();
        this.camera = null;
        this.renderer = null;
        this.composer = null;
        
        // Lighting
        this.ambientLight = null;
        this.directionalLight = null;
        this.spotLights = [];
        
        // Weather and atmosphere
        this.weatherSystem = null;
        this.atmosphere = null;
        
        // Post-processing effects
        this.bloomPass = null;
        this.ssaoPass = null;
        this.fxaaPass = null;
        
        // Quality settings
        this.quality = {
            particles: 1000,
            shadows: true,
            reflections: true,
            antialiasing: true,
            postProcessing: true
        };
        
        this.init();
    }
    
    init() {
        if (this.gl) {
            this.setupWebGLRenderer();
        } else {
            this.setup2DRenderer();
        }
        
        this.setupLighting();
        this.setupPostProcessing();
        this.setupWeatherSystem();
    }
    
    setupWebGLRenderer() {
        // Initialize Three.js renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: this.quality.antialiasing,
            alpha: true,
            powerPreference: "high-performance"
        });
        
        this.renderer.setSize(this.width, this.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = this.quality.shadows;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        // Setup camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.width / this.height,
            0.1,
            1000
        );
        this.camera.position.set(0, 10, 20);
        
        // Setup post-processing
        this.setupPostProcessing();
    }
    
    setup2DRenderer() {
        // 2D canvas fallback
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
    }
    
    setupLighting() {
        // Ambient light for overall illumination
        this.ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(this.ambientLight);
        
        // Main directional light (sun)
        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        this.directionalLight.position.set(50, 100, 50);
        this.directionalLight.castShadow = this.quality.shadows;
        
        if (this.quality.shadows) {
            this.directionalLight.shadow.mapSize.width = 2048;
            this.directionalLight.shadow.mapSize.height = 2048;
            this.directionalLight.shadow.camera.near = 0.5;
            this.directionalLight.shadow.camera.far = 500;
            this.directionalLight.shadow.camera.left = -100;
            this.directionalLight.shadow.camera.right = 100;
            this.directionalLight.shadow.camera.top = 100;
            this.directionalLight.shadow.camera.bottom = -100;
        }
        
        this.scene.add(this.directionalLight);
        
        // Stadium floodlights
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const spotLight = new THREE.SpotLight(0xffffff, 0.8, 100, Math.PI / 6, 0.3);
            spotLight.position.set(
                Math.cos(angle) * 80,
                30,
                Math.sin(angle) * 80
            );
            spotLight.target.position.set(0, 0, 0);
            spotLight.castShadow = this.quality.shadows;
            this.scene.add(spotLight);
            this.scene.add(spotLight.target);
            this.spotLights.push(spotLight);
        }
    }
    
    setupPostProcessing() {
        if (!this.renderer) return;
        
        // Post-processing composer
        this.composer = new THREE.EffectComposer(this.renderer);
        
        // Render pass
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // SSAO for ambient occlusion
        if (this.quality.postProcessing) {
            this.ssaoPass = new THREE.SSAOPass(this.scene, this.camera, this.width, this.height);
            this.ssaoPass.kernelRadius = 16;
            this.ssaoPass.minDistance = 0.005;
            this.ssaoPass.maxDistance = 0.1;
            this.composer.addPass(this.ssaoPass);
        }
        
        // Bloom effect for bright areas
        this.bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(this.width, this.height),
            1.5, // strength
            0.4, // radius
            0.85 // threshold
        );
        this.composer.addPass(this.bloomPass);
        
        // FXAA for anti-aliasing
        this.fxaaPass = new THREE.ShaderPass(THREE.FXAAShader);
        this.fxaaPass.material.uniforms['resolution'].value.set(1 / this.width, 1 / this.height);
        this.composer.addPass(this.fxaaPass);
        
        // Final output
        this.composer.addPass(new THREE.ShaderPass(THREE.CopyShader));
    }
    
    setupWeatherSystem() {
        this.weatherSystem = {
            type: 'sunny', // sunny, cloudy, rainy, foggy
            intensity: 1.0,
            windSpeed: 0.0,
            temperature: 25.0,
            humidity: 0.5
        };
        
        this.updateWeatherEffects();
    }
    
    updateWeatherEffects() {
        const { type, intensity, windSpeed } = this.weatherSystem;
        
        // Update lighting based on weather
        switch (type) {
            case 'sunny':
                this.directionalLight.intensity = 1.0;
                this.ambientLight.intensity = 0.4;
                break;
            case 'cloudy':
                this.directionalLight.intensity = 0.6;
                this.ambientLight.intensity = 0.6;
                break;
            case 'rainy':
                this.directionalLight.intensity = 0.3;
                this.ambientLight.intensity = 0.5;
                this.addRainEffect();
                break;
            case 'foggy':
                this.directionalLight.intensity = 0.4;
                this.ambientLight.intensity = 0.7;
                this.addFogEffect();
                break;
        }
        
        // Update wind effects on particles
        this.updateWindEffects(windSpeed);
    }
    
    addRainEffect() {
        // Create rain particle system
        const rainGeometry = new THREE.BufferGeometry();
        const rainCount = this.quality.particles * 2;
        const positions = new Float32Array(rainCount * 3);
        
        for (let i = 0; i < rainCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200;
            positions[i * 3 + 1] = Math.random() * 100 + 50;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 200;
        }
        
        rainGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const rainMaterial = new THREE.PointsMaterial({
            color: 0x87CEEB,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });
        
        const rain = new THREE.Points(rainGeometry, rainMaterial);
        this.scene.add(rain);
    }
    
    addFogEffect() {
        this.scene.fog = new THREE.Fog(0xcccccc, 10, 200);
    }
    
    updateWindEffects(windSpeed) {
        // Update particle systems with wind
        this.scene.children.forEach(child => {
            if (child.userData.windAffected) {
                child.userData.windOffset += windSpeed * 0.01;
            }
        });
    }
    
    render() {
        if (this.gl && this.composer) {
            // WebGL rendering with post-processing
            this.composer.render();
        } else if (this.ctx) {
            // 2D canvas rendering
            this.render2D(this.ctx);
        }
    }
    
    render2D(ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw sky gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw cricket ground
        this.drawCricketGround(ctx);
        
        // Draw players
        this.drawPlayers(ctx);
        
        // Draw ball
        this.drawBall(ctx);
        
        // Draw UI elements
        this.drawUI(ctx);
    }
    
    drawCricketGround(ctx) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Draw pitch
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(centerX - 10, centerY - 100, 20, 200);
        
        // Draw creases
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        
        // Batting crease
        ctx.beginPath();
        ctx.moveTo(centerX - 10, centerY - 100);
        ctx.lineTo(centerX + 10, centerY - 100);
        ctx.stroke();
        
        // Bowling crease
        ctx.beginPath();
        ctx.moveTo(centerX - 10, centerY + 100);
        ctx.lineTo(centerX + 10, centerY + 100);
        ctx.stroke();
        
        // Draw stumps
        ctx.fillStyle = '#8B4513';
        for (let i = -1; i <= 1; i++) {
            ctx.fillRect(centerX + i * 3 - 1, centerY - 100, 2, 20);
        }
        
        // Draw field boundary
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    drawPlayers(ctx) {
        // This would be replaced with actual player rendering
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Batsman
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(centerX, centerY - 80, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Bowler
        ctx.fillStyle = '#0000FF';
        ctx.beginPath();
        ctx.arc(centerX, centerY + 80, 8, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawBall(ctx) {
        // This would be replaced with actual ball rendering
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawUI(ctx) {
        // Draw crosshair for aiming
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        
        // Horizontal line
        ctx.beginPath();
        ctx.moveTo(centerX - 20, centerY);
        ctx.lineTo(centerX + 20, centerY);
        ctx.stroke();
        
        // Vertical line
        ctx.beginPath();
        ctx.moveTo(centerX, centerY - 20);
        ctx.lineTo(centerX, centerY + 20);
        ctx.stroke();
    }
    
    resize(width, height) {
        this.width = width;
        this.height = height;
        
        if (this.camera) {
            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
        }
        
        if (this.renderer) {
            this.renderer.setSize(width, height);
        }
        
        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }
    
    updateQuality(settings) {
        this.quality = { ...this.quality, ...settings };
        
        if (this.renderer) {
            this.renderer.shadowMap.enabled = this.quality.shadows;
        }
        
        this.updateWeatherEffects();
    }
    
    setWeather(type, intensity = 1.0) {
        this.weatherSystem.type = type;
        this.weatherSystem.intensity = intensity;
        this.updateWeatherEffects();
    }
    
    addObject(object) {
        if (this.scene) {
            this.scene.add(object);
        }
    }
    
    removeObject(object) {
        if (this.scene) {
            this.scene.remove(object);
        }
    }
    
    getCamera() {
        return this.camera;
    }
    
    getScene() {
        return this.scene;
    }
}