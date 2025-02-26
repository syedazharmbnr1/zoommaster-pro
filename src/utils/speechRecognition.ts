/**
 * Utility for safer speech recognition that prevents "recognition has already started" errors
 */

// Track actual recognition state to avoid InvalidStateError 
let isRecognizing = false;

/**
 * Creates a wrapped speech recognition instance with additional safety checks
 */
export function createSafeRecognition() {
  if (typeof window === 'undefined') return null;

  // Check for SpeechRecognition support
  const hasSpeechRecognition = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  if (!hasSpeechRecognition) return null;

  // Use the appropriate SpeechRecognition implementation
  const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
  if (!SpeechRecognition) return null;

  const recognition = new SpeechRecognition();

  // Configure recognition
  recognition.continuous = true;
  recognition.interimResults = false;

  // Setup event handlers to track actual state
  const originalOnStart = recognition.onstart;
  recognition.onstart = (event: Event) => {
    console.log('Speech recognition started');
    isRecognizing = true;
    if (originalOnStart) originalOnStart.call(recognition, event);
  };

  const originalOnEnd = recognition.onend;
  recognition.onend = (event: Event) => {
    console.log('Speech recognition ended');
    isRecognizing = false;
    if (originalOnEnd) originalOnEnd.call(recognition, event);
  };

  const originalOnError = recognition.onerror;
  recognition.onerror = (event: Event) => {
    console.log('Speech recognition error');
    isRecognizing = false;
    if (originalOnError) originalOnError.call(recognition, event);
  };

  // Create safer versions of methods with better state tracking
  const safeRecognition = {
    ...recognition,
    
    // Override start to prevent "already started" errors
    start: () => {
      if (isRecognizing) {
        console.log('Speech recognition already running, not starting again');
        return;
      }
      
      try {
        console.log('Starting speech recognition safely');
        // Set state before calling start to prevent race conditions
        isRecognizing = true;
        recognition.start();
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        isRecognizing = false;
      }
    },
    
    // Override stop to prevent "not started" errors
    stop: () => {
      if (!isRecognizing) {
        console.log('Speech recognition not running, nothing to stop');
        return;
      }
      
      try {
        console.log('Stopping speech recognition safely');
        // We'll update the state flag in the onend handler to ensure proper sequencing
        recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        // Ensure state is reset if stop fails
        isRecognizing = false;
      }
    },
    
    // Add method to check state
    isRunning: () => isRecognizing,
    
    // Forcibly reset the state - useful in error recovery
    reset: () => {
      console.log('Forcibly resetting speech recognition state');
      try {
        if (isRecognizing) {
          recognition.stop();
        }
      } catch (e) {
        console.warn('Error during forced reset:', e);
      }
      isRecognizing = false;
    }
  };

  return safeRecognition;
}