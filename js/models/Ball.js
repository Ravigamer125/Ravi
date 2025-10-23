/**
 * Cricket Pro Simulation - Ball Model
 * Handles ball physics, movement, and visual representation
 */

class Ball {
    constructor() {
        this.position = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.angularVelocity = { x: 0, y: 0, z: 0 };
        this.acceleration = { x: 0, y: 0, z: 0 };
        
        // Physical properties
        this.mass = 0.16; // kg (standard cricket ball)
        this.radius = 0.036; // m
        this.dragCoefficient = 0.47; // Sphere drag coefficient
        this.bounceCoefficient = 0.7;
        this.frictionCoefficient = 0.8;
        
        // Ball state
        this.isInFlight = false;
        this.hasBounced = false;
        this.bounceCount = 0;
        this.isDead = false;
        
        // Spin properties
        this.spin = { x: 0, y: 0, z: 0 };
        this.seam = { x: 0, y: 0, z: 1 }; // Seam orientation
        this.seamAngle = 0;
        
        // Visual properties
        this.color = 0xFF6B35; // Red cricket ball
        this.texture = null;
        this.material = null;
        
        // Trail for visual effect
        this.trail = [];
        this.maxTrailLength = 50;
        
        // Physics constraints
        this.groundLevel = 0;
        this.boundaryRadius = 100;
        
        this.init();
    }
    
    init() {
        this.createVisualModel();
        this.reset();
    }
    
    createVisualModel() {
        // Create 3D model for the ball
        this.model = {
            geometry: {
                type: 'sphere',
                radius: this.radius,
                segments: 16
            },
            material: {
                type: 'phong',
                color: this.color,
                shininess: 100,
                map: 'ball_texture'
            },
            textures: {
                main: this.generateBallTexture(),
                seam: this.generateSeamTexture()
            }
        };
    }
    
    generateBallTexture() {
        return {
            type: 'procedural',
            pattern: 'leather',
            color: this.color,
            roughness: 0.8,
            detail: 'high'
        };
    }
    
    generateSeamTexture() {
        return {
            type: 'procedural',
            pattern: 'seam',
            color: 0x8B4513,
            width: 0.002,
            height: 0.001
        };
    }
    
    // Physics methods
    update(deltaTime) {
        if (this.isDead) return;
        
        // Update position
        this.position.x += this.velocity.x * deltaTime;
        this.position.y += this.velocity.y * deltaTime;
        this.position.z += this.velocity.z * deltaTime;
        
        // Update velocity with acceleration
        this.velocity.x += this.acceleration.x * deltaTime;
        this.velocity.y += this.acceleration.y * deltaTime;
        this.velocity.z += this.acceleration.z * deltaTime;
        
        // Update angular velocity
        this.angularVelocity.x += this.spin.x * deltaTime;
        this.angularVelocity.y += this.spin.y * deltaTime;
        this.angularVelocity.z += this.spin.z * deltaTime;
        
        // Apply air resistance
        this.applyAirResistance(deltaTime);
        
        // Apply gravity
        this.applyGravity(deltaTime);
        
        // Check for ground collision
        this.checkGroundCollision();
        
        // Check for boundary collision
        this.checkBoundaryCollision();
        
        // Update trail
        this.updateTrail();
        
        // Update visual model
        this.updateVisualModel();
    }
    
    applyAirResistance(deltaTime) {
        if (!this.isInFlight) return;
        
        const speed = Math.sqrt(
            this.velocity.x ** 2 + 
            this.velocity.y ** 2 + 
            this.velocity.z ** 2
        );
        
        if (speed > 0) {
            const airDensity = 1.225; // kg/m³ at sea level
            const dragForce = 0.5 * airDensity * speed * speed * 
                             this.dragCoefficient * Math.PI * this.radius * this.radius;
            
            const dragX = -(this.velocity.x / speed) * dragForce * deltaTime / this.mass;
            const dragY = -(this.velocity.y / speed) * dragForce * deltaTime / this.mass;
            const dragZ = -(this.velocity.z / speed) * dragForce * deltaTime / this.mass;
            
            this.velocity.x += dragX;
            this.velocity.y += dragY;
            this.velocity.z += dragZ;
        }
    }
    
    applyGravity(deltaTime) {
        const gravity = -9.81; // m/s²
        this.velocity.y += gravity * deltaTime;
    }
    
    checkGroundCollision() {
        if (this.position.y <= this.groundLevel + this.radius) {
            this.position.y = this.groundLevel + this.radius;
            
            if (this.velocity.y < 0) {
                // Ball is bouncing
                this.velocity.y = Math.abs(this.velocity.y) * this.bounceCoefficient;
                this.bounceCount++;
                
                // Apply friction to horizontal velocity
                this.velocity.x *= this.frictionCoefficient;
                this.velocity.z *= this.frictionCoefficient;
                
                // Reduce spin after bounce
                this.spin.x *= 0.8;
                this.spin.y *= 0.8;
                this.spin.z *= 0.8;
                
                this.hasBounced = true;
            } else {
                // Ball is rolling
                this.velocity.y = 0;
            }
        }
    }
    
    checkBoundaryCollision() {
        const distance = Math.sqrt(this.position.x ** 2 + this.position.z ** 2);
        
        if (distance > this.boundaryRadius) {
            // Ball is out of bounds
            this.isDead = true;
            this.isInFlight = false;
        }
    }
    
