/**
 * Cricket Pro Simulation - Stadium Model
 * Handles realistic stadium environments with dynamic lighting and weather
 */

class Stadium {
    constructor(data) {
        this.id = data.id || this.generateId();
        this.name = data.name || 'Cricket Ground';
        this.location = data.location || { city: 'Unknown', country: 'Unknown' };
        this.capacity = data.capacity || 50000;
        this.dimensions = data.dimensions || {
            boundary: 70, // meters
            pitchLength: 20.12, // meters
            pitchWidth: 3.05 // meters
        };
        
        // Stadium features
        this.features = {
            floodlights: data.features?.floodlights || true,
            roof: data.features?.roof || false,
            retractableRoof: data.features?.retractableRoof || false,
            grass: data.features?.grass || 'natural',
            drainage: data.features?.drainage || 'excellent',
            sightScreens: data.features?.sightScreens || true,
            scoreboard: data.features?.scoreboard || 'electronic',
            replayScreen: data.features?.replayScreen || true
        };
        
        // Weather conditions
        this.weather = {
            temperature: data.weather?.temperature || 25, // °C
            humidity: data.weather?.humidity || 0.5, // 0-1
            windSpeed: data.weather?.windSpeed || 0, // m/s
            windDirection: data.weather?.windDirection || 0, // radians
            cloudCover: data.weather?.cloudCover || 0.3, // 0-1
            precipitation: data.weather?.precipitation || 0, // 0-1
            visibility: data.weather?.visibility || 1.0 // 0-1
        };
        
        // Time of day
        this.timeOfDay = data.timeOfDay || 'day'; // day, evening, night
        this.sunPosition = this.calculateSunPosition();
        
        // Stadium geometry
        this.geometry = this.createStadiumGeometry();
        
        // Lighting system
        this.lighting = this.createLightingSystem();
        
        // Crowd system
        this.crowd = this.createCrowdSystem();
        
        // Atmosphere effects
        this.atmosphere = this.createAtmosphereSystem();
        
        // 3D model data
        this.model = this.create3DModel();
    }
    
    createStadiumGeometry() {
        return {
            // Main structure
            stands: this.createStandsGeometry(),
            roof: this.createRoofGeometry(),
            floodlights: this.createFloodlightGeometry(),
            
            // Playing area
            field: this.createFieldGeometry(),
            pitch: this.createPitchGeometry(),
            boundary: this.createBoundaryGeometry(),
            
            // Infrastructure
            pavilion: this.createPavilionGeometry(),
            scoreboard: this.createScoreboardGeometry(),
            sightScreens: this.createSightScreenGeometry(),
            
            // Details
            grass: this.createGrassGeometry(),
            trees: this.createTreesGeometry(),
            buildings: this.createBuildingsGeometry()
        };
    }
    
    createStandsGeometry() {
        const stands = [];
        const sections = 16; // Number of stand sections around the ground
        
        for (let i = 0; i < sections; i++) {
            const angle = (i / sections) * Math.PI * 2;
            const radius = this.dimensions.boundary + 20;
            
            stands.push({
                type: 'stand',
                position: {
                    x: Math.cos(angle) * radius,
                    y: 0,
                    z: Math.sin(angle) * radius
                },
                rotation: { x: 0, y: angle, z: 0 },
                geometry: {
                    width: 30,
                    height: 15,
                    depth: 20,
                    tiers: 3,
                    capacity: Math.floor(this.capacity / sections)
                },
                materials: {
                    structure: 'concrete',
                    seats: 'plastic',
                    roof: 'metal'
                }
            });
        }
        
        return stands;
    }
    
    createRoofGeometry() {
        if (!this.features.roof) return null;
        
        return {
            type: 'roof',
            geometry: {
                shape: 'dome',
                radius: this.dimensions.boundary + 30,
                height: 25,
                segments: 32
            },
            materials: {
                surface: 'glass',
                structure: 'steel'
            },
            retractable: this.features.retractableRoof,
            openPosition: 0.8 // 0 = closed, 1 = fully open
        };
    }
    
