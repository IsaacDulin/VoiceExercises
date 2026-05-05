// Function to play a scale or arpeggio based on dropdown selection
function playTone() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  
  // Get exercise type from dropdown
  const exerciseTypeSelect = document.getElementById('exerciseType');
  const exerciseType = exerciseTypeSelect ? exerciseTypeSelect.value : 'scale';
  
  // Get pitch class from dropdown
  const pitchClassSelect = document.getElementById('pitchClass');
  const pitchClass = pitchClassSelect ? pitchClassSelect.value : 'C';
  
  // Get octave from slider
  const octaveSlider = document.getElementById('octaveSlider');
  const octave = octaveSlider ? parseInt(octaveSlider.value) : 0;
  
  // Define frequency patterns for different pitch classes
  let frequencies;
  
  // Map pitch classes to their base frequencies (in Hz)
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
  
  // Get the base frequency for the selected pitch class
  const baseFreq = baseFrequencies[pitchClass];
  
  if (exerciseType === 'scale') {
    // Major scale: Tonic, Second, Third, Fourth, Fifth, Sixth, Seventh, Octave
    const scaleNotes = [0, 2, 4, 5, 7, 9, 11, 12]; // semitone intervals for major scale
    frequencies = scaleNotes.map(interval => baseFreq * Math.pow(2, interval/12));
  } else if (exerciseType === 'arpeggio') {
    // Major arpeggio: Tonic, Third, Fifth, Octave
    const arpeggioNotes = [0, 4, 7, 12]; // semitone intervals for major arpeggio
    frequencies = arpeggioNotes.map(interval => baseFreq * Math.pow(2, interval/12));
  } else {
    // Default to middle C
    frequencies = [baseFreq];
  }
  
  // Apply octave adjustment
  frequencies = frequencies.map(freq => freq * Math.pow(2, octave));
  
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

// Function to randomize all selections
function randomize() {
  // Array of possible values
  const exerciseTypes = ['scale', 'arpeggio'];
  const pitchClasses = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octaves = [-2, -1, 0, 1, 2];
  
  // Get the dropdowns and slider
  const exerciseTypeSelect = document.getElementById('exerciseType');
  const pitchClassSelect = document.getElementById('pitchClass');
  const octaveSlider = document.getElementById('octaveSlider');
  
  // Set random values
  if (exerciseTypeSelect) {
    exerciseTypeSelect.value = exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];
  }
  
  if (pitchClassSelect) {
    pitchClassSelect.value = pitchClasses[Math.floor(Math.random() * pitchClasses.length)];
  }
  
  if (octaveSlider) {
    octaveSlider.value = octaves[Math.floor(Math.random() * octaves.length)];
    
    // Update the display value
    const octaveValue = document.getElementById('octaveValue');
    if (octaveValue) {
      octaveValue.textContent = octaveSlider.value;
    }
  }
}

// Function to initialize and handle the range slider
function initializeRangeSlider() {
  const rangeSlider = document.getElementById('vocalRangeSlider');
  const minKnob = document.getElementById('minKnob');
  const maxKnob = document.getElementById('maxKnob');
  const rangeFill = document.getElementById('rangeFill');
  const rangeDisplay = document.getElementById('rangeDisplay');
  
  if (!rangeSlider || !minKnob || !maxKnob || !rangeFill) return;
  
  // Create a simple solution - use 24 positions (2 octaves below to 2 octaves above)
  // C2 to B6 would be: 6 octaves * 12 notes = 72 positions
  // But for simplicity and visibility, we'll use a manageable range
  
  // Working with 60 positions (C2 to B6) 
  let minPosition = 0;   // C2 (position 0)
  let maxPosition = 59;  // B6 (position 59)
  
  // List of all possible notes for the range (C2 to B6)
  const allNotes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  
  // Convert position to note name and octave
  function positionToNote(position) {
    if (position < 0) position = 0;
    if (position > 59) position = 59;
    
    const octave = Math.floor(position / 12) + 2;  // Octaves 2-6
    const noteIndex = position % 12;
    const noteName = allNotes[noteIndex];
    return noteName + octave;
  }
  
  // Update display with current range
  function updateDisplay() {
    const minNote = positionToNote(minPosition);
    const maxNote = positionToNote(maxPosition);
    if (rangeDisplay) {
      rangeDisplay.textContent = `Range: ${minNote} to ${maxNote} (${minNote}-${maxNote})`;
    }
    console.log(`Range updated: ${minNote} to ${maxNote}`);
  }
  
  // Update visual position of knobs
  function updateKnobPositions() {
    const sliderWidth = rangeSlider.offsetWidth;
    const minPercent = (minPosition / 59) * 100;
    const maxPercent = (maxPosition / 59) * 100;
    
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
      
      let newPosition = Math.round((percent / 100) * 59);
      
      // Ensure positions don't cross
      if (isMin) {
        if (newPosition >= maxPosition) newPosition = maxPosition - 1;
        minPosition = newPosition;
      } else {
        if (newPosition <= minPosition) newPosition = minPosition + 1;
        maxPosition = newPosition;
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
      
      let newPosition = Math.round((percent / 100) * 59);
      
      // Ensure positions don't cross
      if (isMin) {
        if (newPosition >= maxPosition) newPosition = maxPosition - 1;
        minPosition = newPosition;
      } else {
        if (newPosition <= minPosition) newPosition = minPosition + 1;
        maxPosition = newPosition;
      }
      
      updateKnobPositions();
    });
    
    document.addEventListener('touchend', function() {
      isDragging = false;
    });
  }
  
  // Initialize with default range (C2 to B6)
  minPosition = 0;   // C2
  maxPosition = 59;  // B6
  
  // Initialize sliders
  makeKnobDraggable(minKnob, true);
  makeKnobDraggable(maxKnob, false);
  
  // Initial update
  updateKnobPositions();
  
  // Add debugging for the initialization
  console.log('Range slider initialized with C2 (0) to B6 (59)');
}

// Add event listener to the tone button when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const toneButton = document.getElementById('toneButton');
  const octaveSlider = document.getElementById('octaveSlider');
  const octaveValue = document.getElementById('octaveValue');
  const randomizeButton = document.getElementById('randomizeButton');
  
  if (toneButton) {
    toneButton.addEventListener('click', playTone);
  }
  
  // Update octave display when slider changes
  if (octaveSlider) {
    octaveSlider.addEventListener('input', function() {
      if (octaveValue) {
        octaveValue.textContent = this.value;
      }
    });
    
    // Initialize display on page load
    if (octaveValue) {
      octaveValue.textContent = octaveSlider.value;
    }
  }
  
  // Add event listener to randomize button
  if (randomizeButton) {
    randomizeButton.addEventListener('click', randomize);
  }
  
  // Initialize range slider
  initializeRangeSlider();
});

console.log("Hello from script.js");