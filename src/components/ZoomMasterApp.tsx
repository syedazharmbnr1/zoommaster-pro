"use client";

import React, { useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useRecording } from "../context/RecordingContext";
import { useZoom } from "../context/ZoomContext";
import { Header } from "./ui/Header";
import { ThemeSelector } from "./ui/ThemeSelector";
import { StatusPanel } from "./ui/StatusPanel";
import { RecordingControls } from "./recording/RecordingControls";
import { ZoomGrid } from "./zoom/ZoomGrid";
import { RecordingCanvas } from "./recording/RecordingCanvas";
import { VideoPlayback } from "./recording/VideoPlayback";
import { ParticleEffect } from "./effects/ParticleEffect";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useAutoZoom } from "../hooks/useAutoZoom";
import { useParticleEffect } from "../hooks/useParticleEffect";

/**
 * The main application component that combines all UI elements
 */
export function ZoomMasterApp() {
  const { themeStyles } = useTheme();
  const { videoRef, webcamRef, hiddenVideoRef } = useRecording();
  const { cursorIcon } = useZoom();

  // Initialize feature hooks
  useSpeechRecognition();
  useAutoZoom();
  useParticleEffect();

  // Set cursor style based on cursorIcon
  useEffect(() => {
    const cursorStyles = {
      default: "default",
      hand: "pointer",
      zoom: "zoom-in",
      text: "text",
      grab: "grab",
      grabbing: "grabbing",
    }[cursorIcon];
    document.body.style.cursor = cursorStyles;
    return () => {
      document.body.style.cursor = "default";
    };
  }, [cursorIcon]);

  return (
    <div style={{
      minHeight: "100vh",
      background: themeStyles.background,
      color: themeStyles.textColor,
      padding: "20px",
      fontFamily: "'Orbitron', sans-serif",
      overflowY: "auto",
      position: "relative",
    }}>
      {/* Hidden video elements */}
      <video ref={hiddenVideoRef} style={{ display: "none" }} muted playsInline />
      <video ref={webcamRef} style={{ display: "none" }} muted playsInline />
      
      {/* UI Components */}
      <ParticleEffect />
      <Header />
      <ThemeSelector />
      <StatusPanel />
      <RecordingControls />
      <ZoomGrid />
      <RecordingCanvas />
      <VideoPlayback />

      {/* Global styles */}
      <style jsx global>{`
        @keyframes particleGlow {
          0% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.3); }
          100% { opacity: 0.6; transform: scale(1); }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
