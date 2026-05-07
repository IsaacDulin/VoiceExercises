// Global variables to hold vocal range positions
let globalMinPosition = 0;   // C2 (position 0)
let globalMaxPosition = 71;  // B7 (position 71)

// Global audio context - created on first user interaction
let audioCtx = null;

async function unlockAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    console.log('Audio context initialized');
  }

  if (audioCtx.state === 'suspended') {
    console.log('Resuming suspended audio context');
    await audioCtx.resume();
  }

  console.log('Audio context state:', audioCtx.state);
}

// Function to play a scale or arpeggio based on dropdown selection
async function playTone() {
  await unlockAudioContext();

  if (!audioCtx || audioCtx.state !== 'running') {
    console.warn('Audio context is not running:', audioCtx?.state);
    return;
  }

  // Check if audio context needs to be resumed (common on mobile browsers)
  if (audioCtx && audioCtx.state === 'suspended') {
    console.log('Resuming suspended audio context');
    audioCtx.resume();
  }
  
  // Get exercise type from dropdown
  const exerciseTypeSelect = document.getElementById('exerciseType');
  const exerciseType = exerciseTypeSelect ? exerciseTypeSelect.value : 'scale';
  
  // Get starting pitch from slider (0-59)
  const startPitchSlider = document.getElementById('startPitch');
  const startPitch = startPitchSlider ? parseInt(startPitchSlider.value) : 0;
  
  // Define frequency patterns for different pitch classes
  let frequencies;
  
  // Map positions (0-59) to base frequencies (C2 to B6)
  const baseFrequencies = {
    'C': 261.63,
    'C#': 277.18,
    'D': 293.66,
    'D#': 311.13,
    'E': 329.63,
    'F': 349.23,
    'F#': 369.99,
    'G': 392.00,
    'G#': 415.30,
    'A': 440.00,
    'A#': 466.16,
    'B': 493.88
  };
  
  // Convert position (0-59) to note name and frequency
  const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(startPitch / 12) + 2;  // C2 is position 0, so octave 2
  const noteIndex = startPitch % 12;
  const pitchClass = allNotes[noteIndex];
  const baseFreq = baseFrequencies[pitchClass];
  
  if (exerciseType === 'scale') {
      // Major scale: Tonic, Second, Third, Fourth, Fifth, Sixth, Seventh, Octave (ascending then descending)
      // Create a full pattern that goes up and comes back down to the octave above the starting note
      const scaleNotes = [0, 2, 4, 5, 7, 9, 11, 12, 11, 9, 7, 5, 4, 2, 0]; // up and down pattern
      frequencies = scaleNotes.map(interval => baseFreq * Math.pow(2, interval/12));
    } else if (exerciseType === 'arpeggio') {
      // Major arpeggio: Tonic, Third, Fifth, Octave
      const arpeggioNotes = [0, 4, 7, 12, 7, 4, 0]; // semitone intervals for major arpeggio
      frequencies = arpeggioNotes.map(interval => baseFreq * Math.pow(2, interval/12));
     } else if (exerciseType === 'slide') {
      // Slide / 1-5-1 arpeggio: Tonic, Fifth, Tonic
      const arpeggioNotes = [0, 7, 0]; 
      frequencies = arpeggioNotes.map(interval => baseFreq * Math.pow(2, interval/12));
    } else {
      // Default to middle C
      frequencies = [baseFreq];
    }
  
  // Apply octave adjustment (already handled in the position mapping)
  // frequencies = frequencies.map(freq => freq * Math.pow(2, octave));
  
  const noteDuration = 0.3; // seconds per note
  const gapBetweenNotes = 0.05; // small gap
  const totalTimePerNote = noteDuration + gapBetweenNotes;
  let startTime = audioCtx.currentTime + 0.01; // small delay to start
  
  frequencies.forEach((frequency, index) => {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    
    // Envelope: quick attack, then release
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, startTime + noteDuration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start(startTime);
    oscillator.stop(startTime + noteDuration);
    
    startTime += totalTimePerNote;
  });
}

