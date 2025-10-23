/**
 * Cricket Pro Simulation - Player Model
 * Handles detailed player models with realistic animations and physics
 */

class Player {
    constructor(data) {
        this.id = data.id || this.generateId();
        this.name = data.name || 'Player';
        this.team = data.team || null;
        this.role = data.role || 'batsman'; // batsman, bowler, all-rounder, wicket-keeper
        
        // Physical attributes
        this.physical = {
            height: data.height || 1.75, // meters
            weight: data.weight || 70, // kg
            build: data.build || 'athletic', // slim, athletic, muscular, stocky
            skinTone: data.skinTone || 'medium',
            hairColor: data.hairColor || 'black',
            hairStyle: data.hairStyle || 'short'
        };
        
        // Position and movement
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.animationState = 'idle';
        this.animationFrame = 0;
        this.animationSpeed = 1.0;
        
        // Cricket skills
        this.skills = {
            batting: {
                technique: data.batting?.technique || 70,
                power: data.batting?.power || 70,
                timing: data.batting?.timing || 70,
                placement: data.batting?.placement || 70,
                temperament: data.batting?.temperament || 70
            },
            bowling: {
                pace: data.bowling?.pace || 70,
                accuracy: data.bowling?.accuracy || 70,
                swing: data.bowling?.swing || 70,
                spin: data.bowling?.spin || 70,
                variation: data.bowling?.variation || 70
            },
            fielding: {
                catching: data.fielding?.catching || 70,
                throwing: data.fielding?.throwing || 70,
                agility: data.fielding?.agility || 70,
                anticipation: data.fielding?.anticipation || 70
            },
            fitness: {
                stamina: data.fitness?.stamina || 70,
                strength: data.fitness?.strength || 70,
                speed: data.fitness?.speed || 70,
                flexibility: data.fitness?.flexibility || 70
            }
        };
        
        // Career statistics
        this.stats = {
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
        };
        
        // Equipment
        this.equipment = {
            bat: data.equipment?.bat || 'standard',
            gloves: data.equipment?.gloves || 'standard',
            pads: data.equipment?.pads || 'standard',
            helmet: data.equipment?.helmet || 'standard',
            shoes: data.equipment?.shoes || 'standard'
        };
        
        // Animation data
        this.animations = {
            idle: this.createIdleAnimation(),
            walking: this.createWalkingAnimation(),
            running: this.createRunningAnimation(),
            batting: this.createBattingAnimations(),
            bowling: this.createBowlingAnimations(),
            fielding: this.createFieldingAnimations(),
            celebrating: this.createCelebratingAnimation()
        };
        
        // 3D model data
        this.model = this.create3DModel();
        
        // AI behavior
        this.ai = {
            aggression: data.ai?.aggression || 0.5,
            riskTaking: data.ai?.riskTaking || 0.5,
            adaptability: data.ai?.adaptability || 0.5,
            pressureHandling: data.ai?.pressureHandling || 0.5
        };
    }
    
    // 3D Model Creation
    create3DModel() {
        return {
            meshes: this.createPlayerMeshes(),
            materials: this.createPlayerMaterials(),
            skeleton: this.createPlayerSkeleton(),
            textures: this.createPlayerTextures()
        };
    }
    
    createPlayerMeshes() {
        return {
            head: this.createHeadMesh(),
            torso: this.createTorsoMesh(),
            arms: this.createArmsMesh(),
            legs: this.createLegsMesh(),
            hands: this.createHandsMesh(),
            feet: this.createFeetMesh()
        };
    }
    
    createHeadMesh() {
        return {
            geometry: 'sphere',
            radius: 0.12,
            segments: 16,
            position: { x: 0, y: 1.6, z: 0 }
        };
    }
    
    createTorsoMesh() {
        return {
            geometry: 'cylinder',
            radius: 0.15,
            height: 0.4,
            position: { x: 0, y: 1.2, z: 0 }
        };
    }
    
