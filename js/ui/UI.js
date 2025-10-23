/**
 * Cricket Pro Simulation - UI System
 * Handles all user interface elements and interactions
 */

class UI {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.cricketGame = gameEngine.cricketGame;
        
        // UI state
        this.currentScreen = 'loading';
        this.isPaused = false;
        this.showDebugInfo = false;
        
        // UI elements
        this.elements = {
            loadingScreen: document.getElementById('loading-screen'),
            mainMenu: document.getElementById('main-menu'),
            gameScreen: document.getElementById('game-screen'),
            careerMode: document.getElementById('career-mode'),
            settings: document.getElementById('settings')
        };
        
        // HUD elements
        this.hud = {
            scoreboard: {
                team1Name: document.getElementById('team1-name'),
                team1Score: document.getElementById('team1-score'),
                team2Name: document.getElementById('team2-name'),
                team2Score: document.getElementById('team2-score'),
                overs: document.getElementById('overs'),
                format: document.getElementById('format')
            },
            playerInfo: {
                strikerName: document.getElementById('striker-name'),
                strikerRuns: document.getElementById('striker-runs'),
                nonStrikerName: document.getElementById('non-striker-name'),
                nonStrikerRuns: document.getElementById('non-striker-runs')
            },
            controls: {
                batting: document.querySelectorAll('.shot-btn'),
                bowling: document.querySelectorAll('.delivery-btn')
            }
        };
        
        // Notifications
        this.notifications = [];
        this.notificationContainer = null;
        
        // Modals
        this.modals = [];
        
