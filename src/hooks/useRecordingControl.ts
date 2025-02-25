import { useEffect } from "react";
import { useRecording } from "../context/RecordingContext";
import { mediaRecorderRef, generateSessionId, createRecordingBlob } from "../utils/mediaUtils";
import { useConfig } from "../context/ConfigContext";
import { useZoom } from "../context/ZoomContext";

// Define extended interface for DisplayMediaOptions to include cursor property
interface DisplayMediaOptions {
  video?: { cursor?: string } & MediaTrackConstraints;
  audio?: boolean | MediaTrackConstraints;
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
  
  const { isWebcamOn, isSpeechOn } = useConfig();
  const { setZoomMode } = useZoom();

  // Process recorded chunks when recording is complete
  useEffect(() => {
    if (!isRecording && recordedChunks.length > 0) {
      const blob = createRecordingBlob(recordedChunks);
      const newUrl = URL.createObjectURL(blob);
      setVideoURL(newUrl);
      setDownloadURL(newUrl);
    }
  }, [isRecording, recordedChunks, setVideoURL, setDownloadURL]);

  // Cleanup resources when component unmounts
  useEffect(() => {
    return () => {
      if (webcamStream) {
        webcamStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [webcamStream]);

  const startRecording = async () => {
    // Only run this in browser environment
    if (typeof window === 'undefined' || !window.navigator?.mediaDevices) {
      console.error("Browser APIs not available");
      return;
    }
    
    try {
      if (isRecording || mediaRecorderRef.current) return;

      // Use the extended interface with type assertion for getDisplayMedia
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: true,
      } as DisplayMediaOptions);

      const webcamStream = isWebcamOn
        ? await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          })
        : null;

      if (!hiddenVideoRef.current || !canvasRef.current) return;

      hiddenVideoRef.current.srcObject = screenStream;
      hiddenVideoRef.current.muted = true;
      await hiddenVideoRef.current.play();

      if (webcamStream && webcamRef.current) {
        webcamRef.current.srcObject = webcamStream;
        webcamRef.current.muted = true;
        await webcamRef.current.play();
        setWebcamStream(webcamStream);
      }

      const realW = Math.min(hiddenVideoRef.current.videoWidth || 1280, 1280);
      const realH = Math.min(hiddenVideoRef.current.videoHeight || 720, 720);
      setCapturedWidth(realW);
      setCapturedHeight(realH);

      const canvas = canvasRef.current;
      canvas.width = realW;
      canvas.height = realH;

      const canvasStream = canvas.captureStream(30);
      let combinedStream = canvasStream;

      // Only use AudioContext in browser environment
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
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
      }

      const recorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm; codecs=vp9,opus",
      });
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) setRecordedChunks((prev) => [...prev, e.data]);
      };
      recorder.onstop = () => {
        setIsRecording(false);
        setIsPaused(false);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecordedChunks([]);

      const newSessionId = generateSessionId();
      setSessionId(newSessionId);
      setRecordStartTime(performance.now());
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Could not start recording. Check permissions and console.");
    }
  };

  const pauseRecording = () => {
    if (!mediaRecorderRef.current || !isRecording || isPaused) return;
    mediaRecorderRef.current.pause();
    setIsPaused(true);
    setPauseTime((prev) => prev + (performance.now() - (recordStartTime || 0)));
    if (recognition) recognition.stop();
  };

  const resumeRecording = () => {
    if (!mediaRecorderRef.current || !isRecording || !isPaused) return;
    mediaRecorderRef.current.resume();
    setIsPaused(false);
    setRecordStartTime(performance.now());
    if (recognition && !isSpeechOn) {
      recognition.start();
      setIsRecognitionRunning(true);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
    setIsPaused(false);

    if (hiddenVideoRef.current?.srcObject) {
      (hiddenVideoRef.current.srcObject as MediaStream).getTracks().forEach((track) => track.stop());
      hiddenVideoRef.current.srcObject = null;
    }
    if (webcamStream) {
      webcamStream.getTracks().forEach((track) => track.stop());
      setWebcamStream(null);
    }
    if (recognition) recognition.stop();
    setIsRecognitionRunning(false);
    setCaptions([]);
    setZoomMode("grid");
  };

  const takeSnapshot = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const snapshot = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = snapshot;
    link.download = `snapshot-${sessionId || Date.now()}.png`;
    link.click();
  };

  return {
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    takeSnapshot,
  };
}
