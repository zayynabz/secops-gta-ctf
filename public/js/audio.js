/**
 * ==========================================================================
 * SECOPS x SAN ANDREAS - WEB AUDIO SYNTHESIZER ENGINE
 * High-fidelity 8-bit & 16-bit retro procedural sound synthesis
 * ==========================================================================
 */

const AudioEngine = (function() {
    let audioCtx = null;
    let isMuted = false;
    let isInitialized = false;

    function init() {
        if (isInitialized && audioCtx) {
            if (audioCtx.state === 'suspended') audioCtx.resume();
            return;
        }
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
            isInitialized = true;
        } catch (e) {
            console.warn("Web Audio API not supported in this browser.");
        }
    }

    function playTone(freq, type, duration, vol = 0.1) {
        if (!audioCtx || isMuted) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();

        try {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            
            gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + duration);
        } catch (e) {
            // Ignore audio interruption
        }
    }

    function playBeep() {
        playTone(600, 'square', 0.08, 0.04);
    }

    function playHover() {
        playTone(320, 'sine', 0.04, 0.02);
    }

    function playTypewriter() {
        playTone(380 + Math.random() * 220, 'square', 0.03, 0.015);
    }

    function playCorrect() {
        if (!audioCtx || isMuted) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        try {
            const startTime = audioCtx.currentTime;
            const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            freqs.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, startTime + (idx * 0.06));
                gain.gain.setValueAtTime(0.06, startTime + (idx * 0.06));
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + (idx * 0.06) + 0.18);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(startTime + (idx * 0.06));
                osc.stop(startTime + (idx * 0.06) + 0.18);
            });
        } catch (e) {}
    }

    function playWrong() {
        if (!audioCtx || isMuted) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        try {
            const startTime = audioCtx.currentTime;
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(180, startTime);
            osc.frequency.linearRampToValueAtTime(80, startTime + 0.35);
            
            gainNode.gain.setValueAtTime(0.08, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.35);

            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            osc.start(startTime);
            osc.stop(startTime + 0.35);
        } catch (e) {}
    }

    function playMissionPassed() {
        if (!audioCtx || isMuted) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        try {
            // Iconic GTA mission passed synth fan-fare (brass synth simulation)
            const notes = [
                { f: 392, d: 0.15 },  // G4
                { f: 523.25, d: 0.15 },// C5
                { f: 659.25, d: 0.15 },// E5
                { f: 783.99, d: 0.3 }, // G5
                { f: 659.25, d: 0.15 },// E5
                { f: 783.99, d: 0.6 }  // G5 long
            ];
            let time = audioCtx.currentTime;
            
            notes.forEach(n => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(n.f, time);
                gain.gain.setValueAtTime(0.08, time);
                gain.gain.exponentialRampToValueAtTime(0.0001, time + n.d);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(time);
                osc.stop(time + n.d);
                time += n.d;
            });
        } catch (e) {}
    }

    function playMissionFailed() {
        if (!audioCtx || isMuted) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        try {
            // Wasted low synth bass rumble
            const notes = [220, 196, 174, 130];
            let time = audioCtx.currentTime;
            
            notes.forEach(freq => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(freq, time);
                gain.gain.setValueAtTime(0.12, time);
                gain.gain.linearRampToValueAtTime(0.0001, time + 0.4);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(time);
                osc.stop(time + 0.4);
                time += 0.35;
            });
        } catch (e) {}
    }

    function playCheatCode() {
        if (!audioCtx || isMuted) return;
        if (audioCtx.state === 'suspended') audioCtx.resume();
        
        try {
            // Cash register / cheat activated chime
            const startTime = audioCtx.currentTime;
            const freqs = [1200, 1600, 2400];
            freqs.forEach((freq, idx) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'square';
                osc.frequency.setValueAtTime(freq, startTime + (idx * 0.05));
                gain.gain.setValueAtTime(0.08, startTime + (idx * 0.05));
                gain.gain.exponentialRampToValueAtTime(0.0001, startTime + (idx * 0.05) + 0.15);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(startTime + (idx * 0.05));
                osc.stop(startTime + (idx * 0.05) + 0.15);
            });
        } catch (e) {}
    }

    function toggleMute() {
        isMuted = !isMuted;
        if (!isMuted) init();
        return isMuted;
    }

    function getMuted() {
        return isMuted;
    }

    return {
        init,
        playBeep,
        playHover,
        playTypewriter,
        playCorrect,
        playWrong,
        playMissionPassed,
        playMissionFailed,
        playCheatCode,
        toggleMute,
        getMuted
    };
})();