    createFloodlightGeometry() {
        if (!this.features.floodlights) return [];
        
        const floodlights = [];
        const towers = 8;
        
        for (let i = 0; i < towers; i++) {
            const angle = (i / towers) * Math.PI * 2;
            const radius = this.dimensions.boundary + 15;
            
            floodlights.push({
                type: 'floodlight',
                position: {
                    x: Math.cos(angle) * radius,
                    y: 25,
                    z: Math.sin(angle) * radius
                },
                rotation: { x: -0.3, y: angle, z: 0 },
                geometry: {
                    height: 30,
                    width: 2,
                    depth: 2
                },
                lighting: {
                    intensity: 1.0,
                    color: 0xffffff,
                    range: 100,
                    angle: Math.PI / 3
                }
            });
        }
        
        return floodlights;
    }
    
    createFieldGeometry() {
        return {
            type: 'field',
            geometry: {
                shape: 'oval',
                majorAxis: (this.dimensions.boundary + 10) * 2,
                minorAxis: (this.dimensions.boundary + 10) * 2,
                height: 0.1
            },
            materials: {
                surface: this.features.grass,
                texture: 'grass_pattern',
                quality: 'high'
            },
            physics: {
                friction: 0.8,
                bounce: 0.6,
                hardness: 0.7
            }
        };
    }
    
    createPitchGeometry() {
        return {
            type: 'pitch',
            geometry: {
                length: this.dimensions.pitchLength,
                width: this.dimensions.pitchWidth,
                height: 0.05
            },
            materials: {
                surface: 'clay',
                texture: 'pitch_pattern',
                wear: 0.3
            },
            physics: {
                friction: 0.9,
                bounce: 0.8,
                hardness: 0.9
            },
            markings: {
                creases: true,
                stumps: true,
                poppingCrease: true,
                bowlingCrease: true,
                returnCrease: true
            }
        };
    }
    
    createBoundaryGeometry() {
        return {
            type: 'boundary',
            geometry: {
                shape: 'oval',
                majorAxis: this.dimensions.boundary * 2,
                minorAxis: this.dimensions.boundary * 2,
                height: 0.02
            },
            materials: {
                surface: 'rope',
                color: 0xffffff
            },
            physics: {
                collision: true,
                boundary: true
            }
        };
    }
    
    createPavilionGeometry() {
        return {
            type: 'pavilion',
            position: { x: 0, y: 0, z: -this.dimensions.boundary - 30 },
            geometry: {
                width: 60,
                height: 20,
                depth: 40
            },
            materials: {
                structure: 'brick',
                roof: 'tile',
                windows: 'glass'
            },
            features: {
                dressingRooms: true,
                mediaCenter: true,
                hospitality: true,
                offices: true
            }
        };
    }
    
    createScoreboardGeometry() {
        return {
            type: 'scoreboard',
            position: { x: 0, y: 0, z: this.dimensions.boundary + 20 },
            geometry: {
                width: 20,
                height: 10,
                depth: 2
            },
            materials: {
                screen: 'led',
                frame: 'metal'
            },
            features: {
                electronic: this.features.scoreboard === 'electronic',
                replay: this.features.replayScreen,
                statistics: true,
                graphics: true
            }
        };
    }
    
    createSightScreenGeometry() {
        if (!this.features.sightScreens) return [];
        
        return [
            {
                type: 'sightScreen',
                position: { x: -this.dimensions.boundary - 10, y: 0, z: 0 },
                geometry: {
                    width: 15,
                    height: 8,
                    depth: 0.5
                },
                materials: {
                    surface: 'white',
                    frame: 'metal'
                }
            },
            {
                type: 'sightScreen',
                position: { x: this.dimensions.boundary + 10, y: 0, z: 0 },
                geometry: {
                    width: 15,
                    height: 8,
                    depth: 0.5
                },
                materials: {
                    surface: 'white',
                    frame: 'metal'
                }
            }
        ];
    }
    
