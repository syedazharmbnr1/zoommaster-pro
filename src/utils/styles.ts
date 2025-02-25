import { CSSProperties } from "react";
import { ThemeType, ThemeStyles } from "../types";

/**
 * Returns theme-specific styles based on the selected theme
 */
export const getThemeStyles = (theme: ThemeType): ThemeStyles => {
  switch (theme) {
    case "galactic":
      return {
        background: "radial-gradient(circle at center, #0a0e1a 0%, #1a2338 100%)",
        primaryColor: "#00ffff",
        secondaryColor: "rgba(0,255,255,0.35)",
        buttonBg: "#00cc99",
        textColor: "#e2e8f0",
        accentColor: "#00ffff",
        gridBg: "#000",
        collapseBg: "#1a2338",
        settingsBg: "#00cccc",
        selectorBg: "#3399ff",
        cursorColor: "#00ffff",
      };
    case "x":
      return {
        background: "#000",
        primaryColor: "#1DA1F2",
        secondaryColor: "rgba(29,161,242,0.35)",
        buttonBg: "#1DA1F2",
        textColor: "#fff",
        accentColor: "#1DA1F2",
        gridBg: "#192734",
        collapseBg: "#15202B",
        settingsBg: "#1DA1F2",
        selectorBg: "#1DA1F2",
        cursorColor: "#1DA1F2",
      };
    case "dark":
      return {
        background: "#1e1e1e",
        primaryColor: "#fff",
        secondaryColor: "rgba(255,255,255,0.35)",
        buttonBg: "#555",
        textColor: "#fff",
        accentColor: "#fff",
        gridBg: "#000",
        collapseBg: "#1e1e1e",
        settingsBg: "#666",
        selectorBg: "#777",
        cursorColor: "#fff",
      };
    case "light":
      return {
        background: "#f5f5f5",
        primaryColor: "#333",
        secondaryColor: "rgba(51,51,51,0.35)",
        buttonBg: "#888",
        textColor: "#333",
        accentColor: "#333",
        gridBg: "#fff",
        collapseBg: "#e0e0e0",
        settingsBg: "#555",
        selectorBg: "#666",
        cursorColor: "#333",
      };
    default:
      return {
        background: "#000",
        primaryColor: "#1DA1F2",
        secondaryColor: "rgba(29,161,242,0.35)",
        buttonBg: "#1DA1F2",
        textColor: "#fff",
        accentColor: "#1DA1F2",
        gridBg: "#192734",
        collapseBg: "#15202B",
        settingsBg: "#1DA1F2",
        selectorBg: "#1DA1F2",
        cursorColor: "#1DA1F2",
      };
  }
};

/**
 * Standard button style generator
 */
export function buttonStyle(bgColor: string, textColor: string): CSSProperties {
  return {
    padding: "12px 24px",
    borderRadius: 8,
    background: bgColor,
    color: textColor,
    border: "none",
    cursor: "pointer",
    fontSize: "1.2rem",
    fontWeight: 600,
    boxShadow: `0 0 10px ${bgColor}40`,
    transition: "all 0.3s ease",
  };
}

/**
 * Floating circular button style generator
 */
export function floatingButtonStyle(bgColor: string, textColor: string): CSSProperties {
  return {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: bgColor,
    color: textColor,
    border: "none",
    cursor: "pointer",
    fontSize: "1rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: `0 0 20px ${bgColor}40`,
    transition: "all 0.3s ease",
  };
}
