/**
 * Media stream utilities for WebRTC
 */

export async function getLocalMedia(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
  } catch (err) {
    const error = err as DOMException;
    console.warn(`[WebRTC] Camera/mic failed (${error.name}): ${error.message}`);

    if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
      console.error("[WebRTC] ❌ Permission denied by user. Please allow camera/mic in browser settings.");
      throw error;
    }

    // Fallback: audio only
    console.log("[WebRTC] Trying audio only...");
    try {
      return await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
    } catch (audioErr) {
      const audioError = audioErr as DOMException;
      console.error(`[WebRTC] ❌ Audio also failed (${audioError.name}): ${audioError.message}`);
      throw audioError;
    }
  }
}

export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => {
    track.stop();
    console.log(`[WebRTC] Stopped track: ${track.kind} (${track.label})`);
  });
}

export function setAudioEnabled(stream: MediaStream | null, enabled: boolean): void {
  stream?.getAudioTracks().forEach((track) => {
    track.enabled = enabled;
  });
  if (stream) {
    console.log(`[WebRTC] Audio ${enabled ? "enabled" : "disabled"}`);
  }
}

export function setVideoEnabled(stream: MediaStream | null, enabled: boolean): void {
  stream?.getVideoTracks().forEach((track) => {
    track.enabled = enabled;
  });
  if (stream) {
    console.log(`[WebRTC] Video ${enabled ? "enabled" : "disabled"}`);
  }
}