    createGrassGeometry() {
        return {
            type: 'grass',
            geometry: {
                pattern: 'natural',
                density: 0.8,
                height: 0.02,
                color: 0x228B22
            },
            materials: {
                surface: 'grass',
                texture: 'grass_detail',
                normal: 'grass_normal'
            },
            physics: {
                softness: 0.3,
                friction: 0.8
            }
        };
    }
    
    createTreesGeometry() {
        const trees = [];
        const treeCount = 20;
        
        for (let i = 0; i < treeCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = this.dimensions.boundary + 40 + Math.random() * 20;
            
            trees.push({
                type: 'tree',
                position: {
                    x: Math.cos(angle) * radius,
                    y: 0,
                    z: Math.sin(angle) * radius
                },
                geometry: {
                    height: 8 + Math.random() * 12,
                    trunkRadius: 0.3 + Math.random() * 0.2,
                    crownRadius: 3 + Math.random() * 2
                },
                materials: {
                    trunk: 'bark',
                    leaves: 'foliage'
                }
            });
        }
        
        return trees;
    }
    
    createBuildingsGeometry() {
        const buildings = [];
        const buildingCount = 10;
        
        for (let i = 0; i < buildingCount; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = this.dimensions.boundary + 60 + Math.random() * 40;
            
            buildings.push({
                type: 'building',
                position: {
                    x: Math.cos(angle) * radius,
                    y: 0,
                    z: Math.sin(angle) * radius
                },
                geometry: {
                    width: 10 + Math.random() * 20,
                    height: 15 + Math.random() * 25,
                    depth: 10 + Math.random() * 20
                },
                materials: {
                    walls: 'brick',
                    roof: 'tile',
                    windows: 'glass'
                }
            });
        }
        
        return buildings;
    }
    
    createLightingSystem() {
        return {
            ambient: {
                color: 0x404040,
                intensity: 0.4
            },
            directional: {
                color: 0xffffff,
                intensity: this.calculateSunIntensity(),
                position: this.sunPosition,
                castShadow: true
            },
            floodlights: this.geometry.floodlights.map(light => light.lighting),
            atmosphere: {
                fog: this.weather.visibility < 0.8,
                fogColor: 0xcccccc,
                fogDensity: 1 - this.weather.visibility
            }
        };
    }
    
    createCrowdSystem() {
        return {
            totalCapacity: this.capacity,
            currentAttendance: Math.floor(this.capacity * 0.8), // 80% attendance
            distribution: this.calculateCrowdDistribution(),
            animation: {
                wave: true,
                cheering: true,
                mexicanWave: true,
                individualMovement: true
            },
            reactions: {
                boundary: 'cheer',
                wicket: 'applause',
                six: 'roar',
                four: 'cheer',
                dotBall: 'murmur'
            }
        };
    }
    
    createAtmosphereSystem() {
        return {
            weather: this.weather,
            timeOfDay: this.timeOfDay,
            atmosphere: {
                haze: this.weather.humidity > 0.7,
                dust: this.weather.humidity < 0.3,
                rain: this.weather.precipitation > 0.1,
                wind: this.weather.windSpeed > 2
            },
            effects: {
                particles: this.generateParticleEffects(),
                lighting: this.calculateAtmosphericLighting(),
                sound: this.generateAtmosphericSound()
            }
        };
    }
    
    create3DModel() {
        return {
            meshes: this.geometry,
            materials: this.createMaterials(),
            textures: this.createTextures(),
            lighting: this.lighting,
            atmosphere: this.atmosphere
        };
    }
    
    createMaterials() {
        return {
            concrete: {
                type: 'phong',
                color: 0x888888,
                shininess: 10,
                map: 'concrete_texture',
                normalMap: 'concrete_normal'
            },
            grass: {
                type: 'phong',
                color: 0x228B22,
                shininess: 5,
                map: 'grass_texture',
                normalMap: 'grass_normal'
            },
            metal: {
                type: 'phong',
                color: 0xcccccc,
                shininess: 100,
                map: 'metal_texture',
                normalMap: 'metal_normal'
            },
            glass: {
                type: 'phong',
                color: 0xffffff,
                shininess: 200,
                transparent: true,
                opacity: 0.8,
                map: 'glass_texture'
            },
            clay: {
                type: 'phong',
                color: 0x8B4513,
                shininess: 20,
                map: 'clay_texture',
                normalMap: 'clay_normal'
            }
        };
    }
    
