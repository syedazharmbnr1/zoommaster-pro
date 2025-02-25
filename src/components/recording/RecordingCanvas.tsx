import React, { useEffect } from "react";
import { useRecording } from "../../context/RecordingContext";
import { useTheme } from "../../context/ThemeContext";
import { useCanvasDrawing } from "../../hooks/useCanvasDrawing";

export function RecordingCanvas() {
  const { themeStyles } = useTheme();
  const { canvasRef, isRecording } = useRecording();
  
  // Initialize canvas drawing
  useCanvasDrawing();
  
  return (
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
    </main>
  );
}
