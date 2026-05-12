export type MediaPermission = "idle" | "requesting" | "granted" | "denied" | "unavailable";

export type CallConnectionState =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed"
  | "closed";

export interface WebRTCState {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  remoteTrackCount: number;

  connectionState: CallConnectionState;
  permission: MediaPermission;

  isMuted: boolean;
  isCameraOff: boolean;

  error: string | null;
}