    createArmsMesh() {
        return {
            left: {
                geometry: 'cylinder',
                radius: 0.05,
                height: 0.6,
                position: { x: -0.2, y: 1.2, z: 0 }
            },
            right: {
                geometry: 'cylinder',
                radius: 0.05,
                height: 0.6,
                position: { x: 0.2, y: 1.2, z: 0 }
            }
        };
    }
    
    createLegsMesh() {
        return {
            left: {
                geometry: 'cylinder',
                radius: 0.08,
                height: 0.8,
                position: { x: -0.08, y: 0.4, z: 0 }
            },
            right: {
                geometry: 'cylinder',
                radius: 0.08,
                height: 0.8,
                position: { x: 0.08, y: 0.4, z: 0 }
            }
        };
    }
    
    createHandsMesh() {
        return {
            left: {
                geometry: 'sphere',
                radius: 0.04,
                position: { x: -0.2, y: 0.9, z: 0 }
            },
            right: {
                geometry: 'sphere',
                radius: 0.04,
                position: { x: 0.2, y: 0.9, z: 0 }
            }
        };
    }
    
    createFeetMesh() {
        return {
            left: {
                geometry: 'box',
                width: 0.12,
                height: 0.06,
                depth: 0.3,
                position: { x: -0.08, y: 0.06, z: 0.1 }
            },
            right: {
                geometry: 'box',
                width: 0.12,
                height: 0.06,
                depth: 0.3,
                position: { x: 0.08, y: 0.06, z: 0.1 }
            }
        };
    }
    
    createPlayerMaterials() {
        return {
            skin: {
                type: 'phong',
                color: this.getSkinColor(),
                shininess: 30,
                map: 'skin_texture'
            },
            clothing: {
                type: 'phong',
                color: this.team?.primaryColor || 0x0066cc,
                shininess: 10,
                map: 'jersey_texture'
            },
            equipment: {
                type: 'phong',
                color: 0x8B4513,
                shininess: 50,
                map: 'equipment_texture'
            }
        };
    }
    
    getSkinColor() {
        const skinTones = {
            'light': 0xffdbac,
            'medium': 0xfd9841,
            'dark': 0x8d5524,
            'very_dark': 0x4a2c17
        };
        return skinTones[this.physical.skinTone] || skinTones['medium'];
    }
    
    createPlayerSkeleton() {
        return {
            bones: [
                { name: 'root', position: { x: 0, y: 0, z: 0 } },
                { name: 'spine', position: { x: 0, y: 0.8, z: 0 }, parent: 'root' },
                { name: 'chest', position: { x: 0, y: 1.2, z: 0 }, parent: 'spine' },
                { name: 'neck', position: { x: 0, y: 1.5, z: 0 }, parent: 'chest' },
                { name: 'head', position: { x: 0, y: 1.6, z: 0 }, parent: 'neck' },
                { name: 'left_shoulder', position: { x: -0.2, y: 1.3, z: 0 }, parent: 'chest' },
                { name: 'left_elbow', position: { x: -0.2, y: 1.0, z: 0 }, parent: 'left_shoulder' },
                { name: 'left_hand', position: { x: -0.2, y: 0.7, z: 0 }, parent: 'left_elbow' },
                { name: 'right_shoulder', position: { x: 0.2, y: 1.3, z: 0 }, parent: 'chest' },
                { name: 'right_elbow', position: { x: 0.2, y: 1.0, z: 0 }, parent: 'right_shoulder' },
                { name: 'right_hand', position: { x: 0.2, y: 0.7, z: 0 }, parent: 'right_elbow' },
                { name: 'left_hip', position: { x: -0.08, y: 0.8, z: 0 }, parent: 'spine' },
                { name: 'left_knee', position: { x: -0.08, y: 0.4, z: 0 }, parent: 'left_hip' },
                { name: 'left_ankle', position: { x: -0.08, y: 0.1, z: 0 }, parent: 'left_knee' },
                { name: 'right_hip', position: { x: 0.08, y: 0.8, z: 0 }, parent: 'spine' },
                { name: 'right_knee', position: { x: 0.08, y: 0.4, z: 0 }, parent: 'right_hip' },
                { name: 'right_ankle', position: { x: 0.08, y: 0.1, z: 0 }, parent: 'right_knee' }
            ]
        };
    }
    
