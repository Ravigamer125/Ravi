/**
 * Cricket Pro Simulation - Audio System
 * Handles all audio including commentary, effects, and ambient sounds
 */

class Audio {
    constructor() {
        this.context = null;
        this.sounds = new Map();
        this.music = new Map();
        this.commentary = new Map();
        
        this.masterVolume = 0.8;
        this.sfxVolume = 0.9;
        this.musicVolume = 0.7;
        this.commentaryVolume = 0.8;
        
        this.isMuted = false;
        this.currentMusic = null;
        this.currentCommentary = null;
        
        this.init();
    }
    
    async init() {
        try {
            // Initialize Web Audio API
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            
            // Load audio assets
            await this.loadAudioAssets();
            
            // Setup audio nodes
            this.setupAudioNodes();
            
        } catch (error) {
            console.error('Failed to initialize audio system:', error);
        }
    }
    
    async loadAudioAssets() {
        const audioFiles = {
            // Sound effects
            'bat_hit': 'sounds/bat_hit.mp3',
            'bat_miss': 'sounds/bat_miss.mp3',
            'ball_release': 'sounds/ball_release.mp3',
            'ball_bounce': 'sounds/ball_bounce.mp3',
            'wicket': 'sounds/wicket.mp3',
            'boundary': 'sounds/boundary.mp3',
            'six': 'sounds/six.mp3',
            'four': 'sounds/four.mp3',
            'crowd_cheer': 'sounds/crowd_cheer.mp3',
            'crowd_applause': 'sounds/crowd_applause.mp3',
            'crowd_roar': 'sounds/crowd_roar.mp3',
            'umpire_out': 'sounds/umpire_out.mp3',
            'umpire_not_out': 'sounds/umpire_not_out.mp3',
            
            // Music
            'menu_music': 'music/menu_theme.mp3',
            'game_music': 'music/game_theme.mp3',
            'victory_music': 'music/victory_theme.mp3',
            'defeat_music': 'music/defeat_theme.mp3',
            
            // Commentary
            'commentary_intro': 'commentary/intro.mp3',
            'commentary_boundary': 'commentary/boundary.mp3',
            'commentary_six': 'commentary/six.mp3',
            'commentary_wicket': 'commentary/wicket.mp3',
            'commentary_over': 'commentary/over.mp3',
            'commentary_match_end': 'commentary/match_end.mp3'
        };
        
        // Load sound effects
        for (const [name, url] of Object.entries(audioFiles)) {
            try {
                const audioBuffer = await this.loadAudioFile(url);
                this.sounds.set(name, audioBuffer);
            } catch (error) {
                console.warn(`Failed to load audio file: ${url}`, error);
                // Create placeholder audio buffer
                this.sounds.set(name, this.createPlaceholderAudio());
            }
        }
    }
    
