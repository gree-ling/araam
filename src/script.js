// Constants
const ARRIVAL_STATE_DURATION = 5000;
const ENGAGEMENT_STATE_DURATION = 15000;

// Breathing patterns in seconds: [inhale, hold1, exhale, hold2]
const breathingPatterns = {
    '6-6-6-6': [6, 6, 6, 6],
    '4-7-8': [4, 7, 8, 4],
};

// State management
let currentPattern = '6-6-6-6';
let isBreathingActive = false;
let audioEnabled = true;
let timerInterval = null;
let currentState = 'active';
let breathingInterval = null;

// Audio context and elements
let audioContext;
let binaural40Hz;
let binaural432Hz;
const inhaleSound = new Audio('/public/breathe_in.mp3');
const exhaleSound = new Audio('/public/breathe_out.mp3');
const chimeSound = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-bell-notification-933.mp3');

// Set audio volumes and load
[inhaleSound, exhaleSound, chimeSound].forEach(sound => {
    sound.volume = 1;
    sound.preload = 'auto';
    // Load and handle any errors
    sound.load();
    sound.addEventListener('error', (e) => {
        console.error('Audio load error:', e);
    });
});

// DOM elements
const breathingCircle = document.querySelector('.breathing-circle');
const breathingInstruction = document.querySelector('.breathing-instruction');
const progressiveContent = document.querySelector('.progressive-content');
const patternButtons = document.querySelectorAll('.pattern-btn');
const toggleAudioBtn = document.getElementById('toggleAudio');
const toggleTimerBtn = document.getElementById('toggleTimer');
const timerModal = document.querySelector('.timer-modal');
const timerInput = document.getElementById('timerMinutes');
const startTimerBtn = document.getElementById('startTimer');
const activeUsersSpan = document.getElementById('activeUsers');
const startStopBtn = document.querySelector('.start-stop-btn');

// Calming messages with progressive disclosure
const calmingMessages = {
    arrival: [
        "Just focus on the circle",
        "Follow your breath",
    ],
    engagement: [
        "Notice how your body feels",
        "You're doing great",
        "Stay with your breath",
    ],
    active: [
        "Each breath brings more peace",
        "Let go of any tension",
        "You're safe and supported",
        "This moment is yours",
        "We're here with you",
    ]
};

// Initialize audio context and binaural beats
function initAudio() {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    // Create 40Hz binaural beat (anxiety reduction)
    const baseFreq = 200;
    binaural40Hz = createBinauralBeat(baseFreq, baseFreq + 40);
    
    // Create 432Hz binaural beat
    binaural432Hz = createBinauralBeat(432, 432 + 8);
}

function createBinauralBeat(leftFreq, rightFreq) {
    const leftOsc = audioContext.createOscillator();
    const rightOsc = audioContext.createOscillator();
    const leftGain = audioContext.createGain();
    const rightGain = audioContext.createGain();
    const merger = audioContext.createChannelMerger(2);

    leftOsc.frequency.value = leftFreq;
    rightOsc.frequency.value = rightFreq;
    leftGain.gain.value = 0.02; // -20db
    rightGain.gain.value = 0.02;

    leftOsc.connect(leftGain);
    rightOsc.connect(rightGain);
    leftGain.connect(merger, 0, 0);
    rightGain.connect(merger, 0, 1);
    merger.connect(audioContext.destination);

    return {
        start: () => {
            leftOsc.start();
            rightOsc.start();
        },
        stop: () => {
            leftOsc.stop();
            rightOsc.stop();
        }
    };
}

// Progressive disclosure state management
function updateState() {
    if (currentState === 'arrival' && Date.now() - startTime > ARRIVAL_STATE_DURATION) {
        currentState = 'engagement';
        breathingInstruction.textContent = 'Breathe with the circle';
        progressiveContent.style.opacity = '0.3';
    } else if (currentState === 'engagement' && Date.now() - startTime > ENGAGEMENT_STATE_DURATION) {
        currentState = 'active';
        progressiveContent.style.opacity = '1';
        document.querySelector('.pattern-selector').style.opacity = '1';
        document.querySelector('.controls').style.opacity = '1';
    }
}