        this.init();
    }
    
    init() {
        this.createNotificationContainer();
        this.setupEventListeners();
        this.updateUI();
    }
    
    createNotificationContainer() {
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.className = 'notification-container';
        this.notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            pointer-events: none;
        `;
        document.body.appendChild(this.notificationContainer);
    }
    
    setupEventListeners() {
        // Screen navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screen = e.target.dataset.screen;
                this.showScreen(screen);
            });
        });
        
        // Game controls
        this.hud.controls.batting.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const shot = e.target.dataset.shot;
                this.handleBattingInput(shot);
            });
        });
        
        this.hud.controls.bowling.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const delivery = e.target.dataset.delivery;
                this.handleBowlingInput(delivery);
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyDown(e);
        });
        
        // Settings
        document.getElementById('graphics-quality')?.addEventListener('change', (e) => {
            this.updateGraphicsQuality(e.target.value);
        });
        
        document.getElementById('master-volume')?.addEventListener('input', (e) => {
            this.updateMasterVolume(e.target.value);
        });
        
        document.getElementById('commentary')?.addEventListener('change', (e) => {
            this.updateCommentary(e.target.checked);
        });
    }
    
    // Screen management
    showScreen(screenId) {
        // Hide all screens
        Object.values(this.elements).forEach(element => {
            if (element) {
                element.classList.add('hidden');
            }
        });
        
        // Show target screen
        const targetScreen = this.elements[screenId];
        if (targetScreen) {
            targetScreen.classList.remove('hidden');
            this.currentScreen = screenId;
            
            // Screen-specific initialization
            this.initializeScreen(screenId);
        }
    }
    
    initializeScreen(screenId) {
        switch (screenId) {
            case 'game-screen':
                this.initializeGameScreen();
                break;
            case 'career-mode':
                this.initializeCareerModeScreen();
                break;
            case 'settings':
                this.initializeSettingsScreen();
                break;
        }
    }
    
    initializeGameScreen() {
        this.updateGameHUD();
        this.updatePlayerInfo();
    }
    
    initializeCareerModeScreen() {
        this.updateCareerModeUI();
    }
    
    initializeSettingsScreen() {
        this.updateSettingsUI();
    }
    
    // Game HUD updates
    updateGameHUD() {
        if (!this.cricketGame || !this.cricketGame.match) return;
        
        const match = this.cricketGame.match;
        const score = match.getCurrentScore();
        
        // Update scoreboard
        this.hud.scoreboard.team1Name.textContent = this.cricketGame.teams[0].name;
        this.hud.scoreboard.team1Score.textContent = `${score.team1.runs}/${score.team1.wickets}`;
        this.hud.scoreboard.team2Name.textContent = this.cricketGame.teams[1].name;
        this.hud.scoreboard.team2Score.textContent = `${score.team2.runs}/${score.team2.wickets}`;
        this.hud.scoreboard.overs.textContent = `${score.overs}.${score.balls}`;
        this.hud.scoreboard.format.textContent = match.getFormat();
    }
    
    updatePlayerInfo() {
        if (!this.cricketGame || !this.cricketGame.match) return;
        
        const match = this.cricketGame.match;
        const batsmen = match.getCurrentBatsmen();
        
        if (batsmen.striker) {
            this.hud.playerInfo.strikerName.textContent = batsmen.striker.name;
            this.hud.playerInfo.strikerRuns.textContent = `${batsmen.striker.stats.runs} (${batsmen.striker.stats.balls})`;
        }
        
        if (batsmen.nonStriker) {
            this.hud.playerInfo.nonStrikerName.textContent = batsmen.nonStriker.name;
            this.hud.playerInfo.nonStrikerRuns.textContent = `${batsmen.nonStriker.stats.runs} (${batsmen.nonStriker.stats.balls})`;
        }
    }
    
    // Career mode UI
    updateCareerModeUI() {
        if (!this.cricketGame || !this.cricketGame.careerMode) return;
        
        const careerMode = this.cricketGame.careerMode;
        const careerData = careerMode.getCareerData();
        
        // Update statistics
        document.getElementById('batting-avg').textContent = careerData.statistics.battingAverage.toFixed(2);
        document.getElementById('bowling-avg').textContent = careerData.statistics.bowlingAverage.toFixed(2);
        document.getElementById('career-runs').textContent = careerData.statistics.runs;
        document.getElementById('career-wickets').textContent = careerData.statistics.wickets;
    }
    
    // Settings UI
    updateSettingsUI() {
        if (!this.gameEngine) return;
        
        // Update graphics quality
        const graphicsQuality = document.getElementById('graphics-quality');
        if (graphicsQuality) {
            graphicsQuality.value = this.gameEngine.settings?.graphics || 'medium';
        }
        
        // Update volume controls
        const masterVolume = document.getElementById('master-volume');
        if (masterVolume && this.gameEngine.audio) {
            masterVolume.value = this.gameEngine.audio.getMasterVolume() * 100;
        }
        
        const commentary = document.getElementById('commentary');
        if (commentary && this.gameEngine.audio) {
            commentary.checked = this.gameEngine.audio.getCommentaryVolume() > 0;
        }
    }
    
    // Input handling
    handleKeyDown(event) {
        switch (event.code) {
            case 'Escape':
                this.togglePause();
                break;
            case 'F1':
                this.toggleDebugInfo();
                break;
            case 'Space':
                event.preventDefault();
                this.handleBattingInput('drive');
                break;
        }
    }
    
    handleBattingInput(shotType) {
        if (this.cricketGame && this.cricketGame.gameState === 'playing') {
            const timing = 0.7; // Default timing
            const power = 0.7; // Default power
            const direction = 0.5; // Default direction
            this.cricketGame.executeShot(shotType, timing, power, direction);
        }
    }
    
    handleBowlingInput(deliveryType) {
        if (this.cricketGame && this.cricketGame.gameState === 'playing') {
            const power = 0.7; // Default power
            const direction = 0.5; // Default direction
            const spin = { x: 0, y: 0, z: 1 }; // Default spin
            this.cricketGame.executeDelivery(deliveryType, power, direction, spin);
        }
    }
    
    // Game state management
    togglePause() {
        if (this.cricketGame && this.cricketGame.gameState === 'playing') {
            if (this.isPaused) {
                this.cricketGame.resumeGame();
                this.isPaused = false;
                this.hidePauseMenu();
            } else {
                this.cricketGame.pauseGame();
                this.isPaused = true;
                this.showPauseMenu();
            }
        }
    }
    
    showPauseMenu() {
        const pauseMenu = document.createElement('div');
        pauseMenu.className = 'pause-menu';
        pauseMenu.innerHTML = `
            <div class="pause-content">
                <h2>Game Paused</h2>
                <button onclick="ui.resumeGame()">Resume</button>
                <button onclick="ui.showSettings()">Settings</button>
                <button onclick="ui.quitToMenu()">Quit to Menu</button>
            </div>
        `;
        pauseMenu.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        document.body.appendChild(pauseMenu);
    }
    
    hidePauseMenu() {
        const pauseMenu = document.querySelector('.pause-menu');
        if (pauseMenu) {
            pauseMenu.remove();
        }
    }
    
    resumeGame() {
        this.cricketGame.resumeGame();
        this.isPaused = false;
        this.hidePauseMenu();
    }
    
    showSettings() {
        this.showScreen('settings');
        this.hidePauseMenu();
    }
    
    quitToMenu() {
        this.cricketGame.endGame();
        this.showScreen('main-menu');
        this.hidePauseMenu();
    }
    
    // Debug info
    toggleDebugInfo() {
        this.showDebugInfo = !this.showDebugInfo;
        this.updateDebugInfo();
    }
    
    updateDebugInfo() {
        let debugPanel = document.getElementById('debug-panel');
        
        if (this.showDebugInfo) {
            if (!debugPanel) {
                debugPanel = document.createElement('div');
                debugPanel.id = 'debug-panel';
                debugPanel.className = 'debug-panel';
                debugPanel.style.cssText = `
                    position: fixed;
                    top: 10px;
                    left: 10px;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 10px;
                    font-family: monospace;
                    font-size: 12px;
                    z-index: 1000;
                    border-radius: 5px;
                `;
                document.body.appendChild(debugPanel);
            }
            
            this.updateDebugContent(debugPanel);
        } else if (debugPanel) {
            debugPanel.remove();
        }
    }
    
    updateDebugContent(debugPanel) {
        if (!this.gameEngine) return;
        
        const stats = this.gameEngine.getPerformanceStats();
        const fps = this.gameEngine.getFPS();
        
        debugPanel.innerHTML = `
            <div>FPS: ${fps}</div>
            <div>Frame Time: ${stats.frameTime}ms</div>
            <div>Memory: ${stats.memoryUsage}MB</div>
            <div>Game State: ${this.cricketGame?.gameState || 'unknown'}</div>
            <div>Screen: ${this.currentScreen}</div>
        `;
    }
    
    // Notifications
    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            background: ${type === 'error' ? '#ff6b6b' : type === 'success' ? '#51cf66' : '#339af0'};
            color: white;
            padding: 10px 15px;
            margin-bottom: 10px;
            border-radius: 5px;
            pointer-events: auto;
            cursor: pointer;
            animation: slideIn 0.3s ease-out;
        `;
        
        // Add animation keyframes if not already added
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.notificationContainer.appendChild(notification);
        this.notifications.push(notification);
        
        // Auto remove after duration
        setTimeout(() => {
            this.removeNotification(notification);
        }, duration);
        
        // Click to remove
        notification.addEventListener('click', () => {
            this.removeNotification(notification);
        });
    }
    
    removeNotification(notification) {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
        
        const index = this.notifications.indexOf(notification);
        if (index > -1) {
            this.notifications.splice(index, 1);
        }
    }
    
    // Settings updates
    updateGraphicsQuality(quality) {
        if (this.gameEngine) {
            this.gameEngine.updateGraphicsQuality(quality);
        }
    }
    
    updateMasterVolume(volume) {
        if (this.gameEngine && this.gameEngine.audio) {
            this.gameEngine.audio.setMasterVolume(volume / 100);
        }
    }
    
    updateCommentary(enabled) {
        if (this.gameEngine && this.gameEngine.audio) {
            this.gameEngine.audio.setCommentaryVolume(enabled ? 0.8 : 0);
        }
    }
    
    // Modal system
    showModal(title, content, buttons = []) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>${title}</h2>
                <div class="modal-body">${content}</div>
                <div class="modal-buttons">
                    ${buttons.map(btn => `<button onclick="${btn.onclick}">${btn.text}</button>`).join('')}
                </div>
            </div>
        `;
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        `;
        document.body.appendChild(modal);
        this.modals.push(modal);
        
        return modal;
    }
    
    hideModal(modal) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        
        const index = this.modals.indexOf(modal);
        if (index > -1) {
            this.modals.splice(index, 1);
        }
    }
    
    hideAllModals() {
        this.modals.forEach(modal => {
            this.hideModal(modal);
        });
    }
    
    // Update method
    update() {
        if (this.currentScreen === 'game-screen') {
            this.updateGameHUD();
            this.updatePlayerInfo();
        }
        
        if (this.showDebugInfo) {
            this.updateDebugInfo();
        }
    }
    
    // Utility methods
    getCurrentScreen() {
        return this.currentScreen;
    }
    
    isPaused() {
        return this.isPaused;
    }
    
    showError(message) {
        this.showNotification(message, 'error', 5000);
    }
    
    showSuccess(message) {
        this.showNotification(message, 'success', 3000);
    }
    
    showInfo(message) {
        this.showNotification(message, 'info', 3000);
    }
}

// Export for global access
window.UI = UI;