import { useEffect } from "react";
import { useZoom } from "../context/ZoomContext";
import { useRecording } from "../context/RecordingContext";

/**
 * Hook for handling auto-zoom functionality based on mouse movement
 */
export function useAutoZoom() {
  const {
    zoomMode,
    zoomScale,
    setZoomCenter,
    setZoomScale,
    setCursorIcon,
    gridSizeX,
    gridSizeY,
  } = useZoom();
  
  const {
    isRecording,
    isPaused,
    recordStartTime,
    pauseTime,
    sessionId,
    hiddenVideoRef,
    setSmartZoomData,
  } = useRecording();

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isRecording || zoomMode !== "auto" || !hiddenVideoRef.current) return;

      const vidW = hiddenVideoRef.current.videoWidth || 1280;
      const vidH = hiddenVideoRef.current.videoHeight || 720;
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
      let newCursorIcon: "default" | "hand" | "zoom" | "text" | "grab" | "grabbing" = "default";

      const selection = document.getSelection();
      const activeElement = document.activeElement;

      // Fixed the TypeScript error by adding robust null checks
      if (selection && typeof selection.toString === 'function' && selection.toString().length > 0) {
        newCursorIcon = "hand";
        // Make sure selection has at least one range before accessing it
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            fracX = Math.max(0, Math.min(1, (rect.left + rect.width / 2) / window.screen.width));
            fracY = Math.max(0, Math.min(1, (rect.top + rect.height / 2) / window.screen.height));
            targetZoomScale = 3.0;
            confidence = 0.95;
          }
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
        const newEvent = {
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

    if (isRecording && zoomMode === "auto") {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mousedown", handleMouseMove);
      window.addEventListener("mouseup", handleMouseMove);
      window.addEventListener("selectstart", handleMouseMove);
      window.addEventListener("focus", handleMouseMove, true);
    }
    
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseMove);
      window.removeEventListener("selectstart", handleMouseMove);
      window.removeEventListener("focus", handleMouseMove, true);
    };
  }, [isRecording, zoomMode, zoomScale, recordStartTime, pauseTime, sessionId, isPaused, gridSizeX, gridSizeY, hiddenVideoRef, setCursorIcon, setSmartZoomData, setZoomCenter, setZoomScale]);
}
