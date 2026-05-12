import type { WebRTCAction } from "./actions";
import type { WebRTCState } from "./types";

export const initialWebRTCState: WebRTCState = {
  localStream: null,
  remoteStream: null,
  remoteTrackCount: 0,

  connectionState: "idle",
  permission: "idle",

  isMuted: false,
  isCameraOff: false,

  error: null,
};

export function webrtcReducer(
  state: WebRTCState,
  action: WebRTCAction
): WebRTCState {
  switch (action.type) {
    case "SET_LOCAL_STREAM":
      return { ...state, localStream: action.payload };

    case "SET_REMOTE_STREAM":
      return { ...state, remoteStream: action.payload };

    case "INCREMENT_REMOTE_TRACK_COUNT":
      return {
        ...state,
        remoteTrackCount: state.remoteTrackCount + 1,
      };

    case "SET_CONNECTION_STATE":
      return { ...state, connectionState: action.payload };

    case "SET_PERMISSION":
      return { ...state, permission: action.payload };

    case "SET_MUTED":
      return { ...state, isMuted: action.payload };

    case "SET_CAMERA_OFF":
      return { ...state, isCameraOff: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "RESET":
      return initialWebRTCState;

    default:
      return state;
  }
}