    async loadAudioFile(url) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        return await this.context.decodeAudioData(arrayBuffer);
    }
    
    createPlaceholderAudio() {
        // Create a short silent audio buffer as placeholder
        const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.1, this.context.sampleRate);
        return buffer;
    }
    
    setupAudioNodes() {
        // Master gain node
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        this.masterGain.gain.value = this.masterVolume;
        
        // SFX gain node
        this.sfxGain = this.context.createGain();
        this.sfxGain.connect(this.masterGain);
        this.sfxGain.gain.value = this.sfxVolume;
        
        // Music gain node
        this.musicGain = this.context.createGain();
        this.musicGain.connect(this.masterGain);
        this.musicGain.gain.value = this.musicVolume;
        
        // Commentary gain node
        this.commentaryGain = this.context.createGain();
        this.commentaryGain.connect(this.masterGain);
        this.commentaryGain.gain.value = this.commentaryVolume;
        
        // Reverb for atmosphere
        this.reverb = this.context.createConvolver();
        this.reverb.buffer = this.createReverbBuffer();
        this.reverb.connect(this.masterGain);
    }
    
    createReverbBuffer() {
        const length = this.context.sampleRate * 2; // 2 seconds
        const buffer = this.context.createBuffer(2, length, this.context.sampleRate);
        
        for (let channel = 0; channel < 2; channel++) {
            const channelData = buffer.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
            }
        }
        
        return buffer;
    }
    
    // Sound effect methods
    playSound(soundName, volume = 1.0, pitch = 1.0) {
        if (this.isMuted || !this.sounds.has(soundName)) return;
        
        const audioBuffer = this.sounds.get(soundName);
        const source = this.context.createBufferSource();
        const gainNode = this.context.createGain();
        
        source.buffer = audioBuffer;
        source.playbackRate.value = pitch;
        gainNode.gain.value = volume * this.sfxVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.sfxGain);
        source.start();
        
        return source;
    }
    
    playMusic(musicName, loop = true, volume = 1.0) {
        if (this.isMuted || !this.sounds.has(musicName)) return;
        
        // Stop current music
        if (this.currentMusic) {
            this.currentMusic.stop();
        }
        
        const audioBuffer = this.sounds.get(musicName);
        const source = this.context.createBufferSource();
        const gainNode = this.context.createGain();
        
        source.buffer = audioBuffer;
        source.loop = loop;
        gainNode.gain.value = volume * this.musicVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.musicGain);
        source.start();
        
        this.currentMusic = source;
        return source;
    }
    
    stopMusic() {
        if (this.currentMusic) {
            this.currentMusic.stop();
            this.currentMusic = null;
        }
    }
    
    // Commentary system
    playCommentary(commentaryName, volume = 1.0) {
        if (this.isMuted || !this.sounds.has(commentaryName)) return;
        
        // Stop current commentary
        if (this.currentCommentary) {
            this.currentCommentary.stop();
        }
        
        const audioBuffer = this.sounds.get(commentaryName);
        const source = this.context.createBufferSource();
        const gainNode = this.context.createGain();
        
        source.buffer = audioBuffer;
        gainNode.gain.value = volume * this.commentaryVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.commentaryGain);
        source.start();
        
        this.currentCommentary = source;
        return source;
    }
    
    // Dynamic commentary based on match situation
    playMatchCommentary(situation) {
        const commentary = this.generateCommentary(situation);
        if (commentary) {
            this.playCommentary(commentary);
        }
    }
    
    generateCommentary(situation) {
        const { event, runs, wickets, overs, balls } = situation;
        
        switch (event) {
            case 'boundary':
                return runs === 6 ? 'commentary_six' : 'commentary_boundary';
            case 'wicket':
                return 'commentary_wicket';
            case 'over_complete':
                return 'commentary_over';
            case 'match_end':
                return 'commentary_match_end';
            default:
                return null;
        }
    }
    
    // Crowd reactions
    playCrowdReaction(reaction, intensity = 1.0) {
        const reactions = {
            'cheer': 'crowd_cheer',
            'applause': 'crowd_applause',
            'roar': 'crowd_roar',
            'boundary': 'crowd_cheer',
            'six': 'crowd_roar',
            'wicket': 'crowd_applause'
        };
        
        const soundName = reactions[reaction];
        if (soundName) {
            this.playSound(soundName, intensity);
        }
    }
    
    // Ambient sounds
    playAmbientSound(soundName, loop = true, volume = 0.3) {
        if (this.isMuted) return;
        
        const source = this.context.createBufferSource();
        const gainNode = this.context.createGain();
        
        if (this.sounds.has(soundName)) {
            source.buffer = this.sounds.get(soundName);
        } else {
            source.buffer = this.createPlaceholderAudio();
        }
        
        source.loop = loop;
        gainNode.gain.value = volume * this.sfxVolume;
        
        source.connect(gainNode);
        gainNode.connect(this.sfxGain);
        source.start();
        
        return source;
    }
    
    // Weather-based audio
    updateWeatherAudio(weather) {
        // Stop existing weather sounds
        this.stopWeatherAudio();
        
        // Play appropriate weather sounds
        if (weather.precipitation > 0.1) {
            this.playAmbientSound('rain', true, weather.precipitation * 0.5);
        }
        
        if (weather.windSpeed > 2) {
            this.playAmbientSound('wind', true, weather.windSpeed * 0.1);
        }
    }
    
    stopWeatherAudio() {
        // Stop weather-related ambient sounds
        // Implementation would track and stop specific weather sounds
    }
    
    // Volume controls
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.masterGain.gain.value = this.masterVolume;
    }
    
    setSFXVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.sfxGain.gain.value = this.sfxVolume;
    }
    
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.musicGain.gain.value = this.musicVolume;
    }
    
    setCommentaryVolume(volume) {
        this.commentaryVolume = Math.max(0, Math.min(1, volume));
        this.commentaryGain.gain.value = this.commentaryVolume;
    }
    
    mute() {
        this.isMuted = true;
        this.masterGain.gain.value = 0;
    }
    
    unmute() {
        this.isMuted = false;
        this.masterGain.gain.value = this.masterVolume;
    }
    
    // Audio effects
    applyReverb(source, amount = 0.3) {
        const reverbGain = this.context.createGain();
        reverbGain.gain.value = amount;
        
        source.connect(reverbGain);
        reverbGain.connect(this.reverb);
    }
    
    applyEcho(source, delay = 0.3, feedback = 0.3) {
        const delayNode = this.context.createDelay();
        const feedbackGain = this.context.createGain();
        const outputGain = this.context.createGain();
        
        delayNode.delayTime.value = delay;
        feedbackGain.gain.value = feedback;
        outputGain.gain.value = 0.7;
        
        source.connect(delayNode);
        delayNode.connect(feedbackGain);
        feedbackGain.connect(delayNode);
        delayNode.connect(outputGain);
        outputGain.connect(this.sfxGain);
    }
    
    applyLowPass(source, frequency = 1000) {
        const filter = this.context.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = frequency;
        
        source.connect(filter);
        filter.connect(this.sfxGain);
    }
    
    applyHighPass(source, frequency = 200) {
        const filter = this.context.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = frequency;
        
        source.connect(filter);
        filter.connect(this.sfxGain);
    }
    
    // 3D Audio (for spatial audio)
    create3DAudio(source, position, listener) {
        const panner = this.context.createPanner();
        panner.panningModel = 'HRTF';
        panner.distanceModel = 'exponential';
        panner.rolloffFactor = 1;
        panner.maxDistance = 100;
        panner.refDistance = 1;
        
        panner.positionX.value = position.x;
        panner.positionY.value = position.y;
        panner.positionZ.value = position.z;
        
        source.connect(panner);
        panner.connect(this.sfxGain);
        
        return panner;
    }
    
    updateListenerPosition(position, orientation) {
        if (this.context.listener) {
            this.context.listener.positionX.value = position.x;
            this.context.listener.positionY.value = position.y;
            this.context.listener.positionZ.value = position.z;
            
            this.context.listener.forwardX.value = orientation.forward.x;
            this.context.listener.forwardY.value = orientation.forward.y;
            this.context.listener.forwardZ.value = orientation.forward.z;
            
            this.context.listener.upX.value = orientation.up.x;
            this.context.listener.upY.value = orientation.up.y;
            this.context.listener.upZ.value = orientation.up.z;
        }
    }
    
    // Update method for continuous audio updates
    update(deltaTime) {
        // Update any continuous audio effects
        // This could include fading, crossfading, etc.
    }
    
    // Utility methods
    getMasterVolume() {
        return this.masterVolume;
    }
    
    getSFXVolume() {
        return this.sfxVolume;
    }
    
    getMusicVolume() {
        return this.musicVolume;
    }
    
    getCommentaryVolume() {
        return this.commentaryVolume;
    }
    
    isAudioMuted() {
        return this.isMuted;
    }
    
    // Cleanup
    destroy() {
        if (this.currentMusic) {
            this.currentMusic.stop();
        }
        if (this.currentCommentary) {
            this.currentCommentary.stop();
        }
        
        if (this.context) {
            this.context.close();
        }
    }
}