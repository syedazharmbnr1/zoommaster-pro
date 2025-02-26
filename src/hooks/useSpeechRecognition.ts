import { useEffect, useRef } from "react";
import { useRecording } from "../context/RecordingContext";
import { useConfig } from "../context/ConfigContext";

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
      // Determine which Speech Recognition API to use
      // Using casting to avoid TypeScript errors with experimental APIs
      const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      // Create recognition instance
      const recog = new SpeechRecognitionAPI();
      recog.continuous = true;
      recog.interimResults = false; // Only final results

      recog.onresult = (event: SpeechRecognitionEvent) => {
        try {
          const transcript = Array.from(event.results)
            .filter(result => result.isFinal)
            .map((result) => result[0].transcript)
            .join(" ");
          if (transcript) {
            const words = transcript.trim().split(/\s+/).slice(0, 4); // Limit to 4 words
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

      recog.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsRecognitionRunning(false);
        
        // Don't auto-restart on permission errors
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          console.log("Speech recognition permission denied");
          setIsSpeechOn(false);
          return;
        }
        
        // Auto-restart on other errors after a delay, but only if recording is active
        if (isRecording && !isPaused && isSpeechOn) {
          setTimeout(() => {
            try {
              if (isSpeechOn && !isRecognitionRunning && recog.state !== 'running') {
                recog.start();
                setIsRecognitionRunning(true);
              }
            } catch (err) {
              console.error("Failed to restart speech recognition:", err);
            }
          }, 1000);
        }
      };

      recog.onend = () => {
        // Speech recognition ended - update state
        setIsRecognitionRunning(false);
        
        // Auto-restart if needed, but only if recording is active
        if (isRecording && !isPaused && isSpeechOn) {
          setTimeout(() => {
            try {
              if (isSpeechOn && !isRecognitionRunning && recog.state !== 'running') {
                recog.start();
                setIsRecognitionRunning(true);
              }
            } catch (err) {
              console.error("Failed to restart speech recognition after end:", err);
            }
          }, 1000);
        }
      };

      setRecognition(recog);

      // Start recognition if we're already recording
      if (isRecording && !isPaused && !isRecognitionRunning) {
        try {
          recog.start();
          setIsRecognitionRunning(true);
        } catch (err) {
          console.error("Error starting initial speech recognition:", err);
        }
      }

      return () => {
        try {
          // Clean up speech recognition when the hook unmounts
          if (recog && recog.state === 'running') {
            recog.stop();
          }
          setIsRecognitionRunning(false);
        } catch (err) {
          console.error("Error stopping speech recognition on cleanup:", err);
        }
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
      // If recording starts and speech recognition is enabled
      if (isRecording && !isPaused && isSpeechOn && !isRecognitionRunning) {
        if (recognition.state !== 'running') {
          recognition.start();
          setIsRecognitionRunning(true);
        }
      }
      // If recording stops or pauses
      else if ((!isRecording || isPaused) && isRecognitionRunning) {
        if (recognition.state === 'running') {
          recognition.stop();
          setIsRecognitionRunning(false);
        }
      }
    } catch (err) {
      console.error("Error managing speech recognition state:", err);
      setIsRecognitionRunning(false);
    }
  }, [isRecording, isPaused, isSpeechOn, recognition, isRecognitionRunning]);

  return { isRecognitionRunning };
}
