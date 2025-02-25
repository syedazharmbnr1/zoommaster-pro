"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { ThemeType, ThemeStyles } from "../types";
import { getThemeStyles } from "../utils/styles";

interface ThemeContextType {
  theme: ThemeType;
  themeStyles: ThemeStyles;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeType>("x");
  const themeStyles = getThemeStyles(theme);

  return (
    <ThemeContext.Provider value={{ theme, themeStyles, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
