import { useEffect } from "react";
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
  
  const { isSpeechOn } = useConfig();

  useEffect(() => {
    if (!window || !("webkitSpeechRecognition" in window) || !isSpeechOn) return;

    const recog = new (window as any).webkitSpeechRecognition() as SpeechRecognition;
    recog.continuous = true;
    recog.interimResults = false; // Only final results

    recog.onresult = (event: SpeechRecognitionEvent) => {
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
    };

    recog.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsRecognitionRunning(false);
      if (isRecording && !isPaused && isSpeechOn) {
        setTimeout(() => {
          if (isSpeechOn && !isRecognitionRunning) {
            recog.start();
            setIsRecognitionRunning(true);
          }
        }, 100);
      }
    };

    recog.onend = () => {
      setIsRecognitionRunning(false);
      if (isRecording && !isPaused && isSpeechOn) {
        setTimeout(() => {
          if (isSpeechOn && !isRecognitionRunning) {
            recog.start();
            setIsRecognitionRunning(true);
          }
        }, 100);
      }
    };

    setRecognition(recog);

    if (isRecording && !isPaused && !isRecognitionRunning) {
      recog.start();
      setIsRecognitionRunning(true);
    }

    return () => {
      recog.stop();
      setIsRecognitionRunning(false);
    };
  }, [isRecording, isPaused, isSpeechOn]);

  return { isRecognitionRunning };
}
