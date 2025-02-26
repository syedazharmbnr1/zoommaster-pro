/**
 * Utility functions for handling media streams and recording
 */

// Shared ref for MediaRecorder to access across component renders
export const mediaRecorderRef = { current: null as MediaRecorder | null };

/**
 * Generates a unique session ID for recording sessions
 */
export function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for browsers without crypto.randomUUID
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Creates a download link from a blob
 * @param blob The blob containing media data
 * @param filename The download filename
 */
export function createDownloadLink(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link); // This is important in some browsers
  link.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Creates a Blob from recorded chunks
 * @param recordedChunks Array of recorded Blob chunks
 * @returns A Blob containing the full recording
 */
export function createRecordingBlob(recordedChunks: Blob[]): Blob {
  // Make sure we have valid chunks
  if (!recordedChunks || recordedChunks.length === 0) {
    console.error('No recorded chunks available to create blob');
    return new Blob([], { type: "video/webm" });
  }
  
  // Log chunk info for debugging
  console.log(`Creating blob from ${recordedChunks.length} chunks`);
  recordedChunks.forEach((chunk, index) => {
    console.log(`Chunk ${index}: ${chunk.size} bytes, type: ${chunk.type}`);
  });
  
  return new Blob(recordedChunks, { type: "video/webm" });
}

/**
 * Safely stops all tracks in a MediaStream
 * @param stream The MediaStream to stop
 */
export function stopMediaStream(stream: MediaStream | null): void {
  if (!stream) return;
  
  try {
    stream.getTracks().forEach(track => {
      track.stop();
    });
  } catch (err) {
    console.error('Error stopping media stream:', err);
  }
}