// Update breathing animation with exponential easing
function updateBreathing() {
    const [inhale, hold1, exhale, hold2] = breathingPatterns[currentPattern];
    const totalCycleDuration = (inhale + hold1 + exhale + hold2) * 1000;

    function breathingCycle() {
        if (!isBreathingActive) return;

        // Inhale
        breathingCircle.style.transitionDuration = `${inhale}s`;
        breathingCircle.classList.add('inhale');
        breathingInstruction.textContent = 'Breathe in...';
        if (audioEnabled) {
            inhaleSound.currentTime = 0;
            inhaleSound.play().catch(e => console.error('Inhale audio play failed:', e));
        }

        // Hold after inhale
        setTimeout(() => {
            if (!isBreathingActive) return;
            breathingInstruction.textContent = 'Hold...';
        }, inhale * 1000);

        // Exhale
        setTimeout(() => {
            if (!isBreathingActive) return;
            breathingCircle.style.transitionDuration = `${exhale}s`;
            breathingCircle.classList.remove('inhale');
            breathingInstruction.textContent = 'Breathe out...';
            if (audioEnabled) {
                exhaleSound.currentTime = 0;
                exhaleSound.play().catch(e => console.error('Exhale audio play failed:', e));
            }
        }, (inhale + hold1) * 1000);

        // Hold after exhale
        setTimeout(() => {
            if (!isBreathingActive) return;
            breathingInstruction.textContent = 'Hold...';
        }, (inhale + hold1 + exhale) * 1000);
    }

    breathingCycle();
    return setInterval(breathingCycle, totalCycleDuration);
}

// Toggle breathing animation
function toggleBreathing() {
    isBreathingActive = !isBreathingActive;
    
    if (isBreathingActive) {
        // Update to pause icon
        startStopBtn.querySelector('path').setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z');
        
        // Initialize audio if enabled
        if (audioEnabled) {
            if (!audioContext || audioContext.state === 'closed') {
                initAudio();
            }
            try {
                binaural40Hz?.start();
                binaural432Hz?.start();
                inhaleSound?.play().catch(e => console.log('Audio play failed:', e));
            } catch (error) {
                console.log('Audio start failed:', error);
            }
        }
        
        // Start breathing animation
        breathingCircle.style.transitionDuration = '';
        breathingInterval = updateBreathing();
        breathingInstruction.textContent = 'Breathe in...';
        
    } else {
        // Update to play icon
        startStopBtn.querySelector('path').setAttribute('d', 'M8 5v14l11-7z');
        
        // Stop breathing animation
        if (breathingInterval) {
            clearInterval(breathingInterval);
            breathingInterval = null;
        }
        
        // Stop audio
        if (audioEnabled && audioContext) {
            try {
                binaural40Hz?.stop();
                binaural432Hz?.stop();
            } catch (error) {
                console.log('Audio stop failed:', error);
            }
        }
        
        // Reset circle state
        breathingCircle.style.transitionDuration = '0.3s';
        breathingCircle.classList.remove('inhale');
        breathingInstruction.textContent = 'Paused';
        
        // Clear timer if active
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
            const timerFill = breathingCircle.querySelector('.timer-fill');
            if (timerFill) {
                timerFill.style.transition = 'height 0.3s ease-out, opacity 0.3s ease-out';
                timerFill.style.opacity = '0';
                setTimeout(() => timerFill.remove(), 300);
            }
        }
    }
}

// Update calming message based on current state
function updateCalmingMessage() {
    const messageElement = document.querySelector('.calming-message');
    if (!messageElement) return;
    
    const messages = calmingMessages[currentState];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    messageElement.style.opacity = '0';
    setTimeout(() => {
        messageElement.textContent = randomMessage;
        messageElement.style.opacity = '1';
    }, 500);
}

// Update active users (moved before initialization)
function updateActiveUsers() {
    const activeUsersSpan = document.getElementById('activeUsers');
    if (!activeUsersSpan) return;
    const randomUsers = Math.floor(Math.random() * (1000 - 100 + 1)) + 100;
    activeUsersSpan.textContent = randomUsers.toLocaleString();
}

