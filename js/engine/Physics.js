/**
 * Cricket Pro Simulation - Advanced Physics Engine
 * Handles realistic ball physics, player movement, and collision detection
 */

class Physics {
    constructor() {
        this.gravity = -9.81; // m/s²
        this.airResistance = 0.01;
        this.groundFriction = 0.8;
        this.bounceDamping = 0.7;
        
        // Ball physics properties
        this.ball = {
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            angularVelocity: { x: 0, y: 0, z: 0 },
            mass: 0.16, // kg (standard cricket ball)
            radius: 0.036, // m
            spin: { x: 0, y: 0, z: 0 },
            seam: { x: 0, y: 0, z: 1 }, // Seam orientation
            isInFlight: false,
            hasBounced: false,
            bounceCount: 0
        };
        
        // Pitch conditions
        this.pitch = {
            hardness: 0.7, // 0 = soft, 1 = hard
            moisture: 0.3, // 0 = dry, 1 = wet
            grass: 0.5, // 0 = no grass, 1 = thick grass
            cracks: 0.2, // 0 = no cracks, 1 = many cracks
            unevenness: 0.1 // 0 = flat, 1 = very uneven
        };
        
        // Weather effects
        this.weather = {
            windSpeed: 0, // m/s
            windDirection: 0, // radians
            humidity: 0.5, // 0-1
            temperature: 25, // °C
            airDensity: 1.225 // kg/m³ at sea level
        };
        
        // Physics objects
        this.objects = [];
        this.constraints = [];
        
        // Collision detection
        this.collisionSystem = new CollisionSystem();
        
        // Performance optimization
        this.timeStep = 1/60; // 60 FPS
        this.maxSubSteps = 3;
        this.accumulator = 0;
    }
    
    update(deltaTime) {
        this.accumulator += deltaTime / 1000; // Convert to seconds
        
        while (this.accumulator >= this.timeStep) {
            this.step(this.timeStep);
            this.accumulator -= this.timeStep;
        }
        
        // Update collision detection
        this.collisionSystem.update(this.objects);
    }
    
    step(deltaTime) {
        // Update ball physics
        this.updateBallPhysics(deltaTime);
        
        // Update other objects
        this.objects.forEach(obj => {
            if (obj.type === 'player') {
                this.updatePlayerPhysics(obj, deltaTime);
            }
        });
        
        // Apply constraints
        this.constraints.forEach(constraint => {
            constraint.solve();
        });
    }
    
    updateBallPhysics(deltaTime) {
        if (!this.ball.isInFlight) return;
        
        const ball = this.ball;
        
        // Apply gravity
        ball.velocity.y += this.gravity * deltaTime;
        
        // Apply air resistance
        const speed = Math.sqrt(
            ball.velocity.x ** 2 + 
            ball.velocity.y ** 2 + 
            ball.velocity.z ** 2
        );
        
        if (speed > 0) {
            const dragForce = 0.5 * this.weather.airDensity * speed * speed * 
                             this.ball.radius * this.ball.radius * Math.PI;
            
            ball.velocity.x -= (ball.velocity.x / speed) * dragForce * deltaTime / ball.mass;
            ball.velocity.y -= (ball.velocity.y / speed) * dragForce * deltaTime / ball.mass;
            ball.velocity.z -= (ball.velocity.z / speed) * dragForce * deltaTime / ball.mass;
        }
        
        // Apply wind effects
        const windForce = this.weather.windSpeed * this.weather.airDensity * 0.1;
        ball.velocity.x += Math.cos(this.weather.windDirection) * windForce * deltaTime;
        ball.velocity.z += Math.sin(this.weather.windDirection) * windForce * deltaTime;
        
        // Apply spin effects (Magnus force)
        this.applySpinEffects(ball, deltaTime);
        
        // Update position
        ball.position.x += ball.velocity.x * deltaTime;
        ball.position.y += ball.velocity.y * deltaTime;
        ball.position.z += ball.velocity.z * deltaTime;
        
        // Update angular velocity
        ball.angularVelocity.x += ball.spin.x * deltaTime;
        ball.angularVelocity.y += ball.spin.y * deltaTime;
        ball.angularVelocity.z += ball.spin.z * deltaTime;
        
        // Check for ground collision
        this.checkGroundCollision(ball);
        
        // Check for boundary collision
        this.checkBoundaryCollision(ball);
    }
    
