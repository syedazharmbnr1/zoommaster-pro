"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Header } from "./ui/Header";
import { ThemeSelector } from "./ui/ThemeSelector";
import { StatusPanel } from "./ui/StatusPanel";
import { RecordingControls } from "./recording/RecordingControls";
import { ZoomGrid } from "./zoom/ZoomGrid";
import { RecordingCanvas } from "./recording/RecordingCanvas";
import { VideoPlayback } from "./recording/VideoPlayback";
import { ParticleEffect } from "./effects/ParticleEffect";
import { ZoomEvent, Caption, ThemeType, CursorIconType, Particle, WebcamPositionType } from "../types";
import { getThemeStyles } from "../utils/styles";

/**
 * The main application component directly implementing core functionality.
 * This approach avoids the hydration errors by using direct state management
 * instead of the context providers.
 */
export function ZoomMasterApp() {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);
  const [pauseTime, setPauseTime] = useState<number>(0);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isRecognitionRunning, setIsRecognitionRunning] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [smartZoomData, setSmartZoomData] = useState<ZoomEvent[]>([]);
  const [retrievedData, setRetrievedData] = useState<ZoomEvent[]>([]);
  const [overlayDot, setOverlayDot] = useState<{ x: number; y: number } | null>(null);

  // Video refs
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);
  
  // Capture dimensions
  const [capturedWidth, setCapturedWidth] = useState<number | null>(null);
  const [capturedHeight, setCapturedHeight] = useState<number | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  // Zoom state
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomCenter, setZoomCenter] = useState({ x: 0.5, y: 0.5 });
  const [gridOpacity, setGridOpacity] = useState(0.9);
  const [isHighlightOn, setIsHighlightOn] = useState(false);
  const animationFrameRef = useRef<number | undefined>(undefined);
  
  // Grid state
  const [hoveredDot, setHoveredDot] = useState<{ x: number; y: number } | null>(null);
  const [isGridHovered, setIsGridHovered] = useState(false);
  const [isGridExpanded, setIsGridExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Config
  const [theme, setTheme] = useState<ThemeType>("x");
  const [zoomMode, setZoomMode] = useState<"off" | "auto" | "grid">("grid");
  const [isWebcamOn, setIsWebcamOn] = useState(true);
  const [isSpeechOn, setIsSpeechOn] = useState(true);
  const [webcamPosition, setWebcamPosition] = useState<WebcamPositionType>("custom-right");
  const [cursorIcon, setCursorIcon] = useState<CursorIconType>("default");
  const [particles, setParticles] = useState<Particle[]>([]);

  // Configuration constants
  const gridSizeX = 16;
  const gridSizeY = 16;
  const gridWidth = 320;
  const gridHeight = 320;
  const dotSize = 8;
  const hoverScaleFactor = 2.5;
  const dotSpacingX = gridWidth / (gridSizeX - 1);
  const dotSpacingY = gridHeight / (gridSizeY - 1);
  
  // Theme styling
  const themeStyles = getThemeStyles(theme);

  // MediaRecorder reference 
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Speech Recognition for captions
  useEffect(() => {
    if (typeof window === 'undefined' || !("webkitSpeechRecognition" in window) || !isSpeechOn) return;

    const SpeechRecognition = (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.continuous = true;
    recog.interimResults = false;

    recog.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .filter((result: any) => result.isFinal)
        .map((result: any) => result[0].transcript)
        .join(" ");
      if (transcript) {
        const words = transcript.trim().split(/\s+/).slice(0, 4);
        const captionText = words.join(" ") + (words.length === 4 ? "..." : "");
        setCaptions([{ text: captionText, timestamp: Date.now() }]);
      }
    };

    recog.onerror = () => {
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
      if (recog) {
        try {
          recog.stop();
        } catch (e) {
          console.log('Speech recognition already stopped');
        }
      }
      setIsRecognitionRunning(false);
    };
  }, [isRecording, isPaused, isSpeechOn, isRecognitionRunning]);

  // Resource cleanup
  useEffect(() => {
    return () => {
      if (videoURL) URL.revokeObjectURL(videoURL);
      if (downloadURL) URL.revokeObjectURL(downloadURL);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (webcamStream) webcamStream.getTracks().forEach((track) => track.stop());
    };
  }, [videoURL, downloadURL, webcamStream]);

  // Particle animation for Galactic theme
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (theme !== "galactic") {
      setParticles([]);
      return;
    }

    const initParticles = () => {
      const newParticles = Array.from({ length: 150 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        size: Math.random() * 4 + 1,
        speed: Math.random() * 3 + 0.5,
      }));
      setParticles(newParticles);
    };

    let animationId: number;
    const animateParticles = () => {
      setParticles((prev) =>
        prev.map((p) => ({
          ...p,
          y: p.y > window.innerHeight ? 0 : p.y + p.speed,
          x: p.x + Math.sin(p.y * 0.01) * 3,
        }))
      );
      animationId = requestAnimationFrame(animateParticles);
    };

    initParticles();
    animationId = requestAnimationFrame(animateParticles);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [theme]);

  // Canvas rendering with zoom and webcam
  useEffect(() => {
    if (typeof window === 'undefined' || !isRecording || 
        !hiddenVideoRef.current || !canvasRef.current) return;

    const video = hiddenVideoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawFrame = () => {
      if (!video.videoWidth || !video.videoHeight) {
        animationFrameRef.current = requestAnimationFrame(drawFrame);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const vidW = video.videoWidth;
      const vidH = video.videoHeight;
      const centerX = vidW * zoomCenter.x;
      const centerY = vidH * zoomCenter.y;
      const zoomedW = vidW / zoomScale;
      const zoomedH = vidH / zoomScale;

      const sourceX = Math.max(0, Math.min(vidW - zoomedW, centerX - zoomedW / 2));
      const sourceY = Math.max(0, Math.min(vidH - zoomedH, centerY - zoomedH / 2));

      ctx.drawImage(video, sourceX, sourceY, zoomedW, zoomedH, 0, 0, canvas.width, canvas.height);

      if (isHighlightOn) {
        ctx.fillStyle = "rgba(0,255,255,0.2)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      if (webcamRef.current && webcamStream && isWebcamOn) {
        const webcam = webcamRef.current;
        const webcamW = 150;
        const webcamH = 150;
        let posX = 0;
        let posY = 0;
        switch (webcamPosition) {
          case "custom-right": posX = canvas.width - webcamW - 20; posY = canvas.height - webcamH - 20; break;
          case "bottom-left": posX = 20; posY = canvas.height - webcamH - 20; break;
          case "top-left": posX = 20; posY = 20; break;
          case "top-right": posX = canvas.width - webcamW - 20; posY = 20; break;
        }
        ctx.save();
        ctx.beginPath();
        ctx.arc(posX + webcamW / 2, posY + webcamH / 2, webcamW / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(webcam, posX, posY, webcamW, webcamH);
        ctx.restore();
      }

      // Display captions
      if (captions.length && isSpeechOn) {
        ctx.font = "36px sans-serif"; // Using a standard font instead of Orbitron
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.shadowColor = theme === "light" ? "#ccc" : "#000";
        ctx.shadowBlur = 10;

        const caption = captions[0];
        const age = Date.now() - caption.timestamp;
        const opacity = Math.max(0, 1 - age / 3000); // 3-second fade
        if (opacity > 0) {
          const y = canvas.height - 50;
          const textWidth = ctx.measureText(caption.text).width;

          // Caption background
          ctx.fillStyle = `${themeStyles.accentColor}${Math.round(opacity * 64).toString(16)}`;
          ctx.fillRect(canvas.width / 2 - textWidth / 2 - 15, y - 40, textWidth + 30, 50);

          // Caption text
          ctx.fillStyle = theme === "light" 
            ? `rgba(51,51,51,${opacity})` 
            : `${themeStyles.accentColor}${Math.round(opacity * 255).toString(16)}`;
          ctx.fillText(caption.text, canvas.width / 2, y);
        }
        ctx.shadowBlur = 0;
      }

      animationFrameRef.current = requestAnimationFrame(drawFrame);
    };

    animationFrameRef.current = requestAnimationFrame(drawFrame);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, zoomScale, zoomCenter, isHighlightOn, captions, isPaused, webcamStream, theme, isWebcamOn, webcamPosition, isSpeechOn, themeStyles.accentColor]);

  // Cursor style effect
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const cursorStyles: Record<CursorIconType, string> = {
      default: "default",
      hand: "pointer",
      zoom: "zoom-in",
      text: "text",
      grab: "grab",
      grabbing: "grabbing",
    };
    document.body.style.cursor = cursorStyles[cursorIcon];
    return () => {
      document.body.style.cursor = "default";
    };
  }, [cursorIcon]);

  // Auto zoom when recording
  useEffect(() => {
    if (typeof window === 'undefined' || !isRecording || zoomMode !== "auto") return;
    
    const handleMouseMove = (e: Event) => {
      if (!(e instanceof MouseEvent) || !hiddenVideoRef.current) return;
      
      const screenX = e.screenX;
      const screenY = e.screenY;

      let fracX = Math.max(0, Math.min(1, screenX / window.screen.width));
      let fracY = Math.max(0, Math.min(1, screenY / window.screen.height));

      const now = performance.now();
      const prevMove = (handleMouseMove as any).lastMove || { x: screenX, y: screenY, time: now };
      const dx = screenX - prevMove.x;
      const dy = screenY - prevMove.y;
      const dt = (now - prevMove.time) / 1000 || 0.001;
      const speed = Math.sqrt(dx * dx + dy * dy) / dt;

      let targetZoomScale = 1.0;
      let confidence = 0.5;
      let newCursorIcon: CursorIconType = "default";

      const selection = document.getSelection();
      const activeElement = document.activeElement;

      if (selection && selection.toString().length > 0 && selection.rangeCount > 0) {
        newCursorIcon = "hand";
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          fracX = Math.max(0, Math.min(1, (rect.left + rect.width / 2) / window.screen.width));
          fracY = Math.max(0, Math.min(1, (rect.top + rect.height / 2) / window.screen.height));
          targetZoomScale = 3.0;
          confidence = 0.95;
        }
      } else if (e.buttons === 1) {
        newCursorIcon = "grabbing";
        targetZoomScale = 2.0;
        confidence = 0.7;
      } else if (activeElement instanceof HTMLInputElement || activeElement instanceof HTMLTextAreaElement) {
        newCursorIcon = "text";
        const rect = activeElement.getBoundingClientRect();
        fracX = Math.max(0, Math.min(1, (rect.left + rect.width / 2) / window.screen.width));
        fracY = Math.max(0, Math.min(1, (rect.top + rect.height / 2) / window.screen.height));
        targetZoomScale = 2.0;
        confidence = 0.85;
      } else if (speed < 50) {
        newCursorIcon = "zoom";
        targetZoomScale = 2.5;
        confidence = 0.8;
      } else if (speed < 200) {
        newCursorIcon = "grab";
        targetZoomScale = 1.5;
        confidence = 0.6;
      } else {
        newCursorIcon = "default";
        targetZoomScale = 1.0;
        confidence = 0.5;
      }

      const smoothingFactor = 0.15;
      const minZoom = 1.0;
      const maxZoom = 3.0;

      setZoomCenter((prev) => ({
        x: prev.x + (fracX - prev.x) * smoothingFactor,
        y: prev.y + (fracY - prev.y) * smoothingFactor,
      }));
      
      setZoomScale((prev) => {
        const newScale = prev + (targetZoomScale - prev) * smoothingFactor;
        return Math.max(minZoom, Math.min(maxZoom, newScale));
      });
      
      setCursorIcon(newCursorIcon);

      if (recordStartTime !== null && sessionId && !isPaused) {
        const timeMs = performance.now() - recordStartTime - pauseTime;
        const newEvent: ZoomEvent = {
          session_id: sessionId,
          x: Math.round(fracX * (gridSizeX - 1)),
          y: Math.round(fracY * (gridSizeY - 1)),
          time_ms: timeMs,
          timestamp: Date.now(),
          zoom_level: zoomScale,
          confidence,
          should_zoom: targetZoomScale > minZoom,
        };
        setSmartZoomData((prev) => [...prev, newEvent]);
      }

      (handleMouseMove as any).lastMove = { x: screenX, y: screenY, time: now };
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseMove);
    window.addEventListener("mouseup", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseMove);
    };
  }, [isRecording, zoomMode, zoomScale, recordStartTime, pauseTime, sessionId, isPaused, gridSizeX]);

  // Start recording function
  const startRecording = async () => {
    try {
      if (typeof window === 'undefined' || !navigator.mediaDevices || isRecording || mediaRecorderRef.current) return;

      // Get screen stream with explicit type assertion for browser compatibility
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" } as any,
        audio: true,
      });

      const webcamStream = isWebcamOn
        ? await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
          })
        : null;

      if (!hiddenVideoRef.current || !canvasRef.current) return;

      // Set up screen preview
      hiddenVideoRef.current.srcObject = screenStream;
      hiddenVideoRef.current.muted = true;
      await hiddenVideoRef.current.play();

      // Set up webcam preview if enabled
      if (webcamStream && webcamRef.current) {
        webcamRef.current.srcObject = webcamStream;
        webcamRef.current.muted = true;
        await webcamRef.current.play();
        setWebcamStream(webcamStream);
      }

      // Configure canvas size
      const realW = Math.min(hiddenVideoRef.current.videoWidth || 1280, 1280);
      const realH = Math.min(hiddenVideoRef.current.videoHeight || 720, 720);
      setCapturedWidth(realW);
      setCapturedHeight(realH);

      const canvas = canvasRef.current;
      canvas.width = realW;
      canvas.height = realH;

      // Set up recording from canvas
      const canvasStream = canvas.captureStream(30);
      let combinedStream = canvasStream;

      // Mix audio if available
      if ('AudioContext' in window) {
        const audioContext = new AudioContext();
        const destination = audioContext.createMediaStreamDestination();

        if (screenStream.getAudioTracks().length > 0) {
          const screenSource = audioContext.createMediaStreamSource(screenStream);
          screenSource.connect(destination);
        }
        
        if (webcamStream && webcamStream.getAudioTracks().length > 0) {
          const webcamSource = audioContext.createMediaStreamSource(webcamStream);
          webcamSource.connect(destination);
        }

        if (destination.stream.getAudioTracks().length > 0) {
          combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...destination.stream.getAudioTracks()
          ]);
        }
      }

      // Create and start MediaRecorder
      const recorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setRecordedChunks(prev => [...prev, e.data]);
        }
      };
      
      recorder.onstop = () => {
        setIsRecording(false);
        setIsPaused(false);
      };
      
      // Start recording with smaller chunk size
      recorder.start(1000); // Capture data every second
      mediaRecorderRef.current = recorder;
      setRecordedChunks([]);

      // Generate session ID and start recording
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      setRecordStartTime(performance.now());
      setIsRecording(true);
    } catch (err) {
      console.error("Recording error:", err);
      alert("Could not start recording. Please check console for details.");
    }
  };

  // Pause recording function
  const pauseRecording = () => {
    if (!mediaRecorderRef.current || !isRecording || isPaused) return;
    mediaRecorderRef.current.pause();
    setIsPaused(true);
    setPauseTime(prev => prev + (performance.now() - (recordStartTime || 0)));
    if (recognition) recognition.stop();
  };

  // Resume recording function
  const resumeRecording = () => {
    if (!mediaRecorderRef.current || !isRecording || !isPaused) return;
    mediaRecorderRef.current.resume();
    setIsPaused(false);
    setRecordStartTime(performance.now());
    if (recognition && !isRecognitionRunning && isSpeechOn) {
      recognition.start();
      setIsRecognitionRunning(true);
    }
  };

  // Take snapshot function
  const takeSnapshot = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const snapshot = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = snapshot;
    link.download = `snapshot-${sessionId || Date.now()}.png`;
    link.click();
  };

  // Stop recording function
  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;

    // End recording
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    
    // Reset recording state
    setIsRecording(false);
    setIsPaused(false);

    // Stop and cleanup media streams
    if (hiddenVideoRef.current?.srcObject) {
      (hiddenVideoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      hiddenVideoRef.current.srcObject = null;
    }
    
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      setWebcamStream(null);
    }
    
    if (recognition) recognition.stop();
    setIsRecognitionRunning(false);
    setCaptions([]);
    setZoomMode("grid");
  };

  // Process recorded chunks when recording completes
  useEffect(() => {
    if (isRecording || recordedChunks.length === 0) return;
    
    try {
      // Create a video blob from the recorded chunks
      const blob = new Blob(recordedChunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      
      // Set URLs for playback and download
      setVideoURL(url);
      setDownloadURL(url);
      
      console.log("Recording completed. Blob size:", blob.size);
    } catch (error) {
      console.error("Error processing recording:", error);
    }
  }, [isRecording, recordedChunks]);

  // Handle playback position updates
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const currentTimeMs = videoRef.current.currentTime * 1000;
    const relevantEvent = [...retrievedData].reverse().find((ev) => ev.time_ms <= currentTimeMs);
    setOverlayDot(relevantEvent ? { x: relevantEvent.x, y: relevantEvent.y } : null);
  };

  // Grid zoom functions
  const handleGridMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomMode !== "grid") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const gx = Math.round(mouseX / dotSpacingX);
    const gy = Math.round(mouseY / dotSpacingY);

    if (gx >= 0 && gx < gridSizeX && gy >= 0 && gy < gridSizeY) {
      setHoveredDot({ x: gx, y: gy });
      if (isRecording && recordStartTime !== null && sessionId && !isPaused) {
        const timeMs = performance.now() - recordStartTime - pauseTime;
        const newEvent: ZoomEvent = {
          session_id: sessionId,
          x: gx,
          y: gy,
          time_ms: timeMs,
          timestamp: Date.now(),
          zoom_level: zoomScale,
          confidence: 1.0,
          should_zoom: true,
        };
        setSmartZoomData((prev) => [...prev, newEvent]);
        applyZoom(gx, gy, zoomScale);
      }
    } else {
      setHoveredDot(null);
      applyZoomReset();
    }
  };

  const handleGridMouseLeave = () => {
    if (zoomMode === "grid") {
      setHoveredDot(null);
      applyZoomReset();
    }
  };

  const applyZoom = (gridX: number, gridY: number, scale: number) => {
    if (!capturedWidth || !capturedHeight) return;
    const fracX = gridX / (gridSizeX - 1);
    const fracY = gridY / (gridSizeY - 1);
    setZoomCenter({ x: fracX, y: fracY });
    setZoomScale(scale);
  };

  const applyZoomReset = () => {
    if (zoomMode === "off" || zoomMode === "auto") {
      setZoomScale(1);
      setZoomCenter({ x: 0.5, y: 0.5 });
    } else if (zoomMode === "grid") {
      setZoomCenter({ x: 0.5, y: 0.5 });
      setZoomScale(isGridHovered ? 1.5 : 1);
    }
  };

  // Style functions
  const overlayDotStyle = (): React.CSSProperties => {
    if (!overlayDot) return { display: "none" };
    const containerWidth = 800;
    const containerHeight = 600;
    const scale = 2.5;
    const px = (overlayDot.x / (gridSizeX - 1)) * containerWidth;
    const py = (overlayDot.y / (gridSizeY - 1)) * containerHeight;
    return {
      position: "absolute",
      left: px - (dotSize * scale) / 2,
      top: py - (dotSize * scale) / 2,
      width: dotSize * scale,
      height: dotSize * scale,
      borderRadius: "50%",
      backgroundColor: themeStyles.accentColor,
      boxShadow: `0 0 15px ${themeStyles.accentColor}80`,
      pointerEvents: "none",
    };
  };

  const gridDotStyle = (x: number, y: number): React.CSSProperties => {
    const isHovered = hoveredDot?.x === x && hoveredDot?.y === y;
    const scale = isHovered ? hoverScaleFactor : 1;
    const baseColor = theme === "light" ? "#333" : "#fff";
    const hoverColor = themeStyles.accentColor;
    return {
      position: "absolute",
      left: x * dotSpacingX - (dotSize * scale) / 2,
      top: y * dotSpacingY - (dotSize * scale) / 2,
      width: dotSize * scale,
      height: dotSize * scale,
      borderRadius: "50%",
      backgroundColor: isHovered ? hoverColor : baseColor,
      boxShadow: isHovered ? `0 0 25px ${hoverColor}` : `0 0 5px ${baseColor}80`,
      transition: "all 0.2s ease",
      pointerEvents: "none",
    };
  };

  const gridLineStyle = (x1: number, y1: number, x2: number, y2: number): React.CSSProperties => {
    const startX = x1 * dotSpacingX;
    const startY = y1 * dotSpacingY;
    const endX = x2 * dotSpacingX;
    const endY = y2 * dotSpacingY;
    const dx = endX - startX;
    const dy = endY - startY;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
    return {
      position: "absolute",
      left: startX,
      top: startY,
      width: length,
      height: 1,
      background: theme === "light" ? "rgba(51,51,51,0.3)" : "rgba(255,255,255,0.3)",
      transformOrigin: "0 50%",
      transform: `rotate(${angle}deg)`,
      pointerEvents: "none",
    };
  };

  const buttonStyle = (bgColor: string, textColor: string): React.CSSProperties => ({
    padding: "12px 24px",
    borderRadius: 8,
    background: bgColor,
    color: textColor,
    border: "none",
    cursor: "pointer",
    fontSize: "1.2rem",
    fontWeight: 600,
    boxShadow: `0 0 10px ${bgColor}40`,
    transition: "all 0.3s ease",
  });

  const floatingButtonStyle = (bgColor: string, textColor: string): React.CSSProperties => ({
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: bgColor,
    color: textColor,
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: `0 0 20px ${bgColor}40`,
    transition: "all 0.3s ease",
  });

  return (
    <div style={{
      minHeight: "100vh",
      background: themeStyles.background,
      color: themeStyles.textColor,
      padding: "20px",
      fontFamily: "system-ui, sans-serif",
      overflowY: "auto",
      position: "relative",
    }}>
      {/* Particle effect */}
      {theme === "galactic" && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }}>
          {particles.map((p, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: p.x,
                top: p.y,
                width: p.size,
                height: p.size,
                borderRadius: "50%",
                background: "rgba(0,255,255,0.6)",
                boxShadow: "0 0 12px rgba(0,255,255,0.8)",
              }}
            />
          ))}
        </div>
      )}

      {/* Hidden video elements */}
      <video ref={hiddenVideoRef} style={{ display: "none" }} muted playsInline />
      <video ref={webcamRef} style={{ display: "none" }} muted playsInline />

      {/* Header */}
      <header style={{ width: "100%", maxWidth: 1280, margin: "0 auto 20px", textAlign: "center", position: "relative" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 700, color: themeStyles.primaryColor, textShadow: `0 0 20px ${themeStyles.primaryColor}cc` }}>
          ZoomMaster Pro
        </h1>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          style={{
            marginTop: "20px",
            padding: "12px 24px",
            borderRadius: 8,
            background: isRecording ? "#ff3366" : themeStyles.buttonBg,
            color: themeStyles.textColor,
            border: "none",
            cursor: "pointer",
            fontSize: "1.2rem",
            fontWeight: 600,
            boxShadow: `0 0 20px ${isRecording ? "#ff3366" : themeStyles.accentColor}66`,
            transition: "all 0.3s ease",
          }}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </button>
      </header>

      {/* Theme selector */}
      <div style={{ position: "fixed", top: 20, right: 20, display: "flex", gap: 10, zIndex: 10001 }}>
        <button 
          onClick={() => setTheme("galactic")} 
          style={floatingButtonStyle(theme === "galactic" ? "#00cc99" : themeStyles.buttonBg, themeStyles.textColor)} 
          title="Galactic Theme"
        >
          🌌
        </button>
        <button 
          onClick={() => setTheme("x")} 
          style={floatingButtonStyle(theme === "x" ? "#1DA1F2" : themeStyles.buttonBg, themeStyles.textColor)} 
          title="X Theme"
        >
          X
        </button>
        <button 
          onClick={() => setTheme("dark")} 
          style={floatingButtonStyle(theme === "dark" ? "#fff" : themeStyles.buttonBg, themeStyles.textColor)} 
          title="Dark Theme"
        >
          🌙
        </button>
        <button 
          onClick={() => setTheme("light")} 
          style={floatingButtonStyle(theme === "light" ? "#333" : themeStyles.buttonBg, themeStyles.textColor)} 
          title="Light Theme"
        >
          ☀️
        </button>
      </div>

      {/* Recording controls */}
      <div style={{ position: "fixed", right: 20, top: "50%", transform: "translateY(-50%)", display: "flex", flexDirection: "column", gap: 10, zIndex: 10000 }}>
        <button 
          onClick={() => setZoomMode(zoomMode === "off" ? "auto" : "off")} 
          style={floatingButtonStyle(zoomMode === "off" ? "#888" : themeStyles.selectorBg, themeStyles.textColor)} 
          title={zoomMode === "off" ? "Enable Auto Zoom" : "Disable Zoom"}
        >
          {zoomMode === "off" ? "🔍" : "🚫"}
        </button>
        <button 
          onClick={() => setZoomMode(zoomMode === "grid" ? "auto" : "grid")} 
          style={floatingButtonStyle(zoomMode === "grid" ? "#ffaa33" : themeStyles.selectorBg, themeStyles.textColor)} 
          title={zoomMode === "grid" ? "Switch to Auto Zoom" : "Switch to Grid Zoom"}
        >
          {zoomMode === "grid" ? "🌐" : "📊"}
        </button>
        {isRecording && (
          <>
            <button 
              onClick={isPaused ? resumeRecording : pauseRecording} 
              style={floatingButtonStyle(isPaused ? "#00cc99" : "#ff3366", themeStyles.textColor)} 
              title={isPaused ? "Resume" : "Pause"}
            >
              {isPaused ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill={themeStyles.textColor}><path d="M8 5v14l11-7z" /></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={themeStyles.textColor} strokeWidth="2">
                  <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                </svg>
              )}
            </button>
            <button 
              onClick={takeSnapshot} 
              style={floatingButtonStyle(themeStyles.accentColor, themeStyles.textColor)} 
              title="Snapshot"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={themeStyles.textColor} strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" />
              </svg>
            </button>
            <button 
              onClick={() => setIsHighlightOn(!isHighlightOn)} 
              style={floatingButtonStyle(isHighlightOn ? "#ff3366" : themeStyles.buttonBg, themeStyles.textColor)} 
              title="Highlight"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill={isHighlightOn ? themeStyles.textColor : "none"} stroke={themeStyles.textColor} strokeWidth="2">
                <path d="M12 2l2.5 6.5h6.5l-5.3 4.3 2 6.5-6.2-4.8-6.2 4.8 2-6.5L2 8.5h6.5z" />
              </svg>
            </button>
          </>
        )}
        <button 
          onClick={() => setIsWebcamOn(!isWebcamOn)} 
          style={floatingButtonStyle(isWebcamOn ? themeStyles.buttonBg : "#888", themeStyles.textColor)} 
          title={isWebcamOn ? "Disable Webcam" : "Enable Webcam"}
        >
          {isWebcamOn ? "📷" : "🚫📷"}
        </button>
        <button 
          onClick={() => setIsSpeechOn(!isSpeechOn)} 
          style={floatingButtonStyle(isSpeechOn ? themeStyles.buttonBg : "#888", themeStyles.textColor)} 
          title={isSpeechOn ? "Disable Speech" : "Enable Speech"}
        >
          {isSpeechOn ? "🎤" : "🚫🎤"}
        </button>
        <select
          value={webcamPosition}
          onChange={(e) => setWebcamPosition(e.target.value as WebcamPositionType)}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: themeStyles.buttonBg,
            color: themeStyles.textColor,
            border: `1px solid ${themeStyles.accentColor}`,
            cursor: "pointer",
            fontSize: "1rem",
            textAlign: "center",
            boxShadow: `0 0 20px ${themeStyles.accentColor}40`,
          }}
        >
          <option value="custom-right" style={{ background: themeStyles.background, color: themeStyles.textColor }}>↘</option>
          <option value="bottom-left" style={{ background: themeStyles.background, color: themeStyles.textColor }}>↙</option>
          <option value="top-left" style={{ background: themeStyles.background, color: themeStyles.textColor }}>↖</option>
          <option value="top-right" style={{ background: themeStyles.background, color: themeStyles.textColor }}>↗</option>
        </select>
      </div>

      {/* Status panel */}
      {isRecording && (
        <div style={{ position: "fixed", top: 20, left: 20, padding: "20px", background: themeStyles.gridBg, borderRadius: 20, boxShadow: `0 0 50px ${themeStyles.accentColor}99`, zIndex: 10001, color: themeStyles.textColor }}>
          <div style={{ color: themeStyles.primaryColor }}>Zoom: {zoomScale.toFixed(1)}x</div>
          <div style={{ color: themeStyles.primaryColor }}>Time: {recordStartTime && !isPaused ? ((performance.now() - recordStartTime - pauseTime) / 1000).toFixed(1) : "0.0"}s</div>
          <div style={{ color: themeStyles.primaryColor }}>Status: {isPaused ? "Paused" : "Recording"}</div>
          <div style={{ color: themeStyles.primaryColor }}>Zoom Mode: {zoomMode}</div>
          <div style={{ color: themeStyles.primaryColor }}>Webcam: {isWebcamOn ? "On" : "Off"}</div>
          <div style={{ color: themeStyles.primaryColor }}>Speech: {isSpeechOn ? "On" : "Off"}</div>
          <div style={{ color: themeStyles.primaryColor }}>Cursor: {cursorIcon}</div>
        </div>
      )}

      {/* Zoom grid controls */}
      <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 9999, width: isGridExpanded ? gridWidth + 40 : 40, transition: "width 0.3s ease" }}>
        {isGridExpanded ? (
          <div style={{ background: themeStyles.gridBg, borderRadius: 20, padding: "20px", boxShadow: `0 4px 20px ${themeStyles.accentColor}33`, width: gridWidth }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: themeStyles.textColor }}>Zoom Controls</span>
              <div style={{ display: "flex", gap: 10 }}>
                <button 
                  onClick={() => setShowSettings(!showSettings)} 
                  style={floatingButtonStyle(themeStyles.settingsBg, themeStyles.textColor)} 
                  title="Settings"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={themeStyles.textColor} strokeWidth="2">
                    <path d="M12 8a4 4 0 0 0-4 4 4 4 0 0 0 4 4 4 4 0 0 0 4-4 4 4 0 0 0-4-4zm0 6a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2z" />
                    <path d="M19.4 14.6l1.5 2.6-2.8 1.6-1.5-2.6a6 6 0 0 1-2.2 1.3l-.5 3.1h-3l-.5-3.1a6 6 0 0 1-2.2-1.3l-1.5 2.6-2.8-1.6 1.5-2.6a6 6 0 0 1-1.3-2.2L1 11h3.1a6 6 0 0 1 1.3-2.2L4 6.2 6.8 4.6l1.5 2.6a6 6 0 0 1 2.2-1.3L11 3h3l.5 3.1a6 6 0 0 1 2.2 1.3l1.5-2.6 2.8 1.6-1.5 2.6a6 6 0 0 1 1.3 2.2L23 11h-3.1a6 6 0 0 1-1.3 2.2z" />
                  </svg>
                </button>
                <div 
                  style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    cursor: "pointer", 
                    background: themeStyles.primaryColor, 
                    borderRadius: "50%", 
                    width: 24, 
                    height: 24, 
                    justifyContent: "center", 
                    boxShadow: `0 0 10px ${themeStyles.accentColor}40` 
                  }} 
                  onClick={() => setIsGridExpanded(false)}
                >
                  <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, color: themeStyles.textColor }}>
                    <g><path d="M12 11.59L3.96 3.54 2.54 4.96 12 14.41l9.46-9.45-1.42-1.42L12 11.59zm0 7l-8.04-8.05-1.42 1.42L12 21.41l9.46-9.45-1.42-1.42L12 18.59z" /></g>
                  </svg>
                </div>
              </div>
            </div>
            <div 
              style={{ width: gridWidth, height: gridHeight - 80, position: "relative" }} 
              onMouseMove={handleGridMouseMove} 
              onMouseEnter={() => { setIsGridHovered(true); if (zoomMode === "grid") setZoomScale(1.5); }} 
              onMouseLeave={handleGridMouseLeave}
            >
              {Array.from({ length: gridSizeX }).flatMap((_, x) =>
                Array.from({ length: gridSizeY }).flatMap((_, y) => {
                  const segments: React.ReactNode[] = [];
                  if (x < gridSizeX - 1) segments.push(<div key={`h-${x}-${y}`} style={gridLineStyle(x, y, x + 1, y)} />);
                  if (y < gridSizeY - 1) segments.push(<div key={`v-${x}-${y}`} style={gridLineStyle(x, y, x, y + 1)} />);
                  return segments;
                })
              )}
              {Array.from({ length: gridSizeX }, (_, x) => 
                Array.from({ length: gridSizeY }, (_, y) => (
                  <div key={`dot-${x}-${y}`} style={gridDotStyle(x, y)} />
                ))
              )}
            </div>
          </div>
        ) : (
          <div 
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: "50%", 
              background: themeStyles.collapseBg, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              cursor: "pointer", 
              boxShadow: `0 4px 10px ${themeStyles.accentColor}33` 
            }} 
            onClick={() => setIsGridExpanded(true)}
          >
            <svg viewBox="0 0 24 24" style={{ width: 20, height: 20, color: themeStyles.primaryColor }}>
              <g><path d="M12 4.41L2.54 13.86l1.42 1.42L12 7.59l8.04 7.69 1.42-1.42L12 4.41zm0 14.18l-8.04-8.05-1.42 1.42L12 21.41l9.46-9.45-1.42-1.42L12 18.59z" /></g>
            </svg>
          </div>
        )}
      </div>

      {/* Settings panel */}
      {showSettings && isGridExpanded && (
        <div 
          style={{ 
            position: "fixed", 
            bottom: gridHeight + 60, 
            right: 20, 
            width: 300, 
            padding: "20px", 
            background: themeStyles.gridBg, 
            borderRadius: 20, 
            boxShadow: `0 0 70px ${themeStyles.accentColor}99`, 
            zIndex: 10000, 
            color: themeStyles.textColor 
          }}
        >
          <h3 style={{ margin: "0 0 20px", fontSize: "1.5rem", color: themeStyles.primaryColor }}>Settings</h3>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "block", marginBottom: 5, color: themeStyles.textColor }}>Zoom Level:</label>
            <input 
              type="range" 
              min="1" 
              max="10" 
              step="0.1" 
              value={zoomScale} 
              onChange={(e) => setZoomScale(parseFloat(e.target.value))} 
              style={{ width: "100%" }} 
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: 5, color: themeStyles.textColor }}>Grid Opacity:</label>
            <input 
              type="range" 
              min="0.1" 
              max="1" 
              step="0.1" 
              value={gridOpacity} 
              onChange={(e) => setGridOpacity(parseFloat(e.target.value))} 
              style={{ width: "100%" }} 
            />
          </div>
        </div>
      )}

      {/* Recording canvas */}
      <main style={{ maxWidth: 1280, width: "100%", position: "relative", margin: "100px auto 0" }}>
        <div 
          style={{ 
            position: "relative", 
            width: "100%", 
            maxWidth: 1280, 
            height: 720, 
            background: themeStyles.collapseBg, 
            borderRadius: 40, 
            overflow: "hidden", 
            boxShadow: `0 40px 100px ${themeStyles.accentColor}80, inset 0 0 40px ${themeStyles.secondaryColor}`, 
            border: `2px solid ${themeStyles.primaryColor}66` 
          }}
        >
          <canvas 
            ref={canvasRef} 
            style={{ 
              width: "100%", 
              height: "100%", 
              background: themeStyles.gridBg, 
              display: isRecording ? "block" : "none" 
            }} 
          />
          {isRecording && (
            <div 
              style={{ 
                position: "absolute", 
                top: 30, 
                left: 30, 
                padding: "14px 28px", 
                background: themeStyles.secondaryColor, 
                borderRadius: 14, 
                fontSize: "1.3rem", 
                color: themeStyles.textColor, 
                textShadow: `0 0 12px ${themeStyles.primaryColor}cc` 
              }}
            >
              Live
            </div>
          )}
        </div>

        {/* Video playback */}
        {videoURL && (
          <div 
            style={{ 
              position: "relative", 
              width: "100%", 
              maxWidth: 1280, 
              height: 600, 
              marginTop: 80, 
              background: themeStyles.collapseBg, 
              borderRadius: 40, 
              overflow: "hidden", 
              boxShadow: `0 40px 100px ${themeStyles.accentColor}80, inset 0 0 40px ${themeStyles.secondaryColor}`, 
              border: `2px solid ${themeStyles.primaryColor}66` 
            }}
          >
            <h2 
              style={{ 
                textAlign: "center", 
                margin: "30px 0", 
                fontSize: "2.2rem", 
                color: themeStyles.primaryColor, 
                textShadow: `0 0 20px ${themeStyles.primaryColor}cc` 
              }}
            >
              Playback
            </h2>
            <video 
              ref={videoRef} 
              src={videoURL} 
              controls 
              onTimeUpdate={handleTimeUpdate} 
              style={{ width: "100%", height: 540, background: themeStyles.gridBg }} 
            />
            <div style={{ position: "absolute", top: 60, left: 0, width: "100%", height: 540, pointerEvents: "none" }}>
              {overlayDot && <div style={overlayDotStyle()} />}
            </div>
            <div 
              style={{ 
                position: "absolute", 
                bottom: 30, 
                right: 30, 
                padding: "14px 28px", 
                background: themeStyles.secondaryColor, 
                borderRadius: 14, 
                fontSize: "1.2rem", 
                color: themeStyles.textColor, 
                textShadow: `0 0 12px ${themeStyles.primaryColor}cc` 
              }}
            >
              Recorded
            </div>
            <div style={{ position: "absolute", bottom: 30, left: 30, display: "flex", gap: 30 }}>
              <button 
                onClick={() => videoRef.current?.play()} 
                style={{ 
                  ...buttonStyle(themeStyles.buttonBg, themeStyles.textColor), 
                  boxShadow: `0 0 35px ${themeStyles.accentColor}80`, 
                  transition: "all 0.3s ease" 
                }} 
                onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 45px ${themeStyles.accentColor}`)} 
                onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 0 35px ${themeStyles.accentColor}80`)}
              >
                Replay
              </button>
              
              {downloadURL && (
                <a 
                  href={downloadURL} 
                  download={`recording-${sessionId || Date.now()}.webm`} 
                  style={{ 
                    ...buttonStyle(themeStyles.accentColor, themeStyles.textColor), 
                    boxShadow: `0 0 35px ${themeStyles.accentColor}80`, 
                    transition: "all 0.3s ease", 
                    textDecoration: "none", 
                    lineHeight: "3.2rem" 
                  }} 
                  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 45px ${themeStyles.accentColor}`)} 
                  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 0 35px ${themeStyles.accentColor}80`)}
                >
                  Download
                </a>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Global animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes particleGlow {
          0% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.3); }
          100% { opacity: 0.6; transform: scale(1); }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}} />
    </div>
  );
}
