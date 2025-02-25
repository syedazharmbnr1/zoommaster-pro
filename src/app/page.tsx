"use client";

import React from "react";
import { ThemeProvider } from "../context/ThemeContext";
import { RecordingProvider } from "../context/RecordingContext";
import { ZoomProvider } from "../context/ZoomContext";
import { ConfigProvider } from "../context/ConfigContext";
import { ZoomMasterApp } from "../components/ZoomMasterApp";

/**
 * Main page component that wraps the application with necessary providers
 */
export default function Page() {
  return (
    <ThemeProvider>
      <ConfigProvider>
        <RecordingProvider>
          <ZoomProvider>
            <ZoomMasterApp />
          </ZoomProvider>
        </RecordingProvider>
      </ConfigProvider>
    </ThemeProvider>
  );
}
