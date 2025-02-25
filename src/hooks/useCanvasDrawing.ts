import { useEffect } from "react";
import { useZoom } from "../context/ZoomContext";
import { useRecording } from "../context/RecordingContext";
import { useTheme } from "../context/ThemeContext";
import { useConfig } from "../context/ConfigContext";

/**
 * Hook for drawing to canvas with zoom, webcam overlay, and captions
 */
export function useCanvasDrawing() {
  const { 
    zoomScale, 
    zoomCenter, 
    isHighlightOn, 
    animationFrameRef,
    zoomMode 
  } = useZoom();
  
  const {
    isRecording,
    isPaused,
    captions,
    hiddenVideoRef,
    canvasRef,
    webcamRef,
    webcamStream
  } = useRecording();
  
  const { theme, themeStyles } = useTheme();
  const { isWebcamOn, webcamPosition, isSpeechOn } = useConfig();

  useEffect(() => {
    if (!isRecording || !hiddenVideoRef.current || !canvasRef.current || !webcamRef.current) return;

    const video = hiddenVideoRef.current;
    const webcam = webcamRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
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

      if (webcam && webcamStream && isWebcamOn) {
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

      // Captions at Center Bottom (4 Words Max, Fading Out)
      if (captions.length && isSpeechOn) {
        ctx.font = "36px Orbitron"; // Larger font for captions
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.shadowColor = theme === "light" ? "#ccc" : "#000";
        ctx.shadowBlur = 10;

        const caption = captions[0];
        const age = Date.now() - caption.timestamp;
        const opacity = Math.max(0, 1 - age / 3000); // Fade out over 3 seconds
        if (opacity > 0) {
          const y = canvas.height - 50; // Position at center bottom (50px from bottom)
          const textWidth = ctx.measureText(caption.text).width;

          // Highlighter (theme-compatible, fading out)
          ctx.fillStyle = `${themeStyles.accentColor}${Math.round(opacity * 64).toString(16)}`;
          ctx.fillRect(canvas.width / 2 - textWidth / 2 - 15, y - 40, textWidth + 30, 50);

          // Theme-compatible text color
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
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isRecording, zoomScale, zoomCenter, isHighlightOn, captions, isPaused, webcamStream, theme, isWebcamOn, webcamPosition, isSpeechOn, zoomMode]);
}