    updateTrail() {
        // Add current position to trail
        this.trail.push({
            position: { ...this.position },
            timestamp: Date.now()
        });
        
        // Remove old trail points
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
    }
    
    updateVisualModel() {
        // Update ball rotation based on angular velocity
        this.model.rotation = {
            x: this.angularVelocity.x,
            y: this.angularVelocity.y,
            z: this.angularVelocity.z
        };
        
        // Update seam orientation
        this.seamAngle += this.angularVelocity.y * 0.1;
        this.seam.x = Math.sin(this.seamAngle);
        this.seam.z = Math.cos(this.seamAngle);
    }
    
    // Ball delivery methods
    deliver(deliveryType, power, direction, spin) {
        this.reset();
        this.isInFlight = true;
        
        // Set initial position (bowler's hand)
        this.position = { x: 0, y: 2, z: 20 };
        
        // Calculate initial velocity
        const baseSpeed = this.getDeliverySpeed(deliveryType, power);
        const angle = this.getDeliveryAngle(deliveryType, power);
        
        this.velocity = {
            x: Math.sin(direction) * baseSpeed * Math.cos(angle),
            y: baseSpeed * Math.sin(angle),
            z: Math.cos(direction) * baseSpeed * Math.cos(angle)
        };
        
        // Set spin
        this.spin = { ...spin };
        
        // Apply seam effects
        this.applySeamEffects(deliveryType);
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
    
    applySeamEffects(deliveryType) {
        if (deliveryType === 'swing') {
            // Seam orientation affects swing
            this.seamAngle = Math.random() * Math.PI * 2;
            this.seam.x = Math.sin(this.seamAngle);
            this.seam.z = Math.cos(this.seamAngle);
        }
    }
    
    // Ball hitting methods
    hit(shotType, timing, power, direction) {
        if (!this.isInFlight) return false;
        
        // Calculate shot success
        const success = this.calculateShotSuccess(shotType, timing, power);
        
        if (success) {
            // Apply shot to ball
            this.applyShot(shotType, power, direction);
            return true;
        }
        
        return false;
    }
    
    calculateShotSuccess(shotType, timing, power) {
        // Base success rate
        let successRate = 0.7;
        
        // Adjust based on timing
        successRate *= timing;
        
        // Adjust based on shot difficulty
        const shotDifficulty = this.getShotDifficulty(shotType);
        successRate *= (1 - shotDifficulty);
        
        // Adjust based on power
        successRate *= (0.5 + power * 0.5);
        
        return Math.random() < successRate;
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
    
    applyShot(shotType, power, direction) {
        // Calculate new velocity based on shot
        const shotVelocity = this.calculateShotVelocity(shotType, power);
        const angle = direction * Math.PI * 2;
        const shotAngle = this.getShotAngle(shotType);
        
        this.velocity.x = Math.sin(angle) * shotVelocity * Math.cos(shotAngle);
        this.velocity.y = shotVelocity * Math.sin(shotAngle);
        this.velocity.z = Math.cos(angle) * shotVelocity * Math.cos(shotAngle);
        
        // Apply shot-specific effects
        this.applyShotEffects(shotType);
    }
    
    calculateShotVelocity(shotType, power) {
        const baseVelocities = {
            'defensive': 10, // m/s
            'drive': 25,
            'pull': 20,
            'sweep': 15,
            'cut': 18,
            'hook': 22
        };
        
        return baseVelocities[shotType] * power;
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
    
    applyShotEffects(shotType) {
        // Different shots affect ball spin differently
        switch (shotType) {
            case 'sweep':
                this.spin.x += 5; // Top spin
                break;
            case 'cut':
                this.spin.z += 3; // Side spin
                break;
            case 'hook':
                this.spin.x += 3;
                this.spin.z += 2;
                break;
        }
    }
    
    // Utility methods
    reset() {
        this.position = { x: 0, y: 0, z: 0 };
        this.velocity = { x: 0, y: 0, z: 0 };
        this.angularVelocity = { x: 0, y: 0, z: 0 };
        this.acceleration = { x: 0, y: 0, z: 0 };
        this.isInFlight = false;
        this.hasBounced = false;
        this.bounceCount = 0;
        this.isDead = false;
        this.spin = { x: 0, y: 0, z: 0 };
        this.trail = [];
    }
    
    getPosition() {
        return { ...this.position };
    }
    
    getVelocity() {
        return { ...this.velocity };
    }
    
    getSpeed() {
        return Math.sqrt(
            this.velocity.x ** 2 + 
            this.velocity.y ** 2 + 
            this.velocity.z ** 2
        );
    }
    
    isInPlay() {
        return this.isInFlight && !this.isDead;
    }
    
    getTrail() {
        return [...this.trail];
    }
    
    getModel() {
        return this.model;
    }
    
    // Visual rendering
    render(renderer) {
        if (this.isDead) return;
        
        // Render ball
        renderer.renderBall(this);
        
        // Render trail
        if (this.trail.length > 1) {
            renderer.renderTrail(this.trail);
        }
    }
    
    // Debug methods
    getDebugInfo() {
        return {
            position: this.position,
            velocity: this.velocity,
            speed: this.getSpeed(),
            isInFlight: this.isInFlight,
            hasBounced: this.hasBounced,
            bounceCount: this.bounceCount,
            spin: this.spin,
            trailLength: this.trail.length
        };
    }
}