// Function to get current vocal range positions
function getCurrentVocalRange() {
  return {
    min: globalMinPosition,
    max: globalMaxPosition
  };
}

// Function to randomize all selections (now using single pitch slider)
function randomize() {
  // Array of possible values
  const exerciseTypes = ['scale', 'arpeggio', 'slide'];
  
  // Get the dropdowns and slider
  const exerciseTypeSelect = document.getElementById('exerciseType');
  const startPitchSlider = document.getElementById('startPitch');
  
  // Set exercise type randomly
  if (exerciseTypeSelect) {
    exerciseTypeSelect.value = exerciseTypes[Math.floor(Math.random() * (exerciseTypes.length))];
  }

  // Get vocal range values from global variables
  const vocalRange = getCurrentVocalRange();
  const minPosition = vocalRange.min;
  const maxPosition = vocalRange.max;

  // Generate a random position within the vocal range
  // The range should be between minPosition and maxPosition-12 to ensure
  // exercises start at the lowest note and not exceed one octave above the maximum note
  const maxAllowedPosition = maxPosition - 12; // Ensure we don't go more than one octave above max
  const rangeSize = maxAllowedPosition - minPosition + 1;

  // Generate a random position in the valid vocal range
  const randomPosition = Math.floor(Math.random() * rangeSize) + minPosition;
  
  if (startPitchSlider) {
    startPitchSlider.value = randomPosition;
    // Update the display value
    const pitchValue = document.getElementById('pitchValue');
    if (pitchValue) {
      // Update display text with note name
      const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const noteIndex = randomPosition % 12;
      const octave = Math.floor(randomPosition / 12) + 2;  // C2 is position 0
      const noteName = allNotes[noteIndex] + octave;
      pitchValue.textContent = noteName;
    }
  }
}

// Function to randomize selections and then play tone
function randomizeAndPlay() {
  randomize();
  playTone();
}

