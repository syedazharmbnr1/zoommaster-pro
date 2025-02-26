import { useEffect, useRef } from "react";
import { useRecording } from "../context/RecordingContext";
import { useConfig } from "../context/ConfigContext";
import { createSafeRecognition } from "../utils/speechRecognition";

/**
 * Hook for handling speech recognition for captions
 */
export function useSpeechRecognition() {
  const {
    isRecording,
    isPaused,
    isRecognitionRunning,
    setIsRecognitionRunning,
    recognition,
    setRecognition,
    setCaptions,
  } = useRecording();
  
  const { isSpeechOn, setIsSpeechOn } = useConfig();
  
  // Track initialization status
  const isInitializedRef = useRef(false);
  // Track speech recognition state independently
  const recognitionStateRef = useRef<'inactive' | 'running' | 'starting'>('inactive');

  useEffect(() => {
    // Only run in browser environment and check if speech recognition is available
    if (typeof window === 'undefined') return;
    
    const isSpeechAvailable = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
    
    if (!isSpeechAvailable) {
      console.log("Speech recognition not available in this browser");
      setIsSpeechOn(false);
      return;
    }
    
    if (!isSpeechOn) return;
    
    // Prevent multiple initialization attempts
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    try {
      // Create a safe speech recognition instance that handles state properly
      const safeRecognition = createSafeRecognition();
      
      if (!safeRecognition) {
        console.error("Could not create speech recognition instance");
        setIsSpeechOn(false);
        return;
      }
      
      // Set up event handlers
      safeRecognition.onresult = (event: SpeechRecognitionEvent) => {
        try {
          const transcript = Array.from(event.results)
            .filter(result => result.isFinal)
            .map((result) => result[0].transcript)
            .join(" ");
          if (transcript) {
            const words = transcript.trim().split(/\\s+/).slice(0, 4); // Limit to 4 words
            const captionText = words.join(" ") + (words.length === 4 ? "..." : "");
            setCaptions((prev) => {
              const newCaption = { text: captionText, timestamp: Date.now() };
              return [newCaption]; // Only show the most recent caption, fading out
            });
          }
        } catch (err) {
          console.error("Error processing speech results:", err);
        }
      };

      safeRecognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsRecognitionRunning(false);
        recognitionStateRef.current = 'inactive';
        
        // Don't auto-restart on permission errors
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          console.log("Speech recognition permission denied");
          setIsSpeechOn(false);
          return;
        }
      };

      setRecognition(safeRecognition);

      // Start recognition if we're already recording
      if (isRecording && !isPaused && isSpeechOn) {
        setTimeout(() => {
          if (safeRecognition && isSpeechOn) {
            safeRecognition.start();
            setIsRecognitionRunning(true);
          }
        }, 1000);
      }

      return () => {
        // Cleanup on unmount
        if (safeRecognition && typeof safeRecognition.stop === 'function') {
          safeRecognition.stop();
        }
        setIsRecognitionRunning(false);
      };
    } catch (err) {
      console.error("Error setting up speech recognition:", err);
      setIsSpeechOn(false); // Disable speech recognition on initialization error
    }
  }, []);

  // Handle recording state changes
  useEffect(() => {
    if (!recognition) return;
    
    try {
      // Use isRunning() method if available (from safeRecognition)
      const isCurrentlyRunning = typeof (recognition as any).isRunning === 'function' 
        ? (recognition as any).isRunning()
        : isRecognitionRunning;
        
      // Start recognition when recording starts
      if (isRecording && !isPaused && isSpeechOn && !isCurrentlyRunning) {
        setTimeout(() => {
          if (recognition && isSpeechOn) {
            try {
              recognition.start();
              setIsRecognitionRunning(true);
            } catch (err) {
              console.warn("Could not start speech recognition:", err);
            }
          }
        }, 500);
      }
      // Stop recognition when recording stops or pauses
      else if ((!isRecording || isPaused) && isCurrentlyRunning) {
        try {
          recognition.stop();
          setIsRecognitionRunning(false);
        } catch (err) {
          console.warn("Could not stop speech recognition:", err);
          setIsRecognitionRunning(false);
        }
      }
    } catch (err) {
      console.error("Error managing speech recognition state:", err);
      setIsRecognitionRunning(false);
    }
  }, [isRecording, isPaused, isSpeechOn, recognition]);

  return { isRecognitionRunning };
}
