/**
 * Cricket Pro Simulation - Main Entry Point
 * Initializes and starts the game
 */

// Global game instance
let gameEngine = null;

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});

async function initializeGame() {
    try {
        // Show loading screen
        showLoadingScreen();
        
        // Initialize game engine
        gameEngine = new GameEngine();
        
        // Wait for initialization to complete
        await waitForGameInitialization();
        
        // Hide loading screen and show main menu
        hideLoadingScreen();
        
        // Setup UI event listeners
        setupUIEventListeners();
        
        console.log('Cricket Pro Simulation initialized successfully!');
        
    } catch (error) {
        console.error('Failed to initialize game:', error);
        showError('Failed to initialize game. Please refresh the page.');
    }
}

function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'flex';
    }
}

function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
}

function showError(message) {
    const loadingText = document.getElementById('loading-text');
    if (loadingText) {
        loadingText.textContent = message;
        loadingText.style.color = '#ff6b6b';
    }
}

async function waitForGameInitialization() {
    return new Promise((resolve) => {
        const checkInitialization = () => {
            if (gameEngine && gameEngine.gameState === 'menu') {
                resolve();
            } else {
                setTimeout(checkInitialization, 100);
            }
        };
        checkInitialization();
    });
}

function setupUIEventListeners() {
    // Navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const screen = e.target.dataset.screen;
            showScreen(screen);
        });
    });
    
    // Game controls
    document.querySelectorAll('.shot-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const shot = e.target.dataset.shot;
            if (gameEngine && gameEngine.cricketGame) {
                gameEngine.cricketGame.executeShot(shot, 0.7, 0.7, 0.5);
            }
        });
    });
    
    document.querySelectorAll('.delivery-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const delivery = e.target.dataset.delivery;
            if (gameEngine && gameEngine.cricketGame) {
                gameEngine.cricketGame.executeDelivery(delivery, 0.7, 0.5, { x: 0, y: 0, z: 1 });
            }
        });
    });
    
    // Career mode actions
    document.getElementById('start-match')?.addEventListener('click', () => {
        if (gameEngine && gameEngine.cricketGame) {
            gameEngine.cricketGame.startNewMatch();
        }
    });
    
    document.getElementById('training')?.addEventListener('click', () => {
        showTrainingScreen();
    });
    
    document.getElementById('contracts')?.addEventListener('click', () => {
        showContractsScreen();
    });
    
    // Settings
    document.getElementById('graphics-quality')?.addEventListener('change', (e) => {
        if (gameEngine && gameEngine.renderer) {
            gameEngine.updateGraphicsQuality(e.target.value);
        }
    });
    
    document.getElementById('master-volume')?.addEventListener('input', (e) => {
        if (gameEngine && gameEngine.audio) {
            gameEngine.audio.setMasterVolume(e.target.value / 100);
        }
    });
    
    document.getElementById('commentary')?.addEventListener('change', (e) => {
        if (gameEngine && gameEngine.audio) {
            gameEngine.audio.setCommentaryVolume(e.target.checked ? 0.8 : 0);
        }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (gameEngine && gameEngine.gameState === 'playing') {
                gameEngine.pause();
            }
        }
    });
}

function showScreen(screenId) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
        
        // Update game state
        if (gameEngine) {
            gameEngine.showScreen(screenId);
        }
        
        // Screen-specific initialization
        switch (screenId) {
            case 'game-screen':
                initializeGameScreen();
                break;
            case 'career-mode':
                initializeCareerModeScreen();
                break;
            case 'settings':
                initializeSettingsScreen();
                break;
        }
    }
}

function initializeGameScreen() {
    // Initialize game screen specific elements
    if (gameEngine && gameEngine.cricketGame) {
        gameEngine.cricketGame.updateUI();
    }
}

function initializeCareerModeScreen() {
    // Initialize career mode screen
    if (gameEngine && gameEngine.cricketGame && gameEngine.cricketGame.careerMode) {
        updateCareerModeUI();
    }
}

