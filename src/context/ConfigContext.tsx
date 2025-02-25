"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { WebcamPositionType, Particle } from "../types";

interface ConfigContextType {
  // Webcam config
  isWebcamOn: boolean;
  webcamPosition: WebcamPositionType;
  isSpeechOn: boolean;
  
  // Particles (for galactic theme)
  particles: Particle[];
  
  // Setters
  setIsWebcamOn: (value: boolean) => void;
  setWebcamPosition: (position: WebcamPositionType) => void;
  setIsSpeechOn: (value: boolean) => void;
  setParticles: (particles: Particle[] | ((prev: Particle[]) => Particle[])) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  // Webcam config
  const [isWebcamOn, setIsWebcamOn] = useState(true);
  const [webcamPosition, setWebcamPosition] = useState<WebcamPositionType>("custom-right");
  const [isSpeechOn, setIsSpeechOn] = useState(true);
  
  // Particles (for galactic theme)
  const [particles, setParticles] = useState<Particle[]>([]);

  const value = {
    isWebcamOn,
    webcamPosition,
    isSpeechOn,
    particles,
    setIsWebcamOn,
    setWebcamPosition,
    setIsSpeechOn,
    setParticles,
  };

  return (
    <ConfigContext.Provider value={value}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
