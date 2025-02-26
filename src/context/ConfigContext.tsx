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
  // Check if webcam is likely available (we'll confirm this when actually trying to use it)
  const hasWebcam = typeof navigator !== 'undefined' && 
                  navigator.mediaDevices && 
                  typeof navigator.mediaDevices.enumerateDevices === 'function';
  
  // Check if speech recognition is available
  const hasSpeechRecognition = typeof window !== 'undefined' && 
                              ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  // Webcam config - default to off if no webcam is detected
  const [isWebcamOn, setIsWebcamOn] = useState(hasWebcam);
  const [webcamPosition, setWebcamPosition] = useState<WebcamPositionType>("custom-right");
  const [isSpeechOn, setIsSpeechOn] = useState(hasSpeechRecognition);
  
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