// Function to initialize and handle the range slider
function initializeRangeSlider() {
  const rangeSlider = document.getElementById('vocalRangeSlider');
  const minKnob = document.getElementById('minKnob');
  const maxKnob = document.getElementById('maxKnob');
  const rangeFill = document.getElementById('rangeFill');
  const rangeDisplay = document.getElementById('rangeDisplay');
  
  if (!rangeSlider || !minKnob || !maxKnob || !rangeFill) return;
  
  // List of all possible notes for the range (C2 to B7)
  const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Convert position to note name and octave
  function positionToNote(position) {
    if (position < 0) position = 0;
    if (position > 71) position = 71;
    
    const octave = Math.floor(position / 12) + 2;  // Octaves 2-7
    const noteIndex = position % 12;
    const noteName = allNotes[noteIndex];
    return noteName + octave;
  }
  
  // Update display with current range
  function updateDisplay() {
    const minNote = positionToNote(globalMinPosition);
    const maxNote = positionToNote(globalMaxPosition);
    if (rangeDisplay) {
      rangeDisplay.textContent = `Range: ${minNote} to ${maxNote} (${minNote}-${maxNote})`;
    }
    console.log(`Range updated: ${minNote} to ${maxNote}`);
  }
  
  // Update visual position of knobs
  function updateKnobPositions() {
    const sliderWidth = rangeSlider.offsetWidth;
    const minPercent = (globalMinPosition / 71) * 100;
    const maxPercent = (globalMaxPosition / 71) * 100;
    
    minKnob.style.left = minPercent + '%';
    maxKnob.style.left = maxPercent + '%';
    
    // Update range fill
    const leftPercent = minPercent;
    const widthPercent = maxPercent - minPercent;
    rangeFill.style.left = leftPercent + '%';
    rangeFill.style.width = widthPercent + '%';
    
    updateDisplay();
  }
  
  // Make knobs draggable
  function makeKnobDraggable(knob, isMin) {
    let isDragging = false;
    
    knob.addEventListener('mousedown', function(e) {
      isDragging = true;
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      
      const rect = rangeSlider.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      
      let newPosition = Math.round((percent / 100) * 71);
      
      // Ensure positions don't cross and maintain at least one octave range (12 positions)
      if (isMin) {
        // Minimum can't exceed max - 12 positions (one octave)
        const maxAllowed = globalMaxPosition - 12;
        if (newPosition >= maxAllowed) newPosition = maxAllowed;
        globalMinPosition = newPosition;
      } else {
        // Maximum can't be less than min + 12 positions (one octave)
        const minAllowed = globalMinPosition + 12;
        if (newPosition <= minAllowed) newPosition = minAllowed;
        globalMaxPosition = newPosition;
      }
      
      updateKnobPositions();
    });
    
    document.addEventListener('mouseup', function() {
      isDragging = false;
    });
    
    // Touch events for mobile support
    knob.addEventListener('touchstart', function(e) {
      isDragging = true;
      e.preventDefault();
    });
    
    document.addEventListener('touchmove', function(e) {
      if (!isDragging) return;
      
      const rect = rangeSlider.getBoundingClientRect();
      const x = e.touches[0].clientX - rect.left;
      const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
      
      let newPosition = Math.round((percent / 100) * 71);
      
      // Ensure positions don't cross and maintain at least one octave range (12 positions)
      if (isMin) {
        // Minimum can't exceed max - 12 positions (one octave)
        const maxAllowed = globalMaxPosition - 12;
        if (newPosition >= maxAllowed) newPosition = maxAllowed;
        globalMinPosition = newPosition;
      } else {
        // Maximum can't be less than min + 12 positions (one octave)
        const minAllowed = globalMinPosition + 12;
        if (newPosition <= minAllowed) newPosition = minAllowed;
        globalMaxPosition = newPosition;
      }
      
      updateKnobPositions();
    });
    
    document.addEventListener('touchend', function() {
      isDragging = false;
    });
  }
  
  // Initialize with default range (C2 to B7)
  globalMinPosition = 0;   // C2
  globalMaxPosition = 71;  // B7
  
  // Initialize sliders
  makeKnobDraggable(minKnob, true);
  makeKnobDraggable(maxKnob, false);
  
  // Initial update
  updateKnobPositions();
  
  // Add debugging for the initialization
  console.log('Range slider initialized with C2 (0) to B7 (71)');
}

// Add event listener to the tone button when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const toneButton = document.getElementById('toneButton');
  const startPitchSlider = document.getElementById('startPitch');
  const pitchValue = document.getElementById('pitchValue');
  const randomizeButton = document.getElementById('randomizeButton');
  const randomizeAndPlayButton = document.getElementById('randomizeAndPlayButton');
  
  if (toneButton) {
    toneButton.addEventListener('click', playTone);
    toneButton.addEventListener('touchend', (event) => {
      event.preventDefault();
      playTone();
    });
  }
  
  // Update pitch display when slider changes
  if (startPitchSlider) {
    startPitchSlider.addEventListener('input', function() {
      if (pitchValue) {
        // Update display text with note name
        const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const noteIndex = this.value % 12;
        const octave = Math.floor(this.value / 12) + 2;  // C2 is position 0
        const noteName = allNotes[noteIndex] + octave;
        pitchValue.textContent = noteName;
      }
    });
    
    // Initialize display on page load
    if (pitchValue) {
      // Update display text with note name
      const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const noteIndex = startPitchSlider.value % 12;
      const octave = Math.floor(startPitchSlider.value / 12) + 2;  // C2 is position 0
      const noteName = allNotes[noteIndex] + octave;
      pitchValue.textContent = noteName;
    }
  }
  
  // Add event listener to randomize button
  if (randomizeButton) {
    randomizeButton.addEventListener('click', randomize);
  }
  
  // Add event listener to randomize and play button
  if (randomizeAndPlayButton) {
    randomizeAndPlayButton.addEventListener('click', randomizeAndPlay);
  }
  
  // Initialize range slider
  initializeRangeSlider();
});