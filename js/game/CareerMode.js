/**
 * Cricket Pro Simulation - Career Mode
 * Handles player career progression, contracts, and statistics
 */

class CareerMode {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.cricketGame = gameEngine.cricketGame;
        
        // Player career data
        this.player = null;
        this.careerData = {
            level: 1,
            experience: 0,
            experienceToNext: 100,
            reputation: 0,
            contracts: [],
            currentContract: null,
            achievements: [],
            statistics: {
                matches: 0,
                runs: 0,
                balls: 0,
                wickets: 0,
                overs: 0,
                catches: 0,
                stumpings: 0,
                battingAverage: 0,
                bowlingAverage: 0,
                strikeRate: 0,
                economyRate: 0
            },
            skills: {
                batting: { technique: 50, power: 50, timing: 50, placement: 50, temperament: 50 },
                bowling: { pace: 50, accuracy: 50, swing: 50, spin: 50, variation: 50 },
                fielding: { catching: 50, throwing: 50, agility: 50, anticipation: 50 },
                fitness: { stamina: 50, strength: 50, speed: 50, flexibility: 50 }
            },
            training: {
                sessionsCompleted: 0,
                currentFocus: 'batting',
                availablePoints: 0
            }
        };
        
        // Career progression
        this.careerStages = [
            { name: 'Rookie', level: 1, reputation: 0, contracts: ['domestic'] },
            { name: 'Rising Star', level: 5, reputation: 100, contracts: ['domestic', 'franchise'] },
            { name: 'Professional', level: 10, reputation: 500, contracts: ['domestic', 'franchise', 'international'] },
            { name: 'Star Player', level: 15, reputation: 1000, contracts: ['domestic', 'franchise', 'international', 'premier'] },
            { name: 'Legend', level: 20, reputation: 2000, contracts: ['domestic', 'franchise', 'international', 'premier', 'elite'] }
        ];
        
        // Available contracts
        this.availableContracts = [];
        
        // Training system
        this.trainingModules = {
            batting: [
                { name: 'Technique Training', cost: 10, effect: 'technique', amount: 2 },
                { name: 'Power Hitting', cost: 15, effect: 'power', amount: 3 },
                { name: 'Timing Practice', cost: 12, effect: 'timing', amount: 2 },
                { name: 'Placement Training', cost: 8, effect: 'placement', amount: 2 },
                { name: 'Mental Toughness', cost: 20, effect: 'temperament', amount: 3 }
            ],
            bowling: [
                { name: 'Pace Training', cost: 15, effect: 'pace', amount: 3 },
                { name: 'Accuracy Practice', cost: 12, effect: 'accuracy', amount: 2 },
                { name: 'Swing Bowling', cost: 18, effect: 'swing', amount: 3 },
                { name: 'Spin Bowling', cost: 16, effect: 'spin', amount: 3 },
                { name: 'Variation Training', cost: 14, effect: 'variation', amount: 2 }
            ],
            fielding: [
                { name: 'Catching Practice', cost: 8, effect: 'catching', amount: 2 },
                { name: 'Throwing Accuracy', cost: 10, effect: 'throwing', amount: 2 },
                { name: 'Agility Training', cost: 12, effect: 'agility', amount: 3 },
                { name: 'Anticipation', cost: 15, effect: 'anticipation', amount: 3 }
            ],
            fitness: [
                { name: 'Stamina Training', cost: 10, effect: 'stamina', amount: 3 },
                { name: 'Strength Training', cost: 12, effect: 'strength', amount: 2 },
                { name: 'Speed Training', cost: 14, effect: 'speed', amount: 3 },
                { name: 'Flexibility', cost: 8, effect: 'flexibility', amount: 2 }
            ]
        };
        