// Timer functionality
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function updateTimer(timeLeft) {
    const timerDisplay = document.querySelector('.timer-display');
    if (!timerDisplay) return;
    
    timerDisplay.textContent = formatTime(timeLeft);
}

// Event Listeners
startStopBtn.addEventListener('click', toggleBreathing);

patternButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        if (currentState !== 'active') return;
        
        patternButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentPattern = btn.dataset.pattern;
        
        if (breathingInterval) {
            clearInterval(breathingInterval);
        }
        if (isBreathingActive) {
            breathingInterval = updateBreathing();
        }
    });
});

toggleAudioBtn.addEventListener('click', toggleAudio);

// Timer functionality
toggleTimerBtn.addEventListener('click', () => {
    timerModal.hidden = !timerModal.hidden;
});

document.querySelectorAll('.timer-adjust').forEach(btn => {
    btn.addEventListener('click', () => {
        const adjustment = parseInt(btn.dataset.adjust);
        let currentValue = parseInt(timerInput.value);
        currentValue = Math.max(1, Math.min(60, currentValue + adjustment));
        timerInput.value = currentValue;
    });
});

// Timer functionality
let selectedMinutes = 1; // Default to 1 minute

document.querySelectorAll('.timer-preset').forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all presets
        document.querySelectorAll('.timer-preset').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        btn.classList.add('active');
        // Update selected minutes
        selectedMinutes = parseInt(btn.dataset.minutes);
    });
});

// Timer functionality
function startTimer(minutes) {
    const totalSeconds = minutes * 60;
    let timeLeft = totalSeconds;
    const startTime = Date.now();
    
    // Create timer fill element
    let timerFill = breathingCircle.querySelector('.timer-fill');
    if (!timerFill) {
        timerFill = document.createElement('div');
        timerFill.className = 'timer-fill';
        breathingCircle.appendChild(timerFill);
    }
    
    // Set initial height to 0
    timerFill.style.height = '0%';
    timerFill.style.opacity = '1';
    
    if (timerInterval) clearInterval(timerInterval);
    
    // Start breathing if not already active
    if (!isBreathingActive) {
        toggleBreathing();
    }
    
    function updateTimerFill() {
        const elapsed = (Date.now() - startTime) / 1000;
        const percentComplete = Math.min((elapsed / totalSeconds) * 100, 100);
        timerFill.style.height = `${percentComplete}%`;
        
        if (elapsed >= totalSeconds) {
            clearInterval(timerInterval);
            if (audioEnabled) chimeSound.play();
            toggleBreathing(); // Stop breathing
            timerFill.style.transition = 'height 0.2s linear, opacity 0.5s ease-out';
            timerFill.style.opacity = '0';
            setTimeout(() => timerFill.remove(), 500);
            timerInterval = null;
        }
    }
    
    timerInterval = setInterval(updateTimerFill, 100); // Update every 100ms for smooth animation
}

// Update the startTimerBtn click handler
startTimerBtn.addEventListener('click', () => {
    if (selectedMinutes > 0) {
        timerModal.hidden = true;
        startTimer(selectedMinutes);
    }
});

// Add cancel timer button handler
document.querySelector('.cancel-timer-btn').addEventListener('click', () => {
    timerModal.hidden = true;
    // Clear any existing timer
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
        const timerFill = breathingCircle.querySelector('.timer-fill');
        if (timerFill) {
            timerFill.style.transition = 'height 0.3s ease-out, opacity 0.3s ease-out';
            timerFill.style.opacity = '0';
            setTimeout(() => timerFill.remove(), 300);
        }
    }
});

// Add this with the other event listeners
document.querySelector('.close-modal-btn').addEventListener('click', () => {
    timerModal.hidden = true;
});

function toggleAudio() {
    if (currentState !== 'active') return;
    
    audioEnabled = !audioEnabled;
    toggleAudioBtn.querySelector('.icon').style.opacity = audioEnabled ? '1' : '0.5';
    
    if (audioEnabled) {
        // Always reinitialize audio context and oscillators when enabling
        if (audioContext) {
            audioContext.close();
        }
        initAudio();
        if (isBreathingActive) {
            binaural40Hz.start();
            binaural432Hz.start();
        }
    } else {
        if (audioContext) {
            binaural40Hz?.stop();
            binaural432Hz?.stop();
            audioContext.close();
            audioContext = null;
        }
    }
}

