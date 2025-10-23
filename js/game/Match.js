/**
 * Cricket Pro Simulation - Match System
 * Handles match logic, scoring, and all cricket formats
 */

class Match {
    constructor(cricketGame, team1, team2, stadium) {
        this.cricketGame = cricketGame;
        this.team1 = team1;
        this.team2 = team2;
        this.stadium = stadium;
        
        // Match format
        this.format = 'T20'; // T20, ODI, Test
        this.overs = this.getOversForFormat();
        this.ballsPerOver = 6;
        
        // Match state
        this.matchState = 'not_started'; // not_started, in_progress, finished
        this.currentInnings = 1;
        this.currentOver = 0;
        this.currentBall = 0;
        this.isFirstInnings = true;
        
        // Teams
        this.battingTeam = team1;
        this.bowlingTeam = team2;
        this.battingOrder = [];
        this.bowlingOrder = [];
        
        // Current players
        this.striker = null;
        this.nonStriker = null;
        this.bowler = null;
        this.wicketKeeper = null;
        this.fielders = [];
        
        // Scoring
        this.score = {
            team1: { runs: 0, wickets: 0, overs: 0, balls: 0 },
            team2: { runs: 0, wickets: 0, overs: 0, balls: 0 }
        };
        
        // Ball tracking
        this.currentBallData = null;
        this.ballHistory = [];
        
        // Match statistics
        this.statistics = {
            totalRuns: 0,
            totalWickets: 0,
            totalOvers: 0,
            totalBalls: 0,
            highestScore: 0,
            bestBowling: { wickets: 0, runs: 0 },
            boundaries: { fours: 0, sixes: 0 },
            extras: { wides: 0, noBalls: 0, byes: 0, legByes: 0 },
            runRate: 0,
            requiredRunRate: 0
        };
        
        // Field positions
        this.fieldPositions = this.createDefaultFieldPositions();
        
        // Weather and pitch conditions
        this.pitchConditions = this.stadium.pitch || {
            hardness: 0.7,
            moisture: 0.3,
            grass: 0.5,
            cracks: 0.2,
            unevenness: 0.1
        };
        
        this.init();
    }
    
    init() {
        this.setupTeams();
        this.setupFieldPositions();
        this.updateRequiredRunRate();
    }
    
    setupTeams() {
        // Set up batting order
        this.battingOrder = [...this.battingTeam.players];
        this.striker = this.battingOrder[0];
        this.nonStriker = this.battingOrder[1];
        
        // Set up bowling order
        this.bowlingOrder = this.bowlingTeam.players.filter(player => 
            player.role === 'bowler' || player.role === 'all-rounder'
        );
        this.bowler = this.bowlingOrder[0];
        
        // Set up fielders
        this.fielders = this.bowlingTeam.players.filter(player => 
            player !== this.bowler
        );
        this.wicketKeeper = this.fielders.find(player => 
            player.role === 'wicket-keeper'
        );
    }
    
    setupFieldPositions() {
        this.fieldPositions = this.createDefaultFieldPositions();
    }
    
    createDefaultFieldPositions() {
        return {
            close: [
                { name: 'slip', position: { x: -5, y: 0, z: 10 } },
                { name: 'gully', position: { x: -8, y: 0, z: 8 } },
                { name: 'point', position: { x: -15, y: 0, z: 5 } },
                { name: 'cover', position: { x: -10, y: 0, z: 0 } },
                { name: 'mid-off', position: { x: 0, y: 0, z: 15 } },
                { name: 'mid-on', position: { x: 0, y: 0, z: 15 } },
                { name: 'mid-wicket', position: { x: 10, y: 0, z: 5 } },
                { name: 'square-leg', position: { x: 15, y: 0, z: 0 } },
                { name: 'fine-leg', position: { x: 8, y: 0, z: -5 } }
            ],
            deep: [
                { name: 'third-man', position: { x: -20, y: 0, z: 10 } },
                { name: 'deep-cover', position: { x: -15, y: 0, z: 0 } },
                { name: 'long-off', position: { x: 0, y: 0, z: 25 } },
                { name: 'long-on', position: { x: 0, y: 0, z: 25 } },
                { name: 'deep-mid-wicket', position: { x: 15, y: 0, z: 0 } },
                { name: 'deep-square-leg', position: { x: 20, y: 0, z: 0 } },
                { name: 'deep-fine-leg', position: { x: 10, y: 0, z: -10 } }
            ]
        };
    }
    
