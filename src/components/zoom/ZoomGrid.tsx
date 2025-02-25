import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { useZoom } from "../../context/ZoomContext";
import { useRecording } from "../../context/RecordingContext";
import { floatingButtonStyle } from "../../utils/styles";

export function ZoomGrid() {
  const { themeStyles } = useTheme();
  const {
    gridSizeX,
    gridSizeY,
    gridWidth,
    gridHeight,
    dotSpacingX,
    dotSpacingY,
    hoveredDot,
    setHoveredDot,
    isGridExpanded,
    setIsGridExpanded,
    setIsGridHovered,
    zoomMode,
    setZoomScale,
    setZoomCenter,
    showSettings,
    setShowSettings,
    hoverScaleFactor,
    dotSize,
    gridOpacity,
    setGridOpacity,
    zoomScale,
    isGridHovered,
  } = useZoom();
  
  const {
    isRecording,
    isPaused,
    recordStartTime,
    pauseTime,
    sessionId,
    setSmartZoomData,
    capturedWidth,
    capturedHeight,
  } = useRecording();

  function handleGridMouseMove(e: React.MouseEvent<HTMLDivElement>) {
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
        const newEvent = {
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
  }

  function handleGridMouseLeave() {
    if (zoomMode === "grid") {
      setHoveredDot(null);
      applyZoomReset();
    }
  }

  function applyZoom(gridX: number, gridY: number, scale: number) {
    if (!capturedWidth || !capturedHeight) return;
    const fracX = gridX / (gridSizeX - 1);
    const fracY = gridY / (gridSizeY - 1);
    setZoomCenter({ x: fracX, y: fracY });
    setZoomScale(scale);
  }

  function applyZoomReset() {
    if (zoomMode === "off" || zoomMode === "auto") {
      setZoomScale(1);
      setZoomCenter({ x: 0.5, y: 0.5 });
    } else if (zoomMode === "grid") {
      setZoomCenter({ x: 0.5, y: 0.5 });
      setZoomScale(isGridHovered ? 1.5 : 1);
    }
  }

  function gridDotStyle(x: number, y: number): React.CSSProperties {
    const isHovered = hoveredDot?.x === x && hoveredDot?.y === y;
    const scale = isHovered ? hoverScaleFactor : 1;
    const baseColor = themeStyles.primaryColor === "#333" ? "#333" : "#fff";
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
  }

  function gridLineStyle(x1: number, y1: number, x2: number, y2: number): React.CSSProperties {
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
      background: themeStyles.primaryColor === "#333" ? "rgba(51,51,51,0.3)" : "rgba(255,255,255,0.3)",
      transformOrigin: "0 50%",
      transform: `rotate(${angle}deg)`,
      pointerEvents: "none",
    };
  }

  return (
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
            {Array.from({ length: gridSizeX }).map((_, x) =>
              Array.from({ length: gridSizeY }).map((_, y) => {
                const segments: React.ReactNode[] = [];
                if (x < gridSizeX - 1) segments.push(<div key={`h-${x}-${y}`} style={gridLineStyle(x, y, x + 1, y)} />);
                if (y < gridSizeY - 1) segments.push(<div key={`v-${x}-${y}`} style={gridLineStyle(x, y, x, y + 1)} />);
                return segments;
              })
            )}
            {Array.from({ length: gridSizeX }, (_, x) => Array.from({ length: gridSizeY }, (_, y) => (
              <div key={`dot-${x}-${y}`} style={gridDotStyle(x, y)} />
            )))}
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
              style={{ width: "100%", accentColor: themeStyles.accentColor }} 
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
              style={{ width: "100%", accentColor: themeStyles.accentColor }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
