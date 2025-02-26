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
  recognition.onstart = (originalHandler => {
    return (event: Event) => {
      console.log('Speech recognition started');
      isRecognizing = true;
      if (originalHandler) originalHandler(event);
    };
  })(recognition.onstart);

  recognition.onend = (originalHandler => {
    return (event: Event) => {
      console.log('Speech recognition ended');
      isRecognizing = false;
      if (originalHandler) originalHandler(event);
    };
  })(recognition.onend);

  recognition.onerror = (originalHandler => {
    return (event: Event) => {
      console.log('Speech recognition error');
      isRecognizing = false;
      if (originalHandler) originalHandler(event);
    };
  })(recognition.onerror);

  // Create safer versions of methods
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
        recognition.stop();
        isRecognizing = false;
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        isRecognizing = false;
      }
    },
    
    // Add method to check state
    isRunning: () => isRecognizing
  };

  return safeRecognition;
}
