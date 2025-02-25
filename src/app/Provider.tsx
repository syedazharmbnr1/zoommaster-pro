"use client";

import React, { ReactNode } from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { RecordingProvider } from "../context/RecordingContext";
import { ZoomProvider } from "../context/ZoomContext";
import { ConfigProvider } from "../context/ConfigContext";

interface ProvidersProps {
  children: ReactNode;
}

/**
 * Wraps the application with all necessary context providers
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <ConfigProvider>
        <RecordingProvider>
          <ZoomProvider>
            {children}
          </ZoomProvider>
        </RecordingProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
}
