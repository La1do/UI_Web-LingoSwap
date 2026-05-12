import type { MediaPermission, CallConnectionState } from "./types";

export type WebRTCAction =
  | { type: "SET_LOCAL_STREAM"; payload: MediaStream | null }
  | { type: "SET_REMOTE_STREAM"; payload: MediaStream | null }
  | { type: "INCREMENT_REMOTE_TRACK_COUNT" }
  | { type: "SET_CONNECTION_STATE"; payload: CallConnectionState }
  | { type: "SET_PERMISSION"; payload: MediaPermission }
  | { type: "SET_MUTED"; payload: boolean }
  | { type: "SET_CAMERA_OFF"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "RESET" };