    applySpinEffects(ball, deltaTime) {
        // Magnus force calculation
        const spinMagnitude = Math.sqrt(
            ball.spin.x ** 2 + 
            ball.spin.y ** 2 + 
            ball.spin.z ** 2
        );
        
        if (spinMagnitude > 0) {
            const magnusForce = 0.5 * this.weather.airDensity * 
                               Math.PI * ball.radius * ball.radius * 
                               spinMagnitude * 0.1;
            
            // Apply force perpendicular to velocity and spin axis
            const velocityMagnitude = Math.sqrt(
                ball.velocity.x ** 2 + 
                ball.velocity.y ** 2 + 
                ball.velocity.z ** 2
            );
            
            if (velocityMagnitude > 0) {
                // Simplified Magnus force calculation
                const forceX = -ball.spin.y * ball.velocity.z + ball.spin.z * ball.velocity.y;
                const forceY = -ball.spin.z * ball.velocity.x + ball.spin.x * ball.velocity.z;
                const forceZ = -ball.spin.x * ball.velocity.y + ball.spin.y * ball.velocity.x;
                
                ball.velocity.x += forceX * magnusForce * deltaTime / ball.mass;
                ball.velocity.y += forceY * magnusForce * deltaTime / ball.mass;
                ball.velocity.z += forceZ * magnusForce * deltaTime / ball.mass;
            }
        }
    }
    
    checkGroundCollision(ball) {
        if (ball.position.y <= ball.radius) {
            // Ball has hit the ground
            ball.position.y = ball.radius;
            
            if (!ball.hasBounced) {
                ball.hasBounced = true;
                ball.bounceCount++;
                
                // Calculate bounce based on pitch conditions
                const bounceFactor = this.calculateBounceFactor();
                
                // Reverse and dampen vertical velocity
                ball.velocity.y = Math.abs(ball.velocity.y) * bounceFactor;
                
                // Apply pitch effects to horizontal velocity
                ball.velocity.x *= this.groundFriction;
                ball.velocity.z *= this.groundFriction;
                
                // Apply spin effects on bounce
                this.applyBounceSpinEffects(ball);
                
                // Add some randomness based on pitch unevenness
                const randomFactor = 1 + (Math.random() - 0.5) * this.pitch.unevenness * 0.2;
                ball.velocity.x *= randomFactor;
                ball.velocity.z *= randomFactor;
            } else {
                // Ball is rolling
                ball.velocity.y = 0;
                ball.velocity.x *= this.groundFriction;
                ball.velocity.z *= this.groundFriction;
            }
        }
    }
    
    calculateBounceFactor() {
        // Base bounce factor
        let bounceFactor = 0.6;
        
        // Adjust based on pitch hardness
        bounceFactor += (this.pitch.hardness - 0.5) * 0.3;
        
        // Adjust based on moisture
        bounceFactor -= this.pitch.moisture * 0.2;
        
        // Adjust based on grass
        bounceFactor -= this.pitch.grass * 0.1;
        
        // Ensure reasonable bounds
        return Math.max(0.2, Math.min(0.9, bounceFactor));
    }
    
    applyBounceSpinEffects(ball) {
        // Spin affects bounce direction
        const spinEffect = 0.1;
        
        ball.velocity.x += ball.spin.y * spinEffect;
        ball.velocity.z += -ball.spin.x * spinEffect;
        
        // Reduce spin after bounce
        ball.spin.x *= 0.8;
        ball.spin.y *= 0.8;
        ball.spin.z *= 0.8;
    }
    
    checkBoundaryCollision(ball) {
        const boundary = 100; // meters
        
        if (Math.abs(ball.position.x) > boundary || Math.abs(ball.position.z) > boundary) {
            // Ball is out of bounds
            ball.isInFlight = false;
        }
    }
    