    createTextures() {
        return {
            grass_texture: this.generateGrassTexture(),
            concrete_texture: this.generateConcreteTexture(),
            metal_texture: this.generateMetalTexture(),
            glass_texture: this.generateGlassTexture(),
            clay_texture: this.generateClayTexture()
        };
    }
    
    generateGrassTexture() {
        return {
            type: 'procedural',
            pattern: 'grass',
            color: 0x228B22,
            variation: 0.3,
            detail: 'high'
        };
    }
    
    generateConcreteTexture() {
        return {
            type: 'procedural',
            pattern: 'concrete',
            color: 0x888888,
            roughness: 0.8,
            detail: 'medium'
        };
    }
    
    generateMetalTexture() {
        return {
            type: 'procedural',
            pattern: 'metal',
            color: 0xcccccc,
            shininess: 0.9,
            detail: 'high'
        };
    }
    
    generateGlassTexture() {
        return {
            type: 'procedural',
            pattern: 'glass',
            color: 0xffffff,
            transparency: 0.8,
            reflection: 0.9
        };
    }
    
    generateClayTexture() {
        return {
            type: 'procedural',
            pattern: 'clay',
            color: 0x8B4513,
            roughness: 0.6,
            detail: 'medium'
        };
    }
    
    calculateSunPosition() {
        const timeOfDay = this.timeOfDay;
        const hour = timeOfDay === 'day' ? 12 : timeOfDay === 'evening' ? 18 : 20;
        
        // Calculate sun position based on time of day
        const sunAngle = (hour - 6) / 12 * Math.PI; // 6 AM to 6 PM
        const sunHeight = Math.sin(sunAngle) * 0.8 + 0.2; // 0.2 to 1.0
        const sunAzimuth = Math.PI; // South
        
        return {
            x: Math.sin(sunAzimuth) * Math.cos(sunAngle),
            y: sunHeight,
            z: Math.cos(sunAzimuth) * Math.cos(sunAngle)
        };
    }
    
    calculateSunIntensity() {
        const timeOfDay = this.timeOfDay;
        const cloudCover = this.weather.cloudCover;
        
        let intensity = 1.0;
        
        switch (timeOfDay) {
            case 'day':
                intensity = 1.0;
                break;
            case 'evening':
                intensity = 0.6;
                break;
            case 'night':
                intensity = 0.1;
                break;
        }
        
        // Reduce intensity based on cloud cover
        intensity *= (1 - cloudCover * 0.5);
        
        return Math.max(0.1, intensity);
    }
    
    calculateCrowdDistribution() {
        const sections = 16;
        const distribution = [];
        
        for (let i = 0; i < sections; i++) {
            // Some sections are more popular than others
            const popularity = 0.5 + Math.random() * 0.5;
            const attendance = Math.floor((this.capacity / sections) * popularity);
            distribution.push(attendance);
        }
        
        return distribution;
    }
    
    generateParticleEffects() {
        const effects = [];
        
        // Dust particles on dry days
        if (this.weather.humidity < 0.3) {
            effects.push({
                type: 'dust',
                count: 100,
                size: 0.01,
                color: 0xdddddd,
                speed: this.weather.windSpeed * 0.1
            });
        }
        
        // Rain particles
        if (this.weather.precipitation > 0.1) {
            effects.push({
                type: 'rain',
                count: 1000,
                size: 0.005,
                color: 0x87CEEB,
                speed: this.weather.precipitation * 2
            });
        }
        
        // Fog particles
        if (this.weather.visibility < 0.8) {
            effects.push({
                type: 'fog',
                count: 200,
                size: 0.1,
                color: 0xcccccc,
                density: 1 - this.weather.visibility
            });
        }
        
        return effects;
    }
    