function initializeSettingsScreen() {
    // Initialize settings screen with current values
    if (gameEngine) {
        const graphicsQuality = document.getElementById('graphics-quality');
        if (graphicsQuality) {
            graphicsQuality.value = gameEngine.settings?.graphics || 'medium';
        }
        
        const masterVolume = document.getElementById('master-volume');
        if (masterVolume && gameEngine.audio) {
            masterVolume.value = gameEngine.audio.getMasterVolume() * 100;
        }
        
        const commentary = document.getElementById('commentary');
        if (commentary && gameEngine.audio) {
            commentary.checked = gameEngine.audio.getCommentaryVolume() > 0;
        }
    }
}

function updateCareerModeUI() {
    if (!gameEngine || !gameEngine.cricketGame || !gameEngine.cricketGame.careerMode) return;
    
    const careerMode = gameEngine.cricketGame.careerMode;
    const careerData = careerMode.getCareerData();
    
    // Update statistics
    document.getElementById('batting-avg').textContent = careerData.statistics.battingAverage.toFixed(2);
    document.getElementById('bowling-avg').textContent = careerData.statistics.bowlingAverage.toFixed(2);
    document.getElementById('career-runs').textContent = careerData.statistics.runs;
    document.getElementById('career-wickets').textContent = careerData.statistics.wickets;
}

function showTrainingScreen() {
    // Create training screen modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Training</h2>
            <div class="training-modules">
                <h3>Available Training Points: ${gameEngine.cricketGame.careerMode.getAvailableTrainingPoints()}</h3>
                <div class="training-categories">
                    <div class="category">
                        <h4>Batting</h4>
                        <div class="modules">
                            <div class="module">
                                <span>Technique Training</span>
                                <button onclick="startTraining('batting', 'technique')">Start (10 pts)</button>
                            </div>
                            <div class="module">
                                <span>Power Hitting</span>
                                <button onclick="startTraining('batting', 'power')">Start (15 pts)</button>
                            </div>
                        </div>
                    </div>
                    <div class="category">
                        <h4>Bowling</h4>
                        <div class="modules">
                            <div class="module">
                                <span>Pace Training</span>
                                <button onclick="startTraining('bowling', 'pace')">Start (15 pts)</button>
                            </div>
                            <div class="module">
                                <span>Accuracy Practice</span>
                                <button onclick="startTraining('bowling', 'accuracy')">Start (12 pts)</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <button onclick="closeModal()">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showContractsScreen() {
    // Create contracts screen modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Contracts</h2>
            <div class="contracts">
                <h3>Available Contracts</h3>
                <div class="contract-list">
                    <div class="contract">
                        <h4>Domestic League</h4>
                        <p>Duration: 12 months</p>
                        <p>Base Salary: $5,000/month</p>
                        <p>Match Fee: $500</p>
                        <button onclick="signContract('domestic')">Sign Contract</button>
                    </div>
                </div>
            </div>
            <button onclick="closeModal()">Close</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function startTraining(category, skill) {
    if (gameEngine && gameEngine.cricketGame && gameEngine.cricketGame.careerMode) {
        const careerMode = gameEngine.cricketGame.careerMode;
        const modules = careerMode.getTrainingModules();
        const module = modules[category].find(m => m.effect === skill);
        
        if (module && careerMode.startTraining(module)) {
            alert(`Started ${module.name}!`);
            closeModal();
            updateCareerModeUI();
        } else {
            alert('Not enough training points!');
        }
    }
}

function signContract(type) {
    if (gameEngine && gameEngine.cricketGame && gameEngine.cricketGame.careerMode) {
        const careerMode = gameEngine.cricketGame.careerMode;
        const contracts = careerMode.getAvailableContracts();
        const contract = contracts.find(c => c.type === type);
        
        if (contract && careerMode.signContract(contract.id)) {
            alert(`Signed ${contract.name} contract!`);
            closeModal();
        } else {
            alert('Cannot sign this contract. Check requirements.');
        }
    }
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Utility functions
function formatNumber(num) {
    return num.toLocaleString();
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Error handling
window.addEventListener('error', (event) => {
    console.error('Game error:', event.error);
    // Could show error UI here
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Could show error UI here
});

// Performance monitoring
if (performance && performance.mark) {
    performance.mark('game-start');
}

// Export for debugging
window.gameEngine = gameEngine;