    updatePlayerPhysics(player, deltaTime) {
        // Update player position based on velocity
        player.position.x += player.velocity.x * deltaTime;
        player.position.y += player.velocity.y * deltaTime;
        player.position.z += player.velocity.z * deltaTime;
        
        // Apply friction
        player.velocity.x *= 0.9;
        player.velocity.y *= 0.9;
        player.velocity.z *= 0.9;
        
        // Keep player on ground
        if (player.position.y < 0) {
            player.position.y = 0;
            player.velocity.y = 0;
        }
    }
    
    // Ball delivery methods
    deliverBall(deliveryType, power, direction, spin) {
        const ball = this.ball;
        
        // Reset ball state
        ball.isInFlight = true;
        ball.hasBounced = false;
        ball.bounceCount = 0;
        
        // Set initial position (bowler's hand)
        ball.position = { x: 0, y: 2, z: 20 };
        
        // Calculate initial velocity based on delivery type
        const baseSpeed = this.getDeliverySpeed(deliveryType, power);
        const angle = this.getDeliveryAngle(deliveryType, power);
        
        ball.velocity = {
            x: Math.sin(direction) * baseSpeed * Math.cos(angle),
            y: baseSpeed * Math.sin(angle),
            z: Math.cos(direction) * baseSpeed * Math.cos(angle)
        };
        
        // Set spin
        ball.spin = {
            x: spin.x,
            y: spin.y,
            z: spin.z
        };
        
        // Apply seam effects
        this.applySeamEffects(ball, deliveryType);
    }
    
    getDeliverySpeed(deliveryType, power) {
        const baseSpeeds = {
            'fast': 35, // m/s
            'swing': 30,
            'spin': 25,
            'yorker': 32,
            'bouncer': 38
        };
        
        return baseSpeeds[deliveryType] * (0.5 + power * 0.5);
    }
    
    getDeliveryAngle(deliveryType, power) {
        const baseAngles = {
            'fast': 0.1, // radians
            'swing': 0.05,
            'spin': 0.15,
            'yorker': 0.0,
            'bouncer': 0.2
        };
        
        return baseAngles[deliveryType] * (0.5 + power * 0.5);
    }
    
    applySeamEffects(ball, deliveryType) {
        // Seam affects ball movement in air
        if (deliveryType === 'swing') {
            // Seam orientation affects swing
            ball.seam = {
                x: Math.sin(Date.now() * 0.001),
                y: 0,
                z: Math.cos(Date.now() * 0.001)
            };
        }
    }
    
    // Batting methods
    executeShot(shotType, timing, power, direction) {
        if (!this.ball.isInFlight) return false;
        
        // Calculate shot timing window
        const timingWindow = this.getTimingWindow(shotType);
        const timingAccuracy = this.calculateTimingAccuracy(timing, timingWindow);
        
        if (timingAccuracy < 0.3) {
            // Missed shot
            return false;
        }
        
        // Calculate shot velocity
        const shotVelocity = this.calculateShotVelocity(shotType, power, timingAccuracy);
        
        // Apply shot to ball
        this.applyShotToBall(shotVelocity, direction, shotType);
        
        return true;
    }
    
    getTimingWindow(shotType) {
        const windows = {
            'defensive': 0.3, // seconds
            'drive': 0.2,
            'pull': 0.15,
            'sweep': 0.25,
            'cut': 0.1,
            'hook': 0.1
        };
        
        return windows[shotType] || 0.2;
    }
    
    calculateTimingAccuracy(timing, window) {
        const timingError = Math.abs(timing - 0.5); // 0.5 is perfect timing
        return Math.max(0, 1 - (timingError / window));
    }
    
    calculateShotVelocity(shotType, power, timingAccuracy) {
        const baseVelocities = {
            'defensive': 10, // m/s
            'drive': 25,
            'pull': 20,
            'sweep': 15,
            'cut': 18,
            'hook': 22
        };
        
        return baseVelocities[shotType] * power * timingAccuracy;
    }
    
    applyShotToBall(velocity, direction, shotType) {
        const ball = this.ball;
        
        // Calculate new velocity based on shot
        const angle = direction * Math.PI * 2;
        const shotAngle = this.getShotAngle(shotType);
        
        ball.velocity.x = Math.sin(angle) * velocity * Math.cos(shotAngle);
        ball.velocity.y = velocity * Math.sin(shotAngle);
        ball.velocity.z = Math.cos(angle) * velocity * Math.cos(shotAngle);
        
        // Apply shot-specific effects
        this.applyShotEffects(ball, shotType);
    }
    
