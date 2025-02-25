import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { useRecording } from "../../context/RecordingContext";
import { useZoom } from "../../context/ZoomContext";
import { useConfig } from "../../context/ConfigContext";

export function StatusPanel() {
  const { themeStyles } = useTheme();
  const { isRecording, isPaused, recordStartTime, pauseTime } = useRecording();
  const { zoomScale, zoomMode, cursorIcon } = useZoom();
  const { isWebcamOn, isSpeechOn } = useConfig();

  if (!isRecording) return null;

  return (
    <div 
      style={{ 
        position: "fixed", 
        top: 20, 
        left: 20, 
        padding: "20px", 
        background: themeStyles.gridBg, 
        borderRadius: 20, 
        boxShadow: `0 0 50px ${themeStyles.accentColor}99`, 
        zIndex: 10001, 
        color: themeStyles.textColor 
      }}
    >
      <div style={{ color: themeStyles.primaryColor }}>Zoom: {zoomScale.toFixed(1)}x</div>
      <div style={{ color: themeStyles.primaryColor }}>
        Time: {recordStartTime && !isPaused ? ((performance.now() - recordStartTime - pauseTime) / 1000).toFixed(1) : "0.0"}s
      </div>
      <div style={{ color: themeStyles.primaryColor }}>Status: {isPaused ? "Paused" : "Recording"}</div>
      <div style={{ color: themeStyles.primaryColor }}>Zoom Mode: {zoomMode}</div>
      <div style={{ color: themeStyles.primaryColor }}>Webcam: {isWebcamOn ? "On" : "Off"}</div>
      <div style={{ color: themeStyles.primaryColor }}>Speech: {isSpeechOn ? "On" : "Off"}</div>
      <div style={{ color: themeStyles.primaryColor }}>Cursor: {cursorIcon}</div>
    </div>
  );
}