    start() {
        this.matchState = 'in_progress';
        this.toss();
        this.startInnings();
    }
    
    toss() {
        // Simulate toss
        const tossWinner = Math.random() < 0.5 ? this.team1 : this.team2;
        const choice = Math.random() < 0.5 ? 'bat' : 'bowl';
        
        if (choice === 'bat') {
            this.battingTeam = tossWinner;
            this.bowlingTeam = tossWinner === this.team1 ? this.team2 : this.team1;
        } else {
            this.bowlingTeam = tossWinner;
            this.battingTeam = tossWinner === this.team1 ? this.team2 : this.team1;
        }
        
        this.setupTeams();
    }
    
    startInnings() {
        this.currentOver = 0;
        this.currentBall = 0;
        this.setupTeams();
        this.updateRequiredRunRate();
    }
    
    endInnings() {
        if (this.isFirstInnings) {
            this.isFirstInnings = false;
            this.swapTeams();
            this.startInnings();
        } else {
            this.endMatch();
        }
    }
    
    swapTeams() {
        const temp = this.battingTeam;
        this.battingTeam = this.bowlingTeam;
        this.bowlingTeam = temp;
        this.setupTeams();
    }
    
    endMatch() {
        this.matchState = 'finished';
        this.calculateMatchResult();
    }
    
    calculateMatchResult() {
        const team1Score = this.score.team1.runs;
        const team2Score = this.score.team2.runs;
        
        if (team1Score > team2Score) {
            this.result = {
                winner: this.team1,
                margin: team1Score - team2Score,
                type: 'runs'
            };
        } else if (team2Score > team1Score) {
            this.result = {
                winner: this.team2,
                margin: team2Score - team1Score,
                type: 'runs'
            };
        } else {
            this.result = {
                winner: null,
                margin: 0,
                type: 'tie'
            };
        }
    }
    
    // Ball handling
    handleDelivery(deliveryType, power, direction, spin) {
        this.currentBallData = {
            type: deliveryType,
            power: power,
            direction: direction,
            spin: spin,
            timestamp: Date.now()
        };
        
        // Update bowler statistics
        if (this.bowler) {
            this.bowler.updateStats('balls', 1);
        }
    }
    
    handleShot(shotType, timing, power, direction) {
        if (!this.currentBallData) return;
        
        const ballResult = this.calculateBallResult(shotType, timing, power, direction);
        this.processBallResult(ballResult);
        
        // Add to ball history
        this.ballHistory.push({
            ...this.currentBallData,
            result: ballResult,
            striker: this.striker,
            bowler: this.bowler
        });
        
        this.currentBallData = null;
    }
    
    handleMissedShot() {
        if (!this.currentBallData) return;
        
        const ballResult = {
            type: 'dot',
            runs: 0,
            isWicket: false,
            isBoundary: false,
            isExtra: false
        };
        
        this.processBallResult(ballResult);
        
        this.ballHistory.push({
            ...this.currentBallData,
            result: ballResult,
            striker: this.striker,
            bowler: this.bowler
        });
        
        this.currentBallData = null;
    }
    
