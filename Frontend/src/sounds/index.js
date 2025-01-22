const BACKEND_URL = 'http://localhost:5000'; // Update this to match your backend URL

// Add this fallback function
const createFallbackRingtone = () => {
  const audioContext = new (window.AudioContext || window.AudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.type = 'sine';
  oscillator.frequency.setValueAtTime(440, audioContext.currentTime); // A4 note
  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);

  oscillator.start();
  
  return {
    pause: () => {
      oscillator.stop();
      audioContext.close();
    },
    play: () => {},
    loop: true,
    currentTime: 0,
  };
};

export const playRingtone = () => {
  try {
    const audio = new Audio(`${BACKEND_URL}/sounds/ringtone.mp3`);
    audio.loop = true;
    audio.onerror = () => {
      console.error('Error loading ringtone, using fallback.');
      const fallbackAudio = createFallbackRingtone();
      fallbackAudio.play();
      return fallbackAudio;
    };
    return audio;
  } catch (error) {
    console.error('Error playing ringtone:', error);
    const fallbackAudio = createFallbackRingtone();
    fallbackAudio.play();
    return fallbackAudio;
  }
};

export const playCallStartSound = () => {
  try {
    const audio = new Audio(`${BACKEND_URL}/sounds/start-ring.mp3`);
    
    audio.onerror = (error) => {
      console.error('Error loading call start sound:', error);
    };
    
    audio.play().catch(error => {
      console.error('Error playing call start sound:', error);
    });
  } catch (error) {
    console.error('Error creating call start sound:', error);
  }
};

export const playCallEndSound = () => {
  try {
    const audio = new Audio(`${BACKEND_URL}/sounds/call-end.mp3`);
    
    audio.onerror = (error) => {
      console.error('Error loading call end sound:', error);
    };
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.error('Error playing call end sound:', error);
      });
    }
  } catch (error) {
    console.error('Error creating call end sound:', error);
  }
};
