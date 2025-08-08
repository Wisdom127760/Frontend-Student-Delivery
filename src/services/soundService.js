class SoundService {
    constructor() {
        this.audioContext = null;
        this.isInitialized = false;
        this.hasPermission = false;
        this.sounds = {
            notification: this.createNotificationSound.bind(this),
            success: this.createSuccessSound.bind(this),
            alert: this.createAlertSound.bind(this),
            delivery: this.createDeliverySound.bind(this)
        };
    }

    // Initialize audio context with user permission
    async initialize() {
        try {
            // Check if audio context is supported
            if (!window.AudioContext && !window.webkitAudioContext) {
                console.warn('Web Audio API not supported');
                return false;
            }

            // Create audio context
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Resume audio context (required for Chrome)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            this.isInitialized = true;
            this.hasPermission = true;
            console.log('🎵 Sound service initialized successfully');
            return true;
        } catch (error) {
            console.error('Failed to initialize sound service:', error);
            return false;
        }
    }

    // Request user permission for audio
    async requestPermission() {
        if (this.hasPermission) return true;

        try {
            // Try to play a silent sound to get user permission
            const success = await this.initialize();
            if (success) {
                // Play a silent sound to activate audio context
                await this.playSilentSound();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Failed to request audio permission:', error);
            return false;
        }
    }

    // Play a silent sound to activate audio context
    async playSilentSound() {
        if (!this.audioContext) return;

        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            // Set volume to 0 (silent)
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);

            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.1);

            return new Promise((resolve) => {
                oscillator.onended = resolve;
            });
        } catch (error) {
            console.error('Failed to play silent sound:', error);
        }
    }

    // Play notification sound
    async playSound(type = 'notification') {
        try {
            // Request permission if not already granted
            if (!this.hasPermission) {
                const granted = await this.requestPermission();
                if (!granted) {
                    console.log('Audio permission not granted');
                    return false;
                }
            }

            // Initialize if not already done
            if (!this.isInitialized) {
                await this.initialize();
            }

            // Resume audio context if suspended
            if (this.audioContext && this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }

            // Play the sound
            if (this.sounds[type]) {
                this.sounds[type]();
                console.log(`🔊 Played ${type} sound`);
                return true;
            } else {
                console.warn(`Unknown sound type: ${type}`);
                return false;
            }
        } catch (error) {
            console.error('Failed to play sound:', error);
            return false;
        }
    }

    // Create notification sound (gentle ping)
    createNotificationSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Gentle ping sound
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    // Create success sound (ascending chord)
    createSuccessSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Success chord (C-E-G)
        oscillator.frequency.setValueAtTime(523, this.audioContext.currentTime); // C
        oscillator.frequency.setValueAtTime(659, this.audioContext.currentTime + 0.1); // E
        oscillator.frequency.setValueAtTime(784, this.audioContext.currentTime + 0.2); // G

        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.4);
    }

    // Create alert sound (attention-grabbing)
    createAlertSound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Alert sound (attention-grabbing)
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime + 0.3);

        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    }

    // Create delivery assignment sound (distinctive)
    createDeliverySound() {
        if (!this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Delivery assignment sound (distinctive chime)
        oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1200, this.audioContext.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.3);

        gainNode.gain.setValueAtTime(0.4, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.4);

        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.4);
    }



    // Get permission status
    getPermissionStatus() {
        return {
            isInitialized: this.isInitialized,
            hasPermission: this.hasPermission,
            audioContextState: this.audioContext?.state || 'not_initialized'
        };
    }
}

// Create singleton instance
const soundService = new SoundService();

export default soundService; 