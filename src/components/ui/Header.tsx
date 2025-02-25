import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { useRecording } from "../../context/RecordingContext";
import { useRecordingControl } from "../../hooks/useRecordingControl";

export function Header() {
  const { themeStyles } = useTheme();
  const { isRecording } = useRecording();
  const { startRecording, stopRecording } = useRecordingControl();

  return (
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
  );
}
