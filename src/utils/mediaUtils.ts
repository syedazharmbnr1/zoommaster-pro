/**
 * Utility functions for handling media streams and recording
 */

// Shared ref for MediaRecorder to access across component renders
export const mediaRecorderRef = { current: null as MediaRecorder | null };

/**
 * Generates a unique session ID for recording sessions
 */
export function generateSessionId(): string {
  return crypto.randomUUID();
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
  link.click();

  // Clean up URL object
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Creates a Blob from recorded chunks
 * @param recordedChunks Array of recorded Blob chunks
 * @returns A Blob containing the full recording
 */
export function createRecordingBlob(recordedChunks: Blob[]): Blob {
  return new Blob(recordedChunks, { type: "video/webm" });
}
