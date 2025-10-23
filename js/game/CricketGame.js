/**
 * Cricket Pro Simulation - Main Cricket Game Logic
 * Handles all cricket-specific gameplay mechanics
 */

class CricketGame {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.physics = gameEngine.physics;
        this.renderer = gameEngine.renderer;
        this.audio = gameEngine.audio;
        
        // Game state
        this.gameState = 'menu'; // menu, playing, paused, finished
        this.match = null;
        this.players = [];
        this.teams = [];
        this.stadium = null;
        
        // Input handling
        this.inputState = {
            keys: {},
            mouse: { x: 0, y: 0, buttons: {} },
            touch: { x: 0, y: 0, active: false }
        };
        
        // Game settings
        this.settings = {
            difficulty: 'medium', // easy, medium, hard, expert
            aiAssistance: true,
            cameraMode: 'follow', // follow, fixed, free
            graphics: 'high',
            audio: true
        };
        
        // Statistics
        this.statistics = {
            totalMatches: 0,
            totalRuns: 0,
            totalWickets: 0,
            bestScore: 0,
            bestBowling: { wickets: 0, runs: 0 }
        };
        
        this.init();
    }
    
    init() {
        this.setupInputHandlers();
        this.loadGameData();
        this.initializeTeams();
    }
    
    setupInputHandlers() {
        // Keyboard input
        document.addEventListener('keydown', (e) => {
            this.inputState.keys[e.code] = true;
            this.handleKeyInput(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.inputState.keys[e.code] = false;
        });
        
        // Mouse input
        document.addEventListener('mousemove', (e) => {
            this.inputState.mouse.x = e.clientX;
            this.inputState.mouse.y = e.clientY;
        });
        
        document.addEventListener('mousedown', (e) => {
            this.inputState.mouse.buttons[e.button] = true;
            this.handleMouseInput(e);
        });
        
        document.addEventListener('mouseup', (e) => {
            this.inputState.mouse.buttons[e.button] = false;
        });
        
        // Touch input
        document.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.inputState.touch.x = touch.clientX;
            this.inputState.touch.y = touch.clientY;
            this.inputState.touch.active = true;
            this.handleTouchInput(e);
        });
        
        document.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            this.inputState.touch.x = touch.clientX;
            this.inputState.touch.y = touch.clientY;
        });
        
        document.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.inputState.touch.active = false;
        });
    }
    
    loadGameData() {
        // Load teams and players data
        this.teams = this.createDefaultTeams();
        this.players = this.createDefaultPlayers();
        this.stadium = this.createDefaultStadium();
    }
    
    createDefaultTeams() {
        return [
            {
                id: 'team_a',
                name: 'Team A',
                country: 'Australia',
                primaryColor: 0x0066cc,
                secondaryColor: 0xffffff,
                players: this.createTeamPlayers('Team A')
            },
            {
                id: 'team_b',
                name: 'Team B',
                country: 'England',
                primaryColor: 0xcc0000,
                secondaryColor: 0xffffff,
                players: this.createTeamPlayers('Team B')
            }
        ];
    }
    
    createTeamPlayers(teamName) {
        const players = [];
        const positions = ['opener', 'opener', 'batsman', 'batsman', 'batsman', 'all-rounder', 'all-rounder', 'wicket-keeper', 'bowler', 'bowler', 'bowler'];
        
        for (let i = 0; i < 11; i++) {
            players.push(new Player({
                name: `Player ${i + 1}`,
                team: teamName,
                role: positions[i],
                jerseyNumber: i + 1,
                batting: {
                    technique: 60 + Math.random() * 40,
                    power: 60 + Math.random() * 40,
                    timing: 60 + Math.random() * 40,
                    placement: 60 + Math.random() * 40,
                    temperament: 60 + Math.random() * 40
                },
                bowling: {
                    pace: 60 + Math.random() * 40,
                    accuracy: 60 + Math.random() * 40,
                    swing: 60 + Math.random() * 40,
                    spin: 60 + Math.random() * 40,
                    variation: 60 + Math.random() * 40
                },
                fielding: {
                    catching: 60 + Math.random() * 40,
                    throwing: 60 + Math.random() * 40,
                    agility: 60 + Math.random() * 40,
                    anticipation: 60 + Math.random() * 40
                }
            }));
        }
        
        return players;
    }
    
    createDefaultStadium() {
        return new Stadium({
            name: 'Melbourne Cricket Ground',
            location: { city: 'Melbourne', country: 'Australia' },
            capacity: 100000,
            dimensions: {
                boundary: 80,
                pitchLength: 20.12,
                pitchWidth: 3.05
            },
            features: {
                floodlights: true,
                roof: false,
                grass: 'natural',
                drainage: 'excellent',
                sightScreens: true,
                scoreboard: 'electronic',
                replayScreen: true
            },
            weather: {
                temperature: 25,
                humidity: 0.5,
                windSpeed: 2,
                windDirection: 0,
                cloudCover: 0.3,
                precipitation: 0,
                visibility: 1.0
            },
            timeOfDay: 'day'
        });
    }
    
    initializeTeams() {
        // Initialize team data and player positions
        this.teams.forEach(team => {
            team.players.forEach(player => {
                player.team = team;
                this.players.push(player);
            });
        });
    }
    
    startNewMatch() {
        this.match = new Match(this, this.teams[0], this.teams[1], this.stadium);
        this.match.start();
        this.gameState = 'playing';
    }
    
    // Input handling
    handleKeyInput(event) {
        if (this.gameState !== 'playing') return;
        
        switch (event.code) {
            case 'Space':
                event.preventDefault();
                this.handleBattingInput();
                break;
            case 'KeyW':
                this.handleBowlingInput('fast');
                break;
            case 'KeyA':
                this.handleBowlingInput('swing');
                break;
            case 'KeyS':
                this.handleBowlingInput('spin');
                break;
            case 'KeyD':
                this.handleBowlingInput('yorker');
                break;
            case 'KeyQ':
                this.handleBowlingInput('bouncer');
                break;
            case 'Escape':
                this.pauseGame();
                break;
        }
    }
    
    handleMouseInput(event) {
        if (this.gameState !== 'playing') return;
        
        switch (event.button) {
            case 0: // Left click
                this.handleBattingInput();
                break;
            case 2: // Right click
                this.handleBowlingInput('fast');
                break;
        }
    }
    
    handleTouchInput(event) {
        if (this.gameState !== 'playing') return;
        
        // Touch for batting
        this.handleBattingInput();
    }
    
    handleBattingInput() {
        if (!this.match || !this.match.isBattingPhase()) return;
        
        const timing = this.calculateTiming();
        const power = this.calculatePower();
        const direction = this.calculateDirection();
        
        // Determine shot type based on input
        const shotType = this.determineShotType();
        
        // Execute shot
        this.executeShot(shotType, timing, power, direction);
    }
    
    handleBowlingInput(deliveryType) {
        if (!this.match || !this.match.isBowlingPhase()) return;
        
        const power = this.calculatePower();
        const direction = this.calculateDirection();
        const spin = this.calculateSpin();
        
        // Execute delivery
        this.executeDelivery(deliveryType, power, direction, spin);
    }
    
    calculateTiming() {
        // Calculate timing based on ball position and player skill
        const ballPosition = this.physics.getBallPosition();
        const striker = this.match.getCurrentStriker();
        
        if (!striker) return 0.5;
        
        // Perfect timing is when ball is at the right position
        const perfectTiming = 0.5;
        const skillFactor = striker.skills.batting.timing / 100;
        const randomFactor = (Math.random() - 0.5) * 0.4;
        
        return Math.max(0, Math.min(1, perfectTiming + randomFactor * (1 - skillFactor)));
    }
    
    calculatePower() {
        // Calculate power based on input duration and player skill
        const striker = this.match.getCurrentStriker();
        if (!striker) return 0.5;
        
        const skillFactor = striker.skills.batting.power / 100;
        const inputPower = 0.5 + Math.random() * 0.5; // Simulate power input
        
        return inputPower * skillFactor;
    }
    
    calculateDirection() {
        // Calculate direction based on mouse/touch position
        const canvas = this.gameEngine.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        let inputX, inputY;
        
        if (this.inputState.touch.active) {
            inputX = this.inputState.touch.x;
            inputY = this.inputState.touch.y;
        } else {
            inputX = this.inputState.mouse.x;
            inputY = this.inputState.mouse.y;
        }
        
        const deltaX = inputX - centerX;
        const deltaY = inputY - centerY;
        const angle = Math.atan2(deltaY, deltaX);
        
        return angle / (Math.PI * 2); // Normalize to 0-1
    }
    
    calculateSpin() {
        // Calculate spin based on input and player skill
        const bowler = this.match.getCurrentBowler();
        if (!bowler) return { x: 0, y: 0, z: 0 };
        
        const skillFactor = bowler.skills.bowling.spin / 100;
        const randomSpin = (Math.random() - 0.5) * 2;
        
        return {
            x: randomSpin * skillFactor,
            y: randomSpin * skillFactor,
            z: randomSpin * skillFactor
        };
    }
    
    determineShotType() {
        // Determine shot type based on input and situation
        const shotTypes = ['defensive', 'drive', 'pull', 'sweep', 'cut', 'hook'];
        const weights = [0.2, 0.3, 0.2, 0.1, 0.1, 0.1]; // Default weights
        
        // Adjust weights based on input
        const power = this.calculatePower();
        const direction = this.calculateDirection();
        
        if (power > 0.7) {
            weights[1] += 0.2; // Drive
            weights[2] += 0.2; // Pull
        }
        
        if (direction < 0.25 || direction > 0.75) {
            weights[3] += 0.2; // Sweep
            weights[5] += 0.2; // Hook
        }
        
        // Select shot based on weights
        const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < shotTypes.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return shotTypes[i];
            }
        }
        
        return 'defensive'; // Fallback
    }
    
    executeShot(shotType, timing, power, direction) {
        if (!this.match) return;
        
        const success = this.physics.executeShot(shotType, timing, power, direction);
        
        if (success) {
            // Update match state
            this.match.handleShot(shotType, timing, power, direction);
            
            // Play sound effect
            this.audio.playSound('bat_hit');
            
            // Update UI
            this.updateUI();
        } else {
            // Missed shot
            this.match.handleMissedShot();
            this.audio.playSound('bat_miss');
        }
    }
    
    executeDelivery(deliveryType, power, direction, spin) {
        if (!this.match) return;
        
        // Execute ball delivery
        this.physics.deliverBall(deliveryType, power, direction, spin);
        
        // Update match state
        this.match.handleDelivery(deliveryType, power, direction, spin);
        
        // Play sound effect
        this.audio.playSound('ball_release');
        
        // Update UI
        this.updateUI();
    }
    
    // Game state management
    pauseGame() {
        this.gameState = 'paused';
        this.gameEngine.pause();
    }
    
    resumeGame() {
        this.gameState = 'playing';
        this.gameEngine.resume();
    }
    
    endGame() {
        this.gameState = 'finished';
        this.match.end();
        this.updateStatistics();
    }
    
    updateStatistics() {
        if (!this.match) return;
        
        const matchStats = this.match.getStatistics();
        
        this.statistics.totalMatches++;
        this.statistics.totalRuns += matchStats.totalRuns;
        this.statistics.totalWickets += matchStats.totalWickets;
        
        if (matchStats.highestScore > this.statistics.bestScore) {
            this.statistics.bestScore = matchStats.highestScore;
        }
        
        if (matchStats.bestBowling.wickets > this.statistics.bestBowling.wickets) {
            this.statistics.bestBowling = matchStats.bestBowling;
        }
    }
    
    updateUI() {
        if (!this.match) return;
        
        // Update scoreboard
        const score = this.match.getCurrentScore();
        document.getElementById('team1-score').textContent = `${score.team1.runs}/${score.team1.wickets}`;
        document.getElementById('team2-score').textContent = `${score.team2.runs}/${score.team2.wickets}`;
        
        // Update overs
        document.getElementById('overs').textContent = `${score.overs}.${score.balls}`;
        
        // Update format
        document.getElementById('format').textContent = this.match.getFormat();
        
        // Update batsmen
        const batsmen = this.match.getCurrentBatsmen();
        if (batsmen.striker) {
            document.getElementById('striker-name').textContent = batsmen.striker.name;
            document.getElementById('striker-runs').textContent = `${batsmen.striker.runs} (${batsmen.striker.balls})`;
        }
        if (batsmen.nonStriker) {
            document.getElementById('non-striker-name').textContent = batsmen.nonStriker.name;
            document.getElementById('non-striker-runs').textContent = `${batsmen.nonStriker.runs} (${batsmen.nonStriker.balls})`;
        }
    }
    
    // AI assistance
    getAIAdvice() {
        if (!this.match) return null;
        
        const situation = this.match.getCurrentSituation();
        const advice = {
            batting: this.getBattingAdvice(situation),
            bowling: this.getBowlingAdvice(situation),
            fielding: this.getFieldingAdvice(situation)
        };
        
        return advice;
    }
    
    getBattingAdvice(situation) {
        const advice = [];
        
        if (situation.requiredRunRate > 8) {
            advice.push("High required run rate - consider aggressive shots");
        }
        
        if (situation.wickets < 3) {
            advice.push("Early wickets - play cautiously");
        }
        
        if (situation.ballsRemaining < 30) {
            advice.push("Few balls remaining - accelerate scoring");
        }
        
        return advice;
    }
    
    getBowlingAdvice(situation) {
        const advice = [];
        
        if (situation.batsmanOnStrike) {
            advice.push(`Target ${situation.batsmanOnStrike.weakness} - their weakness`);
        }
        
        if (situation.requiredRunRate > 8) {
            advice.push("High required rate - bowl defensively");
        }
        
        if (situation.wickets < 3) {
            advice.push("Early wickets - attack the stumps");
        }
        
        return advice;
    }
    
    getFieldingAdvice(situation) {
        const advice = [];
        
        if (situation.batsmanOnStrike) {
            advice.push(`Set field for ${situation.batsmanOnStrike.preferredShot}`);
        }
        
        if (situation.requiredRunRate > 8) {
            advice.push("Defensive field - protect boundaries");
        }
        
        return advice;
    }
    
    // Utility methods
    getGameState() {
        return this.gameState;
    }
    
    getMatch() {
        return this.match;
    }
    
    getTeams() {
        return this.teams;
    }
    
    getPlayers() {
        return this.players;
    }
    
    getStadium() {
        return this.stadium;
    }
    
    getStatistics() {
        return this.statistics;
    }
    
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
    }
    
    getSettings() {
        return this.settings;
    }
}