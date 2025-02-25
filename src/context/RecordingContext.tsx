"use client";

import React, { createContext, useContext, useState, useRef, ReactNode } from "react";
import { ZoomEvent, Caption } from "../types";
import { mediaRecorderRef, generateSessionId } from "../utils/mediaUtils";

type SetStateAction<T> = T | ((prevState: T) => T);

interface RecordingContextType {
  // Recording state
  isRecording: boolean;
  isPaused: boolean;
  recordedChunks: Blob[];
  videoURL: string | null;
  downloadURL: string | null;
  sessionId: string;
  recordStartTime: number | null;
  pauseTime: number;
  captions: Caption[];
  isRecognitionRunning: boolean;
  recognition: SpeechRecognition | null;
  smartZoomData: ZoomEvent[];
  retrievedData: ZoomEvent[];
  overlayDot: { x: number; y: number } | null;
  
  // Video refs
  hiddenVideoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  webcamRef: React.RefObject<HTMLVideoElement>;
  
  // Capture dimensions
  capturedWidth: number | null;
  capturedHeight: number | null;
  webcamStream: MediaStream | null;
  
  // Actions
  setIsRecording: (value: boolean) => void;
  setIsPaused: (value: boolean) => void;
  setRecordedChunks: (chunks: SetStateAction<Blob[]>) => void;
  setVideoURL: (url: string | null) => void;
  setDownloadURL: (url: string | null) => void;
  setSessionId: (id: string) => void;
  setRecordStartTime: (time: number | null) => void;
  setPauseTime: (time: number | SetStateAction<number>) => void;
  setCaptions: (captions: SetStateAction<Caption[]>) => void;
  setIsRecognitionRunning: (value: boolean) => void;
  setRecognition: (recognition: SpeechRecognition | null) => void;
  setSmartZoomData: (data: SetStateAction<ZoomEvent[]>) => void;
  setRetrievedData: (data: ZoomEvent[]) => void;
  setCapturedWidth: (width: number | null) => void;
  setCapturedHeight: (height: number | null) => void;
  setWebcamStream: (stream: MediaStream | null) => void;
  setOverlayDot: (dot: { x: number; y: number } | null) => void;
}

const RecordingContext = createContext<RecordingContextType | undefined>(undefined);

export function RecordingProvider({ children }: { children: ReactNode }) {
  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [downloadURL, setDownloadURL] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [recordStartTime, setRecordStartTime] = useState<number | null>(null);
  const [pauseTime, setPauseTime] = useState<number>(0);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isRecognitionRunning, setIsRecognitionRunning] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [smartZoomData, setSmartZoomData] = useState<ZoomEvent[]>([]);
  const [retrievedData, setRetrievedData] = useState<ZoomEvent[]>([]);
  const [overlayDot, setOverlayDot] = useState<{ x: number; y: number } | null>(null);

  // Capture dimensions
  const [capturedWidth, setCapturedWidth] = useState<number | null>(null);
  const [capturedHeight, setCapturedHeight] = useState<number | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);

  // Video refs
  const hiddenVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const webcamRef = useRef<HTMLVideoElement>(null);

  const value = {
    isRecording,
    isPaused,
    recordedChunks,
    videoURL,
    downloadURL,
    sessionId,
    recordStartTime,
    pauseTime,
    captions,
    isRecognitionRunning,
    recognition,
    smartZoomData,
    retrievedData,
    overlayDot,
    hiddenVideoRef,
    canvasRef,
    videoRef,
    webcamRef,
    capturedWidth,
    capturedHeight,
    webcamStream,
    setIsRecording,
    setIsPaused,
    setRecordedChunks,
    setVideoURL,
    setDownloadURL,
    setSessionId,
    setRecordStartTime,
    setPauseTime,
    setCaptions,
    setIsRecognitionRunning,
    setRecognition,
    setSmartZoomData,
    setRetrievedData,
    setCapturedWidth,
    setCapturedHeight,
    setWebcamStream,
    setOverlayDot,
  };

  return (
    <RecordingContext.Provider value={value}>
      {children}
    </RecordingContext.Provider>
  );
}

export function useRecording() {
  const context = useContext(RecordingContext);
  if (context === undefined) {
    throw new Error("useRecording must be used within a RecordingProvider");
  }
  return context;
}