// Theme functionality
function setTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Update theme toggle icon
    const themeIcon = document.querySelector('#toggleTheme .icon path');
    if (!themeIcon) return;
    
    if (isDark) {
        themeIcon.setAttribute('d', 'M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9c0-.46-.04-.92-.1-1.36-.98 1.37-2.58 2.26-4.4 2.26-3.03 0-5.5-2.47-5.5-5.5 0-1.82.89-3.42 2.26-4.4-.44-.06-.9-.1-1.36-.1z');
    } else {
        themeIcon.setAttribute('d', 'M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z');
    }
}

function addNudgeEffect() {
    const circle = document.querySelector('.breathing-circle');
    const pulseRing = document.querySelector('.pulse-ring');
    
    // Remove animation class if it exists
    circle.classList.remove('nudge');
    pulseRing.classList.remove('nudge');
    
    // Force a reflow to restart the animation
    void circle.offsetWidth;
    void pulseRing.offsetWidth;
    
    // Add animation class
    circle.classList.add('nudge');
    pulseRing.classList.add('nudge');
    
    // Remove class after animation completes
    setTimeout(() => {
        circle.classList.remove('nudge');
        pulseRing.classList.remove('nudge');
    }, 400);
}

// Add click listener to all buttons
document.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', addNudgeEffect);
});

// Keyboard commands
document.addEventListener('keydown', (e) => {
    // Only handle keyboard shortcuts if not in an input field
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    
    switch (e.key.toLowerCase()) {
        case ' ': // Spacebar
            e.preventDefault(); // Prevent page scroll
            toggleBreathing();
            break;
        case 'l': // Toggle light/dark mode
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            setTheme(!isDark);
            break;
        case 'a': // Toggle audio
            toggleAudio();
            break;
        case 's': // Toggle patterns
            const isHidden = patternSelector.hidden;
            patternSelector.hidden = !isHidden;
            togglePatternsBtn.style.opacity = isHidden ? '1' : '0.7';
            break;
        case 't': // Toggle timer modal
            timerModal.hidden = !timerModal.hidden;
            break;
        case 'escape': // Close modal
            if (!timerModal.hidden) {
                timerModal.hidden = true;
            }
            break;
    }
});

// Initialize theme
document.addEventListener('DOMContentLoaded', () => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Set initial theme based on saved preference or system preference
    setTheme(savedTheme ? savedTheme === 'dark' : prefersDark);

    // Theme toggle handler
    const themeToggle = document.getElementById('toggleTheme');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            setTheme(!isDark);
        });
    }

    // Watch for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {  // Only auto-switch if user hasn't manually set a theme
            setTheme(e.matches);
        }
    });

    // Initial setup
    updateActiveUsers();
    updateCalmingMessage();

    // Update messages
    setInterval(updateCalmingMessage, 10000);
    setInterval(updateActiveUsers, 30000);
});

// Pattern selector toggle
const togglePatternsBtn = document.getElementById('togglePatterns');
const patternSelector = document.querySelector('.pattern-selector');

togglePatternsBtn.addEventListener('click', () => {
    const isHidden = patternSelector.hidden;
    patternSelector.hidden = !isHidden;
    
    // Update button opacity to show state
    togglePatternsBtn.style.opacity = isHidden ? '1' : '0.7';
    
    // Slide animation
    if (!isHidden) {
        patternSelector.style.transform = 'translateY(-10px)';
        patternSelector.style.opacity = '0';
    } else {
        patternSelector.style.transform = 'translateY(0)';
        patternSelector.style.opacity = '1';
    }
});

// Add this function to check if audio is working
function checkAudioStatus() {
    [inhaleSound, exhaleSound, chimeSound].forEach(sound => {
        sound.addEventListener('canplaythrough', () => {
            console.log('Audio loaded successfully:', sound.src);
        });
    });
}

// Call it when the page loads
document.addEventListener('DOMContentLoaded', checkAudioStatus);