    createPlayerTextures() {
        return {
            skin: this.generateSkinTexture(),
            jersey: this.generateJerseyTexture(),
            equipment: this.generateEquipmentTexture()
        };
    }
    
    generateSkinTexture() {
        // Generate procedural skin texture
        return {
            type: 'procedural',
            noise: 0.1,
            color: this.getSkinColor(),
            roughness: 0.8
        };
    }
    
    generateJerseyTexture() {
        return {
            type: 'procedural',
            pattern: 'jersey',
            primaryColor: this.team?.primaryColor || 0x0066cc,
            secondaryColor: this.team?.secondaryColor || 0xffffff,
            number: this.jerseyNumber || 1
        };
    }
    
    generateEquipmentTexture() {
        return {
            type: 'procedural',
            material: 'leather',
            wear: 0.3,
            color: 0x8B4513
        };
    }
    
    // Animation Creation
    createIdleAnimation() {
        return {
            duration: 2.0,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 1, rotation: { x: 0, y: 0.1, z: 0 } },
                { time: 2, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    createWalkingAnimation() {
        return {
            duration: 1.0,
            keyframes: [
                { time: 0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.25, position: { x: 0.1, y: 0.05, z: 0 }, rotation: { x: 0, y: 0.1, z: 0 } },
                { time: 0.5, position: { x: 0.2, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.75, position: { x: 0.3, y: 0.05, z: 0 }, rotation: { x: 0, y: -0.1, z: 0 } },
                { time: 1.0, position: { x: 0.4, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    createRunningAnimation() {
        return {
            duration: 0.6,
            keyframes: [
                { time: 0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.15, position: { x: 0.2, y: 0.1, z: 0 }, rotation: { x: 0, y: 0.2, z: 0 } },
                { time: 0.3, position: { x: 0.4, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.45, position: { x: 0.6, y: 0.1, z: 0 }, rotation: { x: 0, y: -0.2, z: 0 } },
                { time: 0.6, position: { x: 0.8, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    createBattingAnimations() {
        return {
            defensive: this.createDefensiveShotAnimation(),
            drive: this.createDriveShotAnimation(),
            pull: this.createPullShotAnimation(),
            sweep: this.createSweepShotAnimation(),
            cut: this.createCutShotAnimation(),
            hook: this.createHookShotAnimation()
        };
    }
    
    createDefensiveShotAnimation() {
        return {
            duration: 0.8,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.3, rotation: { x: 0, y: 0.2, z: 0.1 } },
                { time: 0.6, rotation: { x: 0, y: 0.1, z: 0.2 } },
                { time: 0.8, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    createDriveShotAnimation() {
        return {
            duration: 1.0,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.2, rotation: { x: 0, y: 0.3, z: 0.1 } },
                { time: 0.5, rotation: { x: 0, y: 0.6, z: 0.3 } },
                { time: 0.8, rotation: { x: 0, y: 0.4, z: 0.2 } },
                { time: 1.0, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    createPullShotAnimation() {
        return {
            duration: 0.9,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.2, rotation: { x: 0, y: -0.2, z: 0.1 } },
                { time: 0.5, rotation: { x: 0, y: -0.5, z: 0.4 } },
                { time: 0.8, rotation: { x: 0, y: -0.3, z: 0.2 } },
                { time: 0.9, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    createSweepShotAnimation() {
        return {
            duration: 1.1,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.3, rotation: { x: 0, y: 0.4, z: 0.2 } },
                { time: 0.6, rotation: { x: 0, y: 0.8, z: 0.5 } },
                { time: 0.9, rotation: { x: 0, y: 0.6, z: 0.3 } },
                { time: 1.1, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    createCutShotAnimation() {
        return {
            duration: 0.7,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.2, rotation: { x: 0, y: 0.1, z: 0.3 } },
                { time: 0.4, rotation: { x: 0, y: 0.2, z: 0.6 } },
                { time: 0.6, rotation: { x: 0, y: 0.1, z: 0.3 } },
                { time: 0.7, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    createHookShotAnimation() {
        return {
            duration: 0.8,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.2, rotation: { x: 0, y: -0.3, z: 0.2 } },
                { time: 0.5, rotation: { x: 0, y: -0.7, z: 0.6 } },
                { time: 0.7, rotation: { x: 0, y: -0.4, z: 0.3 } },
                { time: 0.8, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    createBowlingAnimations() {
        return {
            fast: this.createFastBowlingAnimation(),
            swing: this.createSwingBowlingAnimation(),
            spin: this.createSpinBowlingAnimation(),
            yorker: this.createYorkerBowlingAnimation(),
            bouncer: this.createBouncerBowlingAnimation()
        };
    }
    
    createFastBowlingAnimation() {
        return {
            duration: 1.2,
            keyframes: [
                { time: 0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.3, position: { x: 0, y: 0, z: -0.5 }, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.6, position: { x: 0, y: 0.2, z: -1.0 }, rotation: { x: 0, y: 0, z: 0.3 } },
                { time: 0.9, position: { x: 0, y: 0, z: -1.5 }, rotation: { x: 0, y: 0, z: 0.6 } },
                { time: 1.2, position: { x: 0, y: 0, z: -2.0 }, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    createSwingBowlingAnimation() {
        return {
            duration: 1.4,
            keyframes: [
                { time: 0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.3, position: { x: 0, y: 0, z: -0.5 }, rotation: { x: 0, y: 0.1, z: 0 } },
                { time: 0.6, position: { x: 0, y: 0.2, z: -1.0 }, rotation: { x: 0, y: 0.2, z: 0.2 } },
                { time: 0.9, position: { x: 0, y: 0, z: -1.5 }, rotation: { x: 0, y: 0.3, z: 0.4 } },
                { time: 1.2, position: { x: 0, y: 0, z: -2.0 }, rotation: { x: 0, y: 0.2, z: 0.2 } },
                { time: 1.4, position: { x: 0, y: 0, z: -2.5 }, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    createSpinBowlingAnimation() {
        return {
            duration: 1.6,
            keyframes: [
                { time: 0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.4, position: { x: 0, y: 0, z: -0.5 }, rotation: { x: 0, y: 0, z: 0.2 } },
                { time: 0.8, position: { x: 0, y: 0.3, z: -1.0 }, rotation: { x: 0, y: 0, z: 0.5 } },
                { time: 1.2, position: { x: 0, y: 0.1, z: -1.5 }, rotation: { x: 0, y: 0, z: 0.8 } },
                { time: 1.6, position: { x: 0, y: 0, z: -2.0 }, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    createYorkerBowlingAnimation() {
        return {
            duration: 1.0,
            keyframes: [
                { time: 0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.3, position: { x: 0, y: 0, z: -0.5 }, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.6, position: { x: 0, y: 0.1, z: -1.0 }, rotation: { x: 0, y: 0, z: 0.1 } },
                { time: 1.0, position: { x: 0, y: 0, z: -1.5 }, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    createBouncerBowlingAnimation() {
        return {
            duration: 1.3,
            keyframes: [
                { time: 0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.3, position: { x: 0, y: 0, z: -0.5 }, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.6, position: { x: 0, y: 0.4, z: -1.0 }, rotation: { x: 0, y: 0, z: 0.4 } },
                { time: 0.9, position: { x: 0, y: 0.2, z: -1.5 }, rotation: { x: 0, y: 0, z: 0.2 } },
                { time: 1.3, position: { x: 0, y: 0, z: -2.0 }, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    createFieldingAnimations() {
        return {
            catching: this.createCatchingAnimation(),
            throwing: this.createThrowingAnimation(),
            diving: this.createDivingAnimation(),
            running: this.createRunningAnimation()
        };
    }
    
    createCatchingAnimation() {
        return {
            duration: 0.5,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.3, rotation: { x: 0, y: 0, z: 0.3 } },
                { time: 0.5, rotation: { x: 0, y: 0, z: 0.1 } }
            ]
        };
    }
    
    createThrowingAnimation() {
        return {
            duration: 0.8,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.3, rotation: { x: 0, y: 0.2, z: 0.4 } },
                { time: 0.6, rotation: { x: 0, y: 0.4, z: 0.8 } },
                { time: 0.8, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    createDivingAnimation() {
        return {
            duration: 0.6,
            keyframes: [
                { time: 0, position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.3, position: { x: 0.5, y: 0.1, z: 0 }, rotation: { x: 0, y: 0, z: 0.3 } },
                { time: 0.6, position: { x: 1.0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0.6 } }
            ]
        };
    }
    
    createCelebratingAnimation() {
        return {
            duration: 2.0,
            keyframes: [
                { time: 0, rotation: { x: 0, y: 0, z: 0 } },
                { time: 0.5, rotation: { x: 0, y: 0, z: 0.2 } },
                { time: 1.0, rotation: { x: 0, y: 0, z: -0.2 } },
                { time: 1.5, rotation: { x: 0, y: 0, z: 0.2 } },
                { time: 2.0, rotation: { x: 0, y: 0, z: 0 } }
            ]
        };
    }
    
    // Animation Control
    setAnimation(animationName, speed = 1.0) {
        if (this.animations[animationName]) {
            this.animationState = animationName;
            this.animationFrame = 0;
            this.animationSpeed = speed;
        }
    }
    
    updateAnimation(deltaTime) {
        if (!this.animations[this.animationState]) return;
        
        const animation = this.animations[this.animationState];
        this.animationFrame += deltaTime * this.animationSpeed;
        
        if (this.animationFrame >= animation.duration) {
            this.animationFrame = 0;
            if (this.animationState !== 'idle') {
                this.setAnimation('idle');
            }
        }
        
        this.applyAnimationFrame(animation);
    }
    
    applyAnimationFrame(animation) {
        const keyframes = animation.keyframes;
        let currentKeyframe = null;
        let nextKeyframe = null;
        
        // Find current and next keyframes
        for (let i = 0; i < keyframes.length - 1; i++) {
            if (this.animationFrame >= keyframes[i].time && 
                this.animationFrame <= keyframes[i + 1].time) {
                currentKeyframe = keyframes[i];
                nextKeyframe = keyframes[i + 1];
                break;
            }
        }
        
        if (currentKeyframe && nextKeyframe) {
            // Interpolate between keyframes
            const t = (this.animationFrame - currentKeyframe.time) / 
                     (nextKeyframe.time - currentKeyframe.time);
            
            if (currentKeyframe.position) {
                this.position.x = this.lerp(currentKeyframe.position.x, nextKeyframe.position.x, t);
                this.position.y = this.lerp(currentKeyframe.position.y, nextKeyframe.position.y, t);
                this.position.z = this.lerp(currentKeyframe.position.z, nextKeyframe.position.z, t);
            }
            
            if (currentKeyframe.rotation) {
                this.rotation.x = this.lerp(currentKeyframe.rotation.x, nextKeyframe.rotation.x, t);
                this.rotation.y = this.lerp(currentKeyframe.rotation.y, nextKeyframe.rotation.y, t);
                this.rotation.z = this.lerp(currentKeyframe.rotation.z, nextKeyframe.rotation.z, t);
            }
        }
    }
    
    lerp(a, b, t) {
        return a + (b - a) * t;
    }
    
    // Skill calculations
    calculateBattingSkill() {
        const skills = this.skills.batting;
        return (skills.technique + skills.power + skills.timing + 
                skills.placement + skills.temperament) / 5;
    }
    
    calculateBowlingSkill() {
        const skills = this.skills.bowling;
        return (skills.pace + skills.accuracy + skills.swing + 
                skills.spin + skills.variation) / 5;
    }
    
    calculateFieldingSkill() {
        const skills = this.skills.fielding;
        return (skills.catching + skills.throwing + skills.agility + 
                skills.anticipation) / 4;
    }
    
    // AI Decision Making
    makeBattingDecision(ballData, matchSituation) {
        const aggression = this.ai.aggression;
        const riskTaking = this.ai.riskTaking;
        const pressureHandling = this.ai.pressureHandling;
        
        // Calculate shot selection based on AI traits
        const shotOptions = ['defensive', 'drive', 'pull', 'sweep', 'cut', 'hook'];
        const shotWeights = shotOptions.map(shot => {
            let weight = 0.2; // Base weight
            
            // Adjust based on aggression
            if (shot === 'defensive') weight -= aggression * 0.3;
            if (['drive', 'pull', 'hook'].includes(shot)) weight += aggression * 0.2;
            
            // Adjust based on risk taking
            if (['cut', 'hook'].includes(shot)) weight += riskTaking * 0.3;
            
            // Adjust based on pressure
            if (matchSituation.pressure > 0.7) {
                weight += pressureHandling * 0.2;
            }
            
            return Math.max(0, weight);
        });
        
        // Select shot based on weights
        const totalWeight = shotWeights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < shotOptions.length; i++) {
            random -= shotWeights[i];
            if (random <= 0) {
                return shotOptions[i];
            }
        }
        
        return 'defensive'; // Fallback
    }
    
    makeBowlingDecision(matchSituation) {
        const aggression = this.ai.aggression;
        const riskTaking = this.ai.riskTaking;
        
        const deliveryOptions = ['fast', 'swing', 'spin', 'yorker', 'bouncer'];
        const deliveryWeights = deliveryOptions.map(delivery => {
            let weight = 0.2;
            
            if (delivery === 'fast') weight += aggression * 0.3;
            if (delivery === 'bouncer') weight += riskTaking * 0.4;
            if (delivery === 'yorker') weight += (1 - riskTaking) * 0.3;
            
            return Math.max(0, weight);
        });
        
        const totalWeight = deliveryWeights.reduce((sum, weight) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        
        for (let i = 0; i < deliveryOptions.length; i++) {
            random -= deliveryWeights[i];
            if (random <= 0) {
                return deliveryOptions[i];
            }
        }
        
        return 'fast'; // Fallback
    }
    
    // Utility methods
    generateId() {
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    
    updateStats(type, value) {
        this.stats[type] += value;
        this.calculateAverages();
    }
    
    calculateAverages() {
        if (this.stats.balls > 0) {
            this.stats.battingAverage = this.stats.runs / this.stats.matches;
            this.stats.strikeRate = (this.stats.runs / this.stats.balls) * 100;
        }
        
        if (this.stats.overs > 0) {
            this.stats.bowlingAverage = this.stats.runs / this.stats.wickets;
            this.stats.economyRate = this.stats.runs / this.stats.overs;
        }
    }
    
    getPosition() {
        return { ...this.position };
    }
    
    getRotation() {
        return { ...this.rotation };
    }
    
    getVelocity() {
        return { ...this.velocity };
    }
    
    setPosition(x, y, z) {
        this.position = { x, y, z };
    }
    
    setRotation(x, y, z) {
        this.rotation = { x, y, z };
    }
    
    setVelocity(x, y, z) {
        this.velocity = { x, y, z };
    }
}