        this.init();
    }
    
    init() {
        this.createPlayer();
        this.generateAvailableContracts();
        this.updateCareerStage();
    }
    
    createPlayer() {
        this.player = new Player({
            name: 'Your Player',
            role: 'all-rounder',
            batting: this.careerData.skills.batting,
            bowling: this.careerData.skills.bowling,
            fielding: this.careerData.skills.fielding,
            fitness: this.careerData.skills.fitness
        });
    }
    
    // Career progression
    updateCareerStage() {
        const currentStage = this.careerStages.find(stage => 
            this.careerData.level >= stage.level
        );
        
        if (currentStage) {
            this.careerData.stage = currentStage.name;
            this.generateAvailableContracts();
        }
    }
    
    addExperience(amount) {
        this.careerData.experience += amount;
        
        // Check for level up
        while (this.careerData.experience >= this.careerData.experienceToNext) {
            this.levelUp();
        }
    }
    
    levelUp() {
        this.careerData.level++;
        this.careerData.experience -= this.careerData.experienceToNext;
        this.careerData.experienceToNext = Math.floor(this.careerData.experienceToNext * 1.2);
        this.careerData.training.availablePoints += 2;
        
        // Update career stage
        this.updateCareerStage();
        
        // Trigger level up event
        this.onLevelUp();
    }
    
    onLevelUp() {
        console.log(`Level up! Now level ${this.careerData.level}`);
        // Could trigger UI notification here
    }
    
    // Contract system
    generateAvailableContracts() {
        this.availableContracts = [];
        const currentStage = this.careerStages.find(stage => 
            this.careerData.level >= stage.level
        );
        
        if (!currentStage) return;
        
        // Generate contracts based on current stage
        currentStage.contracts.forEach(contractType => {
            const contract = this.generateContract(contractType);
            if (contract) {
                this.availableContracts.push(contract);
            }
        });
    }
    
    generateContract(type) {
        const contractTemplates = {
            domestic: {
                name: 'Domestic League',
                duration: 12, // months
                baseSalary: 5000,
                matchFee: 500,
                reputationRequirement: 0,
                skillRequirement: 40
            },
            franchise: {
                name: 'Franchise League',
                duration: 6,
                baseSalary: 15000,
                matchFee: 2000,
                reputationRequirement: 100,
                skillRequirement: 60
            },
            international: {
                name: 'International Team',
                duration: 24,
                baseSalary: 50000,
                matchFee: 10000,
                reputationRequirement: 500,
                skillRequirement: 70
            },
            premier: {
                name: 'Premier League',
                duration: 8,
                baseSalary: 100000,
                matchFee: 25000,
                reputationRequirement: 1000,
                skillRequirement: 80
            },
            elite: {
                name: 'Elite League',
                duration: 12,
                baseSalary: 200000,
                matchFee: 50000,
                reputationRequirement: 2000,
                skillRequirement: 90
            }
        };
        
        const template = contractTemplates[type];
        if (!template) return null;
        
        // Check if player meets requirements
        if (this.careerData.reputation < template.reputationRequirement) return null;
        
        const averageSkill = this.getAverageSkill();
        if (averageSkill < template.skillRequirement) return null;
        
        return {
            id: `contract_${Date.now()}`,
            type: type,
            name: template.name,
            duration: template.duration,
            baseSalary: template.baseSalary,
            matchFee: template.matchFee,
            reputationRequirement: template.reputationRequirement,
            skillRequirement: template.skillRequirement,
            status: 'available'
        };
    }
    
    getAverageSkill() {
        const skills = this.careerData.skills;
        const battingAvg = Object.values(skills.batting).reduce((sum, val) => sum + val, 0) / 5;
        const bowlingAvg = Object.values(skills.bowling).reduce((sum, val) => sum + val, 0) / 5;
        const fieldingAvg = Object.values(skills.fielding).reduce((sum, val) => sum + val, 0) / 4;
        const fitnessAvg = Object.values(skills.fitness).reduce((sum, val) => sum + val, 0) / 4;
        
        return (battingAvg + bowlingAvg + fieldingAvg + fitnessAvg) / 4;
    }
    
    signContract(contractId) {
        const contract = this.availableContracts.find(c => c.id === contractId);
        if (!contract) return false;
        
        // Check if player meets requirements
        if (this.careerData.reputation < contract.reputationRequirement) return false;
        
        const averageSkill = this.getAverageSkill();
        if (averageSkill < contract.skillRequirement) return false;
        
        // Sign contract
        contract.status = 'active';
        this.careerData.currentContract = contract;
        this.careerData.contracts.push(contract);
        
        // Remove from available contracts
        this.availableContracts = this.availableContracts.filter(c => c.id !== contractId);
        
        return true;
    }
    
    // Training system
    startTraining(module) {
        if (this.careerData.training.availablePoints < module.cost) return false;
        
        this.careerData.training.availablePoints -= module.cost;
        this.careerData.training.sessionsCompleted++;
        
        // Apply training effect
        this.applyTrainingEffect(module);
        
        // Add experience
        this.addExperience(module.cost * 2);
        
        return true;
    }
    
    applyTrainingEffect(module) {
        const skillCategory = this.getSkillCategory(module.effect);
        if (skillCategory) {
            const currentValue = this.careerData.skills[skillCategory][module.effect];
            const newValue = Math.min(100, currentValue + module.amount);
            this.careerData.skills[skillCategory][module.effect] = newValue;
            
            // Update player skills
            if (this.player) {
                this.player.skills[skillCategory][module.effect] = newValue;
            }
        }
    }
    
    getSkillCategory(skill) {
        const categories = {
            technique: 'batting',
            power: 'batting',
            timing: 'batting',
            placement: 'batting',
            temperament: 'batting',
            pace: 'bowling',
            accuracy: 'bowling',
            swing: 'bowling',
            spin: 'bowling',
            variation: 'bowling',
            catching: 'fielding',
            throwing: 'fielding',
            agility: 'fielding',
            anticipation: 'fielding',
            stamina: 'fitness',
            strength: 'fitness',
            speed: 'fitness',
            flexibility: 'fitness'
        };
        
        return categories[skill];
    }
    
    // Match participation
    participateInMatch(matchResult) {
        // Update statistics
        this.updateStatistics(matchResult);
        
        // Add experience based on performance
        const experience = this.calculateMatchExperience(matchResult);
        this.addExperience(experience);
        
        // Update reputation
        this.updateReputation(matchResult);
        
        // Check for achievements
        this.checkAchievements(matchResult);
    }
    
    updateStatistics(matchResult) {
        const stats = this.careerData.statistics;
        
        stats.matches++;
        stats.runs += matchResult.runs || 0;
        stats.balls += matchResult.balls || 0;
        stats.wickets += matchResult.wickets || 0;
        stats.overs += matchResult.overs || 0;
        stats.catches += matchResult.catches || 0;
        stats.stumpings += matchResult.stumpings || 0;
        
        // Recalculate averages
        if (stats.balls > 0) {
            stats.battingAverage = stats.runs / stats.matches;
            stats.strikeRate = (stats.runs / stats.balls) * 100;
        }
        
        if (stats.overs > 0) {
            stats.bowlingAverage = stats.runs / stats.wickets;
            stats.economyRate = stats.runs / stats.overs;
        }
    }
    
    calculateMatchExperience(matchResult) {
        let experience = 10; // Base experience for playing
        
        // Bonus for good performance
        if (matchResult.runs > 50) experience += 20;
        if (matchResult.runs > 100) experience += 30;
        if (matchResult.wickets > 3) experience += 25;
        if (matchResult.wickets > 5) experience += 35;
        
        // Bonus for match result
        if (matchResult.won) experience += 15;
        
        return experience;
    }
    
    updateReputation(matchResult) {
        let reputationGain = 5; // Base reputation gain
        
        // Bonus for good performance
        if (matchResult.runs > 50) reputationGain += 10;
        if (matchResult.runs > 100) reputationGain += 20;
        if (matchResult.wickets > 3) reputationGain += 15;
        if (matchResult.wickets > 5) reputationGain += 25;
        
        // Bonus for match result
        if (matchResult.won) reputationGain += 10;
        
        this.careerData.reputation += reputationGain;
    }
    
    checkAchievements(matchResult) {
        const achievements = this.careerData.achievements;
        
        // Check for new achievements
        if (matchResult.runs >= 100 && !achievements.includes('century')) {
            achievements.push('century');
            this.addExperience(50);
        }
        
        if (matchResult.wickets >= 5 && !achievements.includes('five_wickets')) {
            achievements.push('five_wickets');
            this.addExperience(50);
        }
        
        if (this.careerData.statistics.matches >= 10 && !achievements.includes('experienced')) {
            achievements.push('experienced');
            this.addExperience(30);
        }
        
        if (this.careerData.statistics.runs >= 1000 && !achievements.includes('run_machine')) {
            achievements.push('run_machine');
            this.addExperience(100);
        }
        
        if (this.careerData.statistics.wickets >= 50 && !achievements.includes('wicket_taker')) {
            achievements.push('wicket_taker');
            this.addExperience(100);
        }
    }
    
    // Getters
    getPlayer() {
        return this.player;
    }
    
    getCareerData() {
        return this.careerData;
    }
    
    getAvailableContracts() {
        return this.availableContracts;
    }
    
    getTrainingModules() {
        return this.trainingModules;
    }
    
    getStatistics() {
        return this.careerData.statistics;
    }
    
    getSkills() {
        return this.careerData.skills;
    }
    
    getAchievements() {
        return this.careerData.achievements;
    }
    
    getCurrentContract() {
        return this.careerData.currentContract;
    }
    
    getLevel() {
        return this.careerData.level;
    }
    
    getExperience() {
        return this.careerData.experience;
    }
    
    getExperienceToNext() {
        return this.careerData.experienceToNext;
    }
    
    getReputation() {
        return this.careerData.reputation;
    }
    
    getAvailableTrainingPoints() {
        return this.careerData.training.availablePoints;
    }
    
    // Update method
    update(deltaTime) {
        // Update any continuous career mode logic
        // This could include contract expiration, training progress, etc.
    }
}