    calculateBallResult(shotType, timing, power, direction) {
        const striker = this.striker;
        const bowler = this.bowler;
        
        if (!striker || !bowler) {
            return { type: 'dot', runs: 0, isWicket: false, isBoundary: false, isExtra: false };
        }
        
        // Calculate shot success based on skills and timing
        const strikerSkill = striker.calculateBattingSkill();
        const bowlerSkill = bowler.calculateBowlingSkill();
        const shotDifficulty = this.getShotDifficulty(shotType);
        
        const successChance = (strikerSkill / 100) * timing * (1 - shotDifficulty);
        const isSuccessful = Math.random() < successChance;
        
        if (!isSuccessful) {
            // Missed shot or wicket
            const wicketChance = (bowlerSkill / 100) * (1 - timing) * 0.3;
            const isWicket = Math.random() < wicketChance;
            
            return {
                type: isWicket ? 'wicket' : 'dot',
                runs: 0,
                isWicket: isWicket,
                isBoundary: false,
                isExtra: false
            };
        }
        
        // Calculate runs based on shot type and power
        const baseRuns = this.getBaseRunsForShot(shotType);
        const powerMultiplier = 0.5 + power * 1.5;
        const skillMultiplier = strikerSkill / 100;
        
        const runs = Math.floor(baseRuns * powerMultiplier * skillMultiplier);
        
        // Determine if it's a boundary
        const isBoundary = runs >= 4;
        const isSix = runs >= 6;
        
        return {
            type: isSix ? 'six' : isBoundary ? 'four' : 'runs',
            runs: runs,
            isWicket: false,
            isBoundary: isBoundary,
            isExtra: false
        };
    }
    
    getShotDifficulty(shotType) {
        const difficulties = {
            'defensive': 0.1,
            'drive': 0.3,
            'pull': 0.4,
            'sweep': 0.5,
            'cut': 0.6,
            'hook': 0.7
        };
        
        return difficulties[shotType] || 0.3;
    }
    
    getBaseRunsForShot(shotType) {
        const baseRuns = {
            'defensive': 1,
            'drive': 3,
            'pull': 4,
            'sweep': 2,
            'cut': 2,
            'hook': 4
        };
        
        return baseRuns[shotType] || 2;
    }
    
    processBallResult(ballResult) {
        // Update score
        this.score[this.battingTeam.id].runs += ballResult.runs;
        this.statistics.totalRuns += ballResult.runs;
        
        // Update striker statistics
        if (this.striker) {
            this.striker.updateStats('runs', ballResult.runs);
            this.striker.updateStats('balls', 1);
        }
        
        // Update bowler statistics
        if (this.bowler) {
            this.bowler.updateStats('runs', ballResult.runs);
        }
        
        // Handle boundaries
        if (ballResult.isBoundary) {
            this.statistics.boundaries.fours += ballResult.runs === 4 ? 1 : 0;
            this.statistics.boundaries.sixes += ballResult.runs === 6 ? 1 : 0;
        }
        
        // Handle wicket
        if (ballResult.isWicket) {
            this.handleWicket();
        }
        
        // Update ball count
        this.currentBall++;
        this.score[this.battingTeam.id].balls++;
        this.statistics.totalBalls++;
        
        // Check for over completion
        if (this.currentBall >= this.ballsPerOver) {
            this.completeOver();
        }
        
        // Update run rate
        this.updateRunRate();
    }
    
    handleWicket() {
        this.score[this.battingTeam.id].wickets++;
        this.statistics.totalWickets++;
        
        // Update bowler statistics
        if (this.bowler) {
            this.bowler.updateStats('wickets', 1);
        }
        
        // Check if all out
        if (this.score[this.battingTeam.id].wickets >= 10) {
            this.endInnings();
            return;
        }
        
        // Get next batsman
        const nextBatsmanIndex = this.score[this.battingTeam.id].wickets + 1;
        if (nextBatsmanIndex < this.battingOrder.length) {
            this.striker = this.battingOrder[nextBatsmanIndex];
        }
    }
    
