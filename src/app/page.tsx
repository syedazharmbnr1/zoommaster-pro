"use client";

import React, { useEffect } from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { RecordingProvider } from "../context/RecordingContext";
import { ZoomProvider } from "../context/ZoomContext";
import { ConfigProvider } from "../context/ConfigContext";
import { Header } from "../components/ui/Header";
import { ThemeSelector } from "../components/ui/ThemeSelector";
import { StatusPanel } from "../components/ui/StatusPanel";
import { RecordingControls } from "../components/recording/RecordingControls";
import { ZoomGrid } from "../components/zoom/ZoomGrid";
import { RecordingCanvas } from "../components/recording/RecordingCanvas";
import { VideoPlayback } from "../components/recording/VideoPlayback";
import { ParticleEffect } from "../components/effects/ParticleEffect";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useAutoZoom } from "../hooks/useAutoZoom";
import { useTheme } from "../context/ThemeContext";
import { useRecording } from "../context/RecordingContext";
import { useZoom } from "../context/ZoomContext";

function AppContent() {
  const { themeStyles } = useTheme();
  const { videoRef, webcamRef, hiddenVideoRef } = useRecording();
  const { cursorIcon } = useZoom();

  // Initialize feature hooks
  useSpeechRecognition();
  useAutoZoom();

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

export default function Page() {
  return (
    <ThemeProvider>
      <ConfigProvider>
        <RecordingProvider>
          <ZoomProvider>
            <AppContent />
          </ZoomProvider>
        </RecordingProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
}
