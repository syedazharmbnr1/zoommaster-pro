import { useEffect, useState } from "react";
import { useRecording } from "../context/RecordingContext";
import { mediaRecorderRef, generateSessionId, createRecordingBlob, stopMediaStream } from "../utils/mediaUtils";
import { useConfig } from "../context/ConfigContext";
import { useZoom } from "../context/ZoomContext";

// Define extended interface for DisplayMediaOptions to include cursor property
interface DisplayMediaOptions {
  video?: { cursor?: string } & MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
}

// Define custom type for MediaRecorder error event
interface MediaRecorderErrorEvent extends Event {
  name?: string;
  message?: string;
  error?: any;
}

/**
 * Hook for controlling the recording process
 */
export function useRecordingControl() {
  const {
    isRecording,
    isPaused,
    recordedChunks,
    sessionId,
    recordStartTime,
    pauseTime,
    hiddenVideoRef,
    canvasRef,
    videoRef,
    webcamRef,
    webcamStream,
    recognition,
    setIsRecording,
    setIsPaused,
    setRecordedChunks,
    setVideoURL,
    setDownloadURL,
    setSessionId,
    setRecordStartTime,
    setPauseTime,
    setCapturedWidth,
    setCapturedHeight,
    setWebcamStream,
    setIsRecognitionRunning,
    setCaptions,
  } = useRecording();
  
  const { isWebcamOn, setIsWebcamOn, isSpeechOn } = useConfig();
  const { setZoomMode } = useZoom();
  
  // Debug state
  const [debug, setDebug] = useState<string>("");

  // Process recorded chunks when recording is complete
  useEffect(() => {
    if (!isRecording && recordedChunks.length > 0) {
      console.log("Processing recorded chunks", recordedChunks.length);
      try {
        const blob = createRecordingBlob(recordedChunks);
        console.log("Created recording blob", blob.size, "bytes");
        setDebug(`Blob created: ${blob.size} bytes, type: ${blob.type}`);
        
        // Create URLs for video playback and download
        const newUrl = URL.createObjectURL(blob);
        console.log("Created URL for blob", newUrl);
        setVideoURL(newUrl);
        setDownloadURL(newUrl);
      } catch (err) {
        console.error("Error creating blob:", err);
        setDebug(`Error creating blob: ${err}`);
      }
    }
  }, [isRecording, recordedChunks, setVideoURL, setDownloadURL]);

  // Cleanup resources when component unmounts
  useEffect(() => {
    return () => {
      stopMediaStream(webcamStream);
      if (videoRef.current?.src) {
        URL.revokeObjectURL(videoRef.current.src);
      }
    };
  }, [webcamStream, videoRef]);

  const startRecording = async () => {
    // Only run this in browser environment
    if (typeof window === 'undefined' || !window.navigator?.mediaDevices) {
      console.error("Browser APIs not available");
      return;
    }
    
    try {
      if (isRecording || mediaRecorderRef.current) return;

      console.log("Starting recording...");
      setDebug("Starting recording...");

      // Use the extended interface with type assertion for getDisplayMedia
      let screenStream;
      try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: "always" },
          audio: true,
        } as DisplayMediaOptions);
      } catch (err) {
        console.error("Error getting screen media:", err);
        alert("Please grant screen sharing permission to record.");
        return;
      }

      // Try to get webcam access if enabled, but make it optional
      let webcamStream = null;
      if (isWebcamOn) {
        try {
          webcamStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          });
        } catch (err) {
          console.warn("Webcam access error (continuing without webcam):", err);
          setDebug(prev => `${prev}\nWebcam not available, continuing without it.`);
          setIsWebcamOn(false); // Disable webcam since it's not available
        }
      }

      if (!hiddenVideoRef.current || !canvasRef.current) {
        console.error("Video or canvas references not available");
        stopMediaStream(screenStream);
        stopMediaStream(webcamStream);
        return;
      }

      hiddenVideoRef.current.srcObject = screenStream;
      hiddenVideoRef.current.muted = true;
      await hiddenVideoRef.current.play();

      if (webcamStream && webcamRef.current) {
        webcamRef.current.srcObject = webcamStream;
        webcamRef.current.muted = true;
        await webcamRef.current.play();
        setWebcamStream(webcamStream);
      }

      // Wait for video dimensions
      await new Promise(resolve => setTimeout(resolve, 500));

      const realW = Math.min(hiddenVideoRef.current.videoWidth || 1280, 1280);
      const realH = Math.min(hiddenVideoRef.current.videoHeight || 720, 720);
      setCapturedWidth(realW);
      setCapturedHeight(realH);

      console.log(`Canvas size set to ${realW}x${realH}`);
      setDebug(prev => `${prev}\nCanvas: ${realW}x${realH}`);

      const canvas = canvasRef.current;
      canvas.width = realW;
      canvas.height = realH;

      const canvasStream = canvas.captureStream(30);
      let combinedStream = canvasStream;

      // Only use AudioContext in browser environment
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        try {
          const audioContext = new AudioContext();
          const destination = audioContext.createMediaStreamDestination();

          if (screenStream.getAudioTracks().length > 0) {
            const screenSource = audioContext.createMediaStreamSource(screenStream);
            screenSource.connect(destination);
          }
          // Fixed: Added proper null check before accessing getAudioTracks method
          if (webcamStream && webcamStream.getAudioTracks().length > 0) {
            const webcamSource = audioContext.createMediaStreamSource(webcamStream);
            webcamSource.connect(destination);
          }

          if (destination.stream.getAudioTracks().length > 0) {
            combinedStream = new MediaStream([...canvasStream.getVideoTracks(), ...destination.stream.getAudioTracks()]);
          }
        } catch (err) {
          console.warn("Audio mixing not supported, using default audio", err);
          // Continue with just the canvas stream
        }
      }

      // Define supported codecs
      const mimeTypes = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4'
      ];
      
      // Find the first supported MIME type
      let mimeType = '';
      for (const type of mimeTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          mimeType = type;
          break;
        }
      }
      
      console.log(`Using MIME type: ${mimeType || 'Default browser codec'}`);
      setDebug(prev => `${prev}\nMIME: ${mimeType || 'Default codec'}`);

      // Create recorder with options
      const recorderOptions: MediaRecorderOptions = {};
      if (mimeType) {
        recorderOptions.mimeType = mimeType;
      }

      const recorder = new MediaRecorder(combinedStream, recorderOptions);
      console.log("MediaRecorder created");

      // Clear any existing chunks
      setRecordedChunks([]);
      
      // Set up data handling
      recorder.ondataavailable = (e) => {
        console.log(`Received data chunk: ${e.data?.size} bytes`);
        if (e.data && e.data.size > 0) {
          setRecordedChunks((prev: Blob[]) => [...prev, e.data]);
        }
      };
      
      recorder.onstop = () => {
        console.log("Recording stopped");
        setIsRecording(false);
        setIsPaused(false);
      };
      
      // Set up error handling with correct type
      recorder.onerror = (event: Event) => {
        console.error("MediaRecorder error:", event);
        const errorEvent = event as MediaRecorderErrorEvent;
        // Extract error information safely, with fallbacks
        const errorMessage = errorEvent.message || errorEvent.name || 'Unknown error';
        setDebug(prev => `${prev}\nError: ${errorMessage}`);
      };

      // Start recording with a timeslice to get frequent data chunks
      recorder.start(1000); // Get data every second
      mediaRecorderRef.current = recorder;

      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      setRecordStartTime(performance.now());
      setIsRecording(true);
      console.log("Recording started");
    } catch (err) {
      console.error("Error starting recording:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setDebug(prev => `${prev}\nStart error: ${errorMessage}`);
      alert("Could not start recording. Check permissions and console.");
    }
  };

  const pauseRecording = () => {
    if (!mediaRecorderRef.current || !isRecording || isPaused) return;
    console.log("Pausing recording");
    try {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      setPauseTime((prev) => prev + (performance.now() - (recordStartTime || 0)));
      if (recognition && typeof recognition.stop === 'function') {
        recognition.stop();
      }
    } catch (err) {
      console.error("Error pausing recording:", err);
    }
  };

  const resumeRecording = () => {
    if (!mediaRecorderRef.current || !isRecording || !isPaused) return;
    console.log("Resuming recording");
    try {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      setRecordStartTime(performance.now());
      if (recognition && isSpeechOn && typeof recognition.start === 'function') {
        // Add delay to avoid race conditions
        setTimeout(() => {
          if (recognition && isSpeechOn) {
            try {
              recognition.start();
              setIsRecognitionRunning(true);
            } catch (err) {
              console.warn("Could not start speech recognition on resume:", err);
            }
          }
        }, 500);
      }
    } catch (err) {
      console.error("Error resuming recording:", err);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    console.log("Stopping recording");

    try {
      // Request a final data chunk before stopping
      if (mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.requestData();
        } catch (e) {
          console.warn("Could not request final data chunk", e);
        }
        
        // Stop the recorder after a small delay to ensure data is processed
        setTimeout(() => {
          if (mediaRecorderRef.current) {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current = null;
          }
        }, 100);
      } else {
        mediaRecorderRef.current = null;
      }
      
      setIsRecording(false);
      setIsPaused(false);

      if (hiddenVideoRef.current?.srcObject) {
        stopMediaStream(hiddenVideoRef.current.srcObject as MediaStream);
        hiddenVideoRef.current.srcObject = null;
      }
      
      if (webcamStream) {
        stopMediaStream(webcamStream);
        setWebcamStream(null);
      }
      
      if (recognition && typeof recognition.stop === 'function') {
        try {
          recognition.stop();
        } catch (err) {
          console.warn("Error stopping speech recognition:", err);
        }
      }
      setIsRecognitionRunning(false);
      setCaptions([]);
      setZoomMode("grid");
    } catch (err) {
      console.error("Error stopping recording:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setDebug(prev => `${prev}\nStop error: ${errorMessage}`);
    }
  };

  const takeSnapshot = () => {
    if (!canvasRef.current) return;
    console.log("Taking snapshot");
    try {
      const canvas = canvasRef.current;
      const snapshot = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = snapshot;
      link.download = `snapshot-${sessionId || Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      console.error("Error taking snapshot:", err);
    }
  };

  return {
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    takeSnapshot,
    debug,
  };
}