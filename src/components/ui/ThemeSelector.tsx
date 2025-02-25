import React from "react";
import { useTheme } from "../../context/ThemeContext";
import { floatingButtonStyle } from "../../utils/styles";

export function ThemeSelector() {
  const { theme, themeStyles, setTheme } = useTheme();

  return (
    <div style={{ position: "fixed", top: 20, right: 20, display: "flex", gap: 10, zIndex: 10001 }}>
      <button 
        onClick={() => setTheme("galactic")} 
        style={floatingButtonStyle(theme === "galactic" ? "#00cc99" : themeStyles.buttonBg, themeStyles.textColor)} 
        title="Galactic Theme"
      >
        🌌
      </button>
      <button 
        onClick={() => setTheme("x")} 
        style={floatingButtonStyle(theme === "x" ? "#1DA1F2" : themeStyles.buttonBg, themeStyles.textColor)} 
        title="X Theme"
      >
        X
      </button>
      <button 
        onClick={() => setTheme("dark")} 
        style={floatingButtonStyle(theme === "dark" ? "#fff" : themeStyles.buttonBg, themeStyles.textColor)} 
        title="Dark Theme"
      >
        🌙
      </button>
      <button 
        onClick={() => setTheme("light")} 
        style={floatingButtonStyle(theme === "light" ? "#333" : themeStyles.buttonBg, themeStyles.textColor)} 
        title="Light Theme"
      >
        ☀️
      </button>
    </div>
  );
}
