/**
 * Cricket Pro Simulation - Core Game Engine
 * Handles game state, rendering loop, and core systems
 */

class GameEngine {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.gl = null;
        this.renderer = null;
        this.physics = null;
        this.audio = null;
        
        this.gameState = 'loading';
        this.currentScreen = 'loading';
        this.lastTime = 0;
        this.deltaTime = 0;
        this.fps = 60;
        this.frameCount = 0;
        
        this.isRunning = false;
        this.isPaused = false;
        
        // Game systems
        this.cricketGame = null;
        this.match = null;
        this.careerMode = null;
        
        // Performance monitoring
        this.performanceStats = {
            fps: 0,
            frameTime: 0,
            memoryUsage: 0
        };
        
        this.init();
    }
    
    async init() {
        try {
            this.setupCanvas();
            this.setupWebGL();
            this.initializeSystems();
            await this.loadAssets();
            this.setupEventListeners();
            this.startGameLoop();
        } catch (error) {
            console.error('Failed to initialize game engine:', error);
            this.showError('Failed to initialize game engine');
        }
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('game-canvas');
        if (!this.canvas) {
            throw new Error('Game canvas not found');
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    setupWebGL() {
        this.gl = this.canvas.getContext('webgl2') || this.canvas.getContext('webgl');
        if (!this.gl) {
            console.warn('WebGL not supported, falling back to 2D canvas');
            return;
        }
        
        // Enable depth testing and other WebGL features
        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.BLEND);
        this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
        
        // Set clear color
        this.gl.clearColor(0.53, 0.81, 0.92, 1.0); // Sky blue
    }
    
    initializeSystems() {
        this.renderer = new Renderer(this.gl, this.canvas);
        this.physics = new Physics();
        this.audio = new Audio();
        
        // Initialize game components
        this.cricketGame = new CricketGame(this);
        this.match = new Match(this);
        this.careerMode = new CareerMode(this);
    }
    
    async loadAssets() {
        const loadingProgress = document.getElementById('loading-progress');
        const loadingText = document.getElementById('loading-text');
        
        const assets = [
            { name: 'Player Models', progress: 20 },
            { name: 'Stadium Textures', progress: 40 },
            { name: 'Animation Data', progress: 60 },
            { name: 'Audio Files', progress: 80 },
            { name: 'Game Data', progress: 100 }
        ];
        
        for (const asset of assets) {
            loadingText.textContent = `Loading ${asset.name}...`;
            loadingProgress.style.width = `${asset.progress}%`;
            await this.delay(500); // Simulate loading time
        }
        
        // Hide loading screen and show main menu
        setTimeout(() => {
            document.getElementById('loading-screen').style.display = 'none';
            this.showScreen('main-menu');
            this.gameState = 'menu';
        }, 1000);
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Mouse controls
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Touch controls for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        // UI event listeners
        this.setupUIEventListeners();
    }
    
    setupUIEventListeners() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.target.dataset.screen;
                this.showScreen(screen);
            });
        });
        
        // Game controls
        document.querySelectorAll('.shot-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const shot = e.target.dataset.shot;
                this.cricketGame.executeShot(shot);
            });
        });
        
        document.querySelectorAll('.delivery-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const delivery = e.target.dataset.delivery;
                this.cricketGame.executeDelivery(delivery);
            });
        });
        
        // Career mode actions
        document.getElementById('start-match')?.addEventListener('click', () => {
            this.startMatch();
        });
        
        // Settings
        document.getElementById('graphics-quality')?.addEventListener('change', (e) => {
            this.updateGraphicsQuality(e.target.value);
        });
    }
    
    startGameLoop() {
        this.isRunning = true;
        this.gameLoop();
    }
    
    gameLoop(currentTime = 0) {
        if (!this.isRunning) return;
        
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        if (!this.isPaused) {
            this.update(this.deltaTime);
            this.render();
            this.updatePerformanceStats();
        }
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // Update physics
        this.physics.update(deltaTime);
        
        // Update game systems based on current state
        switch (this.gameState) {
            case 'playing':
                this.cricketGame.update(deltaTime);
                this.match.update(deltaTime);
                break;
            case 'career':
                this.careerMode.update(deltaTime);
                break;
        }
        
        // Update audio
        this.audio.update(deltaTime);
    }
    
    render() {
        if (this.gl) {
            // WebGL rendering
            this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            this.renderer.render();
        } else {
            // 2D canvas rendering
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.renderer.render2D(this.ctx);
        }
    }
    
    updatePerformanceStats() {
        this.frameCount++;
        
        if (this.frameCount % 60 === 0) {
            this.performanceStats.fps = Math.round(1000 / this.deltaTime);
            this.performanceStats.frameTime = this.deltaTime.toFixed(2);
            
            if (performance.memory) {
                this.performanceStats.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            }
        }
    }
    
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenId;
            
            // Update game state based on screen
            switch (screenId) {
                case 'main-menu':
                    this.gameState = 'menu';
                    break;
                case 'game-screen':
                    this.gameState = 'playing';
                    break;
                case 'career-mode':
                    this.gameState = 'career';
                    break;
            }
        }
    }
    
    startMatch() {
        this.showScreen('game-screen');
        this.cricketGame.startNewMatch();
    }
    
    pause() {
        this.isPaused = true;
    }
    
    resume() {
        this.isPaused = false;
    }
    
    stop() {
        this.isRunning = false;
    }
    
    // Input handling
    handleKeyDown(event) {
        if (this.gameState === 'playing') {
            this.cricketGame.handleKeyDown(event);
        }
    }
    
    handleKeyUp(event) {
        if (this.gameState === 'playing') {
            this.cricketGame.handleKeyUp(event);
        }
    }
    
    handleMouseDown(event) {
        if (this.gameState === 'playing') {
            this.cricketGame.handleMouseDown(event);
        }
    }
    
    handleMouseMove(event) {
        if (this.gameState === 'playing') {
            this.cricketGame.handleMouseMove(event);
        }
    }
    
    handleMouseUp(event) {
        if (this.gameState === 'playing') {
            this.cricketGame.handleMouseUp(event);
        }
    }
    
    handleTouchStart(event) {
        event.preventDefault();
        if (this.gameState === 'playing') {
            this.cricketGame.handleTouchStart(event);
        }
    }
    
    handleTouchMove(event) {
        event.preventDefault();
        if (this.gameState === 'playing') {
            this.cricketGame.handleTouchMove(event);
        }
    }
    
    handleTouchEnd(event) {
        event.preventDefault();
        if (this.gameState === 'playing') {
            this.cricketGame.handleTouchEnd(event);
        }
    }
    
    resizeCanvas() {
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = rect.width * window.devicePixelRatio;
        this.canvas.height = rect.height * window.devicePixelRatio;
        
        if (this.ctx) {
            this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        }
        
        if (this.gl) {
            this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }
        
        if (this.renderer) {
            this.renderer.resize(this.canvas.width, this.canvas.height);
        }
    }
    
    updateGraphicsQuality(quality) {
        const settings = {
            low: { particles: 100, shadows: false, reflections: false },
            medium: { particles: 500, shadows: true, reflections: false },
            high: { particles: 1000, shadows: true, reflections: true },
            ultra: { particles: 2000, shadows: true, reflections: true }
        };
        
        if (this.renderer) {
            this.renderer.updateQuality(settings[quality]);
        }
    }
    
    showError(message) {
        console.error(message);
        // Could implement error UI here
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // Utility methods
    getDeltaTime() {
        return this.deltaTime;
    }
    
    getFPS() {
        return this.performanceStats.fps;
    }
    
    getPerformanceStats() {
        return this.performanceStats;
    }
}