    calculateAtmosphericLighting() {
        const lighting = {
            ambient: 0.4,
            directional: this.calculateSunIntensity(),
            color: 0xffffff
        };
        
        // Adjust lighting based on weather
        if (this.weather.cloudCover > 0.5) {
            lighting.ambient += 0.2;
            lighting.directional *= 0.7;
        }
        
        if (this.weather.precipitation > 0.1) {
            lighting.ambient *= 0.8;
            lighting.directional *= 0.6;
        }
        
        if (this.weather.visibility < 0.8) {
            lighting.ambient *= 0.6;
            lighting.directional *= 0.4;
        }
        
        return lighting;
    }
    
    generateAtmosphericSound() {
        const sounds = [];
        
        // Wind sounds
        if (this.weather.windSpeed > 1) {
            sounds.push({
                type: 'wind',
                volume: this.weather.windSpeed * 0.1,
                loop: true
            });
        }
        
        // Rain sounds
        if (this.weather.precipitation > 0.1) {
            sounds.push({
                type: 'rain',
                volume: this.weather.precipitation * 0.3,
                loop: true
            });
        }
        
        // Crowd ambience
        sounds.push({
            type: 'crowd_ambience',
            volume: 0.3,
            loop: true
        });
        
        return sounds;
    }
    
    // Weather updates
    updateWeather(newWeather) {
        this.weather = { ...this.weather, ...newWeather };
        this.updateWeatherEffects();
    }
    
    updateWeatherEffects() {
        // Update lighting based on new weather
        this.lighting.directional.intensity = this.calculateSunIntensity();
        this.lighting.directional.position = this.calculateSunPosition();
        
        // Update atmosphere
        this.atmosphere.weather = this.weather;
        this.atmosphere.effects.particles = this.generateParticleEffects();
        this.atmosphere.effects.lighting = this.calculateAtmosphericLighting();
        this.atmosphere.effects.sound = this.generateAtmosphericSound();
    }
    
    // Time of day updates
    updateTimeOfDay(timeOfDay) {
        this.timeOfDay = timeOfDay;
        this.sunPosition = this.calculateSunPosition();
        this.lighting.directional.intensity = this.calculateSunIntensity();
        this.lighting.directional.position = this.sunPosition;
    }
    
    // Crowd reactions
    triggerCrowdReaction(event) {
        const reaction = this.crowd.reactions[event];
        if (reaction) {
            // Trigger crowd animation and sound
            this.animateCrowdReaction(reaction);
            this.playCrowdSound(reaction);
        }
    }
    
    animateCrowdReaction(reaction) {
        // Animate crowd based on reaction type
        switch (reaction) {
            case 'cheer':
                this.animateCrowdCheering();
                break;
            case 'applause':
                this.animateCrowdApplause();
                break;
            case 'roar':
                this.animateCrowdRoar();
                break;
            case 'murmur':
                this.animateCrowdMurmur();
                break;
        }
    }
    
    animateCrowdCheering() {
        // Implement crowd cheering animation
        console.log('Crowd is cheering!');
    }
    
    animateCrowdApplause() {
        // Implement crowd applause animation
        console.log('Crowd is applauding!');
    }
    
    animateCrowdRoar() {
        // Implement crowd roar animation
        console.log('Crowd is roaring!');
    }
    
    animateCrowdMurmur() {
        // Implement crowd murmur animation
        console.log('Crowd is murmuring...');
    }
    
    playCrowdSound(reaction) {
        // Play appropriate crowd sound
        console.log(`Playing crowd sound: ${reaction}`);
    }
    
    // Utility methods
    generateId() {
        return 'stadium_' + Math.random().toString(36).substr(2, 9);
    }
    
    getDimensions() {
        return { ...this.dimensions };
    }
    
    getWeather() {
        return { ...this.weather };
    }
    
    getLighting() {
        return { ...this.lighting };
    }
    
    getCrowd() {
        return { ...this.crowd };
    }
    
    getAtmosphere() {
        return { ...this.atmosphere };
    }
}