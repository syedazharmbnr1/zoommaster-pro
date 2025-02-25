"use client";

import React, { createContext, useContext, useState, useRef, ReactNode } from "react";
import { ZoomModeType, CursorIconType } from "../types";

interface ZoomContextType {
  // Zoom state
  zoomScale: number;
  zoomCenter: { x: number; y: number };
  zoomMode: ZoomModeType;
  isHighlightOn: boolean;
  cursorIcon: CursorIconType;
  animationFrameRef: React.MutableRefObject<number | undefined>;
  
  // Grid state
  gridOpacity: number;
  hoveredDot: { x: number; y: number } | null;
  isGridHovered: boolean;
  isGridExpanded: boolean;
  showSettings: boolean;
  
  // Configuration
  gridSizeX: number;
  gridSizeY: number;
  gridWidth: number;
  gridHeight: number;
  dotSize: number;
  hoverScaleFactor: number;
  dotSpacingX: number;
  dotSpacingY: number;
  
  // Setters
  setZoomScale: (scale: number | ((prev: number) => number)) => void;
  setZoomCenter: (center: { x: number; y: number } | ((prev: { x: number; y: number }) => { x: number; y: number })) => void;
  setZoomMode: (mode: ZoomModeType) => void;
  setIsHighlightOn: (value: boolean) => void;
  setCursorIcon: (icon: CursorIconType) => void;
  setGridOpacity: (opacity: number) => void;
  setHoveredDot: (dot: { x: number; y: number } | null) => void;
  setIsGridHovered: (value: boolean) => void;
  setIsGridExpanded: (value: boolean) => void;
  setShowSettings: (value: boolean) => void;
}

const ZoomContext = createContext<ZoomContextType | undefined>(undefined);

export function ZoomProvider({ children }: { children: ReactNode }) {
  // Zoom state
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomCenter, setZoomCenter] = useState({ x: 0.5, y: 0.5 });
  const [zoomMode, setZoomMode] = useState<ZoomModeType>("grid");
  const [isHighlightOn, setIsHighlightOn] = useState(false);
  const [cursorIcon, setCursorIcon] = useState<CursorIconType>("default");
  const animationFrameRef = useRef<number | undefined>(undefined);
  
  // Grid state
  const [gridOpacity, setGridOpacity] = useState(0.9);
  const [hoveredDot, setHoveredDot] = useState<{ x: number; y: number } | null>(null);
  const [isGridHovered, setIsGridHovered] = useState(false);
  const [isGridExpanded, setIsGridExpanded] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  // Configuration (constants)
  const gridSizeX = 16;
  const gridSizeY = 16;
  const gridWidth = 320;
  const gridHeight = 320;
  const dotSize = 8;
  const hoverScaleFactor = 2.5;
  const dotSpacingX = gridWidth / (gridSizeX - 1);
  const dotSpacingY = gridHeight / (gridSizeY - 1);

  const value = {
    zoomScale,
    zoomCenter,
    zoomMode,
    isHighlightOn,
    cursorIcon,
    animationFrameRef,
    gridOpacity,
    hoveredDot,
    isGridHovered,
    isGridExpanded,
    showSettings,
    gridSizeX,
    gridSizeY,
    gridWidth,
    gridHeight,
    dotSize,
    hoverScaleFactor,
    dotSpacingX,
    dotSpacingY,
    setZoomScale,
    setZoomCenter,
    setZoomMode,
    setIsHighlightOn,
    setCursorIcon,
    setGridOpacity,
    setHoveredDot,
    setIsGridHovered,
    setIsGridExpanded,
    setShowSettings,
  };

  return (
    <ZoomContext.Provider value={value}>
      {children}
    </ZoomContext.Provider>
  );
}

export function useZoom() {
  const context = useContext(ZoomContext);
  if (context === undefined) {
    throw new Error("useZoom must be used within a ZoomProvider");
  }
  return context;
}
