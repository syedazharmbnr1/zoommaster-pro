// Type definitions for the application

export interface ZoomEvent {
  session_id: string;
  x: number;
  y: number;
  time_ms: number;
  timestamp: number;
  zoom_level: number;
  confidence: number;
  should_zoom: boolean;
}

export interface Caption {
  text: string;
  timestamp: number;
}

export type ThemeType = "galactic" | "x" | "dark" | "light";

export type ZoomModeType = "off" | "auto" | "grid";

export type CursorIconType = "default" | "hand" | "zoom" | "text" | "grab" | "grabbing";

export type WebcamPositionType = "custom-right" | "bottom-left" | "top-left" | "top-right";

export interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
}

export interface ThemeStyles {
  background: string;
  primaryColor: string;
  secondaryColor: string;
  buttonBg: string;
  textColor: string;
  accentColor: string;
  gridBg: string;
  collapseBg: string;
  settingsBg: string;
  selectorBg: string;
  cursorColor: string;
}