    completeOver() {
        this.currentOver++;
        this.currentBall = 0;
        this.score[this.battingTeam.id].overs++;
        this.statistics.totalOvers++;
        
        // Swap striker and non-striker
        const temp = this.striker;
        this.striker = this.nonStriker;
        this.nonStriker = temp;
        
        // Check if innings is complete
        if (this.currentOver >= this.overs) {
            this.endInnings();
        }
        
        // Change bowler (simplified - just cycle through bowling order)
        const currentBowlerIndex = this.bowlingOrder.indexOf(this.bowler);
        const nextBowlerIndex = (currentBowlerIndex + 1) % this.bowlingOrder.length;
        this.bowler = this.bowlingOrder[nextBowlerIndex];
    }
    
    updateRunRate() {
        const currentScore = this.score[this.battingTeam.id];
        const ballsBowled = currentScore.overs * 6 + currentScore.balls;
        
        if (ballsBowled > 0) {
            this.statistics.runRate = (currentScore.runs / ballsBowled) * 6;
        }
    }
    
    updateRequiredRunRate() {
        if (this.isFirstInnings) {
            this.statistics.requiredRunRate = 0;
            return;
        }
        
        const target = this.score[this.team1.id].runs + 1;
        const currentRuns = this.score[this.team2.id].runs;
        const ballsRemaining = (this.overs * 6) - (this.score[this.team2.id].overs * 6 + this.score[this.team2.id].balls);
        
        if (ballsRemaining > 0) {
            this.statistics.requiredRunRate = (target - currentRuns) / ballsRemaining * 6;
        }
    }
    
    // Getters
    getCurrentScore() {
        return {
            team1: { ...this.score.team1 },
            team2: { ...this.score.team2 },
            overs: this.currentOver,
            balls: this.currentBall
        };
    }
    
    getCurrentBatsmen() {
        return {
            striker: this.striker,
            nonStriker: this.nonStriker
        };
    }
    
    getCurrentBowler() {
        return this.bowler;
    }
    
    getCurrentStriker() {
        return this.striker;
    }
    
    getFormat() {
        return this.format;
    }
    
    getOversForFormat() {
        const overs = {
            'T20': 20,
            'ODI': 50,
            'Test': 90 // Simplified for demo
        };
        return overs[this.format] || 20;
    }
    
    isBattingPhase() {
        return this.matchState === 'in_progress' && this.battingTeam === this.team1;
    }
    
    isBowlingPhase() {
        return this.matchState === 'in_progress' && this.bowlingTeam === this.team1;
    }
    
    getCurrentSituation() {
        return {
            requiredRunRate: this.statistics.requiredRunRate,
            wickets: this.score[this.battingTeam.id].wickets,
            ballsRemaining: (this.overs * 6) - (this.score[this.battingTeam.id].overs * 6 + this.score[this.battingTeam.id].balls),
            batsmanOnStrike: this.striker,
            bowler: this.bowler
        };
    }
    
    getStatistics() {
        return {
            ...this.statistics,
            totalRuns: this.statistics.totalRuns,
            totalWickets: this.statistics.totalWickets,
            highestScore: Math.max(this.score.team1.runs, this.score.team2.runs),
            bestBowling: this.statistics.bestBowling
        };
    }
    
    getResult() {
        return this.result;
    }
    
    getMatchState() {
        return this.matchState;
    }
    
    // Field management
    setFieldPosition(fielderName, position) {
        const fielder = this.fielders.find(f => f.name === fielderName);
        if (fielder) {
            fielder.setPosition(position.x, position.y, position.z);
        }
    }
    
    getFieldPositions() {
        return this.fieldPositions;
    }
    
    // Weather and pitch updates
    updatePitchConditions(conditions) {
        this.pitchConditions = { ...this.pitchConditions, ...conditions };
        this.cricketGame.physics.setPitchConditions(this.pitchConditions);
    }
    
    updateWeatherConditions(conditions) {
        this.stadium.updateWeather(conditions);
        this.cricketGame.physics.setWeatherConditions(conditions);
    }
}