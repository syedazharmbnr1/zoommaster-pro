import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { useRecording } from "../../context/RecordingContext";
import { useZoom } from "../../context/ZoomContext";
import { useConfig } from "../../context/ConfigContext";
import { useRecordingControl } from "../../hooks/useRecordingControl";
import { floatingButtonStyle } from "../../utils/styles";

export function RecordingControls() {
  const { themeStyles } = useTheme();
  const { isRecording, isPaused } = useRecording();
  const { zoomMode, setZoomMode } = useZoom();
  const {
    isWebcamOn,
    setIsWebcamOn,
    isSpeechOn,
    setIsSpeechOn,
    webcamPosition,
    setWebcamPosition,
  } = useConfig();
  
  const { pauseRecording, resumeRecording, takeSnapshot } = useRecordingControl();
  const { setIsHighlightOn, isHighlightOn } = useZoom();

  return (
    <div 
      style={{ 
        position: "fixed", 
        right: 20, 
        top: "50%", 
        transform: "translateY(-50%)", 
        display: "flex", 
        flexDirection: "column", 
        gap: 10, 
        zIndex: 10000 
      }}
    >
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
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>
          
          <button 
            onClick={() => setIsHighlightOn(!isHighlightOn)} 
            style={floatingButtonStyle(isHighlightOn ? "#ff3366" : themeStyles.buttonBg, themeStyles.textColor)} 
            title="Highlight"
          >
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill={isHighlightOn ? themeStyles.textColor : "none"} 
              stroke={themeStyles.textColor} 
              strokeWidth="2"
            >
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
        onChange={(e) => setWebcamPosition(e.target.value as any)}
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
  );
}