    getShotAngle(shotType) {
        const angles = {
            'defensive': 0.1,
            'drive': 0.2,
            'pull': 0.3,
            'sweep': 0.0,
            'cut': 0.15,
            'hook': 0.4
        };
        
        return angles[shotType] || 0.2;
    }
    
    applyShotEffects(ball, shotType) {
        // Different shots affect ball spin differently
        switch (shotType) {
            case 'sweep':
                ball.spin.x += 5; // Top spin
                break;
            case 'cut':
                ball.spin.z += 3; // Side spin
                break;
            case 'hook':
                ball.spin.x += 3;
                ball.spin.z += 2;
                break;
        }
    }
    
    // Utility methods
    getBallPosition() {
        return { ...this.ball.position };
    }
    
    getBallVelocity() {
        return { ...this.ball.velocity };
    }
    
    isBallInPlay() {
        return this.ball.isInFlight;
    }
    
    setPitchConditions(conditions) {
        this.pitch = { ...this.pitch, ...conditions };
    }
    
    setWeatherConditions(conditions) {
        this.weather = { ...this.weather, ...conditions };
    }
    
    addObject(object) {
        this.objects.push(object);
    }
    
    removeObject(object) {
        const index = this.objects.indexOf(object);
        if (index > -1) {
            this.objects.splice(index, 1);
        }
    }
}

// Collision detection system
class CollisionSystem {
    constructor() {
        this.broadPhase = new SpatialHash(10); // 10m grid cells
        this.narrowPhase = new NarrowPhaseCollision();
    }
    
    update(objects) {
        this.broadPhase.clear();
        
        // Add all objects to spatial hash
        objects.forEach(obj => {
            this.broadPhase.insert(obj);
        });
        
        // Check for potential collisions
        const potentialPairs = this.broadPhase.getPotentialPairs();
        
        // Perform narrow phase collision detection
        potentialPairs.forEach(pair => {
            if (this.narrowPhase.checkCollision(pair[0], pair[1])) {
                this.resolveCollision(pair[0], pair[1]);
            }
        });
    }
    
    resolveCollision(obj1, obj2) {
        // Simple collision resolution
        const dx = obj2.position.x - obj1.position.x;
        const dy = obj2.position.y - obj1.position.y;
        const dz = obj2.position.z - obj1.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distance < obj1.radius + obj2.radius) {
            // Separate objects
            const overlap = (obj1.radius + obj2.radius) - distance;
            const separationX = (dx / distance) * overlap * 0.5;
            const separationY = (dy / distance) * overlap * 0.5;
            const separationZ = (dz / distance) * overlap * 0.5;
            
            obj1.position.x -= separationX;
            obj1.position.y -= separationY;
            obj1.position.z -= separationZ;
            
            obj2.position.x += separationX;
            obj2.position.y += separationY;
            obj2.position.z += separationZ;
        }
    }
}

// Spatial hashing for broad phase collision detection
class SpatialHash {
    constructor(cellSize) {
        this.cellSize = cellSize;
        this.cells = new Map();
    }
    
    clear() {
        this.cells.clear();
    }
    
    insert(obj) {
        const cellX = Math.floor(obj.position.x / this.cellSize);
        const cellZ = Math.floor(obj.position.z / this.cellSize);
        const key = `${cellX},${cellZ}`;
        
        if (!this.cells.has(key)) {
            this.cells.set(key, []);
        }
        
        this.cells.get(key).push(obj);
    }
    
    getPotentialPairs() {
        const pairs = [];
        
        for (const [key, objects] of this.cells) {
            // Check objects within the same cell
            for (let i = 0; i < objects.length; i++) {
                for (let j = i + 1; j < objects.length; j++) {
                    pairs.push([objects[i], objects[j]]);
                }
            }
        }
        
        return pairs;
    }
}

// Narrow phase collision detection
class NarrowPhaseCollision {
    checkCollision(obj1, obj2) {
        const dx = obj2.position.x - obj1.position.x;
        const dy = obj2.position.y - obj1.position.y;
        const dz = obj2.position.z - obj1.position.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        return distance < obj1.radius + obj2.radius;
    }
}