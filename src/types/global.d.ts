// Global type definitions for browser APIs

interface Window {
  webkitSpeechRecognition: any;
}

interface MediaRecorderOptions {
  mimeType?: string;
  audioBitsPerSecond?: number;
  videoBitsPerSecond?: number;
  bitsPerSecond?: number;
}
