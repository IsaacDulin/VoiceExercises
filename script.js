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

// Add event listener to the tone button when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  const toneButton = document.getElementById('toneButton');
  const octaveSlider = document.getElementById('octaveSlider');
  const octaveValue = document.getElementById('octaveValue');
  
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
  }
});

console.log("Hello from script.js");
