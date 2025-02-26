import React, { useEffect, useState } from "react";
import { useRecording } from "../../context/RecordingContext";
import { useTheme } from "../../context/ThemeContext";
import { useZoom } from "../../context/ZoomContext";
import { buttonStyle } from "../../utils/styles";

export function VideoPlayback() {
  const { 
    videoURL, 
    downloadURL, 
    videoRef, 
    sessionId, 
    retrievedData, 
    overlayDot, 
    setOverlayDot,
    recordedChunks
  } = useRecording();
  
  const { themeStyles } = useTheme();
  const { gridSizeX, dotSize } = useZoom();
  const [videoError, setVideoError] = useState("");
  const [videoInfo, setVideoInfo] = useState("");

  // Log any video errors
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.onerror = (e) => {
        console.error("Video error:", e);
        setVideoError(`Error: ${videoRef.current?.error?.message || 'Unknown video error'}`);
      };
      
      videoRef.current.onloadedmetadata = () => {
        if (videoRef.current) {
          setVideoInfo(`Video loaded: ${videoRef.current.videoWidth}x${videoRef.current.videoHeight}`);
        }
      };
    }
    
    return () => {
      if (videoRef.current) {
        videoRef.current.onerror = null;
        videoRef.current.onloadedmetadata = null;
      }
    };
  }, [videoRef]);

  function handleTimeUpdate() {
    if (!videoRef.current) return;
    const currentTimeMs = videoRef.current.currentTime * 1000;
    const relevantEvent = [...retrievedData].reverse().find((ev) => ev.time_ms <= currentTimeMs);
    setOverlayDot(relevantEvent ? { x: relevantEvent.x, y: relevantEvent.y } : null);
  }

  function overlayDotStyle(): React.CSSProperties {
    if (!overlayDot) return { display: "none" };
    const containerWidth = 800;
    const containerHeight = 600;
    const scale = 2.5;
    const px = (overlayDot.x / (gridSizeX - 1)) * containerWidth;
    const py = (overlayDot.y / (gridSizeX - 1)) * containerHeight;
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
  }

  // Handle download manually
  const handleDownload = () => {
    if (!downloadURL) return;
    
    try {
      const link = document.createElement("a");
      link.href = downloadURL;
      link.download = `recording-${sessionId || Date.now()}.webm`;
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    } catch (err) {
      console.error("Download error:", err);
      setVideoError(`Download error: ${err}`);
    }
  };

  if (!videoURL) return null;

  return (
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
        style={{ width: "100%", height: 440, background: themeStyles.gridBg }} 
      />
      
      {videoError && (
        <div style={{ 
          color: '#ff3366', 
          textAlign: 'center', 
          marginTop: 10, 
          padding: '5px 10px', 
          backgroundColor: 'rgba(255,51,102,0.1)',
          borderRadius: 8
        }}>
          {videoError}
        </div>
      )}
      
      {videoInfo && (
        <div style={{ 
          color: themeStyles.textColor, 
          textAlign: 'center', 
          fontSize: '0.8rem',
          marginTop: 5
        }}>
          {videoInfo} • {recordedChunks.length} chunks
        </div>
      )}
      
      <div 
        style={{ position: "absolute", top: 60, left: 0, width: "100%", height: 540, pointerEvents: "none" }}
      >
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
          onClick={() => videoRef.current?.play().catch(e => console.error("Play error:", e))} 
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
          <button 
            onClick={handleDownload} 
            style={{ 
              ...buttonStyle(themeStyles.accentColor, themeStyles.textColor), 
              boxShadow: `0 0 35px ${themeStyles.accentColor}80`, 
              transition: "all 0.3s ease",
              textDecoration: "none", 
              lineHeight: "1.2rem" 
            }} 
            onMouseEnter={(e) => (e.currentTarget.style.boxShadow = `0 0 45px ${themeStyles.accentColor}`)} 
            onMouseLeave={(e) => (e.currentTarget.style.boxShadow = `0 0 35px ${themeStyles.accentColor}80`)}
          >
            Download
          </button>
        )}
      </div>
    </div>
  );
}
