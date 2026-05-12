import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  WebRTCManager,
  webrtcReducer,
  initialWebRTCState,
  signalingService,
} from "../services/webrtc";

export interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  remoteTrackCount: number;
  isConnected: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  permission: string;
  toggleMute: () => void;
  toggleCamera: () => void;
  cleanup: () => void;
}

export function useWebRTC(sessionId: string | null, isCaller: boolean): UseWebRTCReturn {
  const [state, dispatch] = useReducer(webrtcReducer, initialWebRTCState);
  const managerRef = useRef<WebRTCManager | null>(null);

  const dispose = useCallback((resetState: boolean) => {
    console.log("[Hook] Cleaning up...");
    managerRef.current?.cleanup();
    managerRef.current = null;
    signalingService.cleanup();
    if (resetState) {
      dispatch({ type: "RESET" });
    }
    console.log("[Hook] Cleanup done");
  }, []);

  const cleanup = useCallback(() => {
    dispose(true);
  }, [dispose]);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;
    let answerReceived = false;
    let offerRetryId: number | null = null;

    const init = async () => {
      // ── 1. Check secure context ──────────────────────────
      if (!window.isSecureContext) {
        console.error(
          "[WebRTC] ❌ Not a secure context (HTTPS required).\n" +
          "  → navigator.mediaDevices is unavailable on HTTP.\n" +
          "  → Use HTTPS or access via 'localhost' instead of IP."
        );
        dispatch({ type: "SET_PERMISSION", payload: "unavailable" });
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        console.error("[WebRTC] ❌ navigator.mediaDevices.getUserMedia not supported in this browser.");
        dispatch({ type: "SET_PERMISSION", payload: "unavailable" });
        return;
      }

      dispatch({ type: "SET_PERMISSION", payload: "requesting" });
      dispatch({ type: "SET_CONNECTION_STATE", payload: "connecting" });

      const manager = new WebRTCManager({
        onLocalStream: (stream) => {
          dispatch({ type: "SET_LOCAL_STREAM", payload: stream });
        },

        onRemoteStream: (stream) => {
          dispatch({ type: "SET_REMOTE_STREAM", payload: stream });
        },

        onRemoteTrack: () => {
          dispatch({ type: "INCREMENT_REMOTE_TRACK_COUNT" });
        },

        onConnectionStateChange: (connectionState) => {
          if (connectionState === "connected") {
            dispatch({ type: "SET_CONNECTION_STATE", payload: "connected" });
          } else if (connectionState === "disconnected") {
            dispatch({ type: "SET_CONNECTION_STATE", payload: "disconnected" });
          } else if (connectionState === "failed") {
            dispatch({ type: "SET_CONNECTION_STATE", payload: "failed" });
          } else if (connectionState === "closed") {
            dispatch({ type: "SET_CONNECTION_STATE", payload: "closed" });
          }
        },

        onIceCandidate: (candidate) => {
          signalingService.emitIceCandidate(sessionId, candidate.toJSON());
        },

        onError: (message) => {
          dispatch({ type: "SET_ERROR", payload: message });
        },
      });

      managerRef.current = manager;

      try {
        signalingService.onOffer(async ({ sessionId: payloadSessionId, offer }) => {
          if (cancelled) return;
          if (payloadSessionId && payloadSessionId !== sessionId) {
            console.log(`[Hook] Ignored offer for session ${payloadSessionId}; current session is ${sessionId}`);
            return;
          }

          console.log("[Hook] Received offer");
          const answer = await manager.handleOffer(offer);

          if (answer && !cancelled) {
            signalingService.emitAnswer(sessionId, answer);
            console.log("[Hook] Answer sent");
          }
        });

        signalingService.onAnswer(async ({ sessionId: payloadSessionId, answer }) => {
          if (cancelled) return;
          if (payloadSessionId && payloadSessionId !== sessionId) {
            console.log(`[Hook] Ignored answer for session ${payloadSessionId}; current session is ${sessionId}`);
            return;
          }

          console.log("[Hook] Received answer");
          answerReceived = true;
          if (offerRetryId !== null) {
            window.clearInterval(offerRetryId);
            offerRetryId = null;
          }
          await manager.handleAnswer(answer);
        });

        signalingService.onIceCandidate(async ({ sessionId: payloadSessionId, candidate }) => {
          if (cancelled) return;
          if (payloadSessionId && payloadSessionId !== sessionId) {
            console.log(`[Hook] Ignored ICE candidate for session ${payloadSessionId}; current session is ${sessionId}`);
            return;
          }

          console.log("[Hook] Received ICE candidate");
          await manager.addIceCandidate(candidate);
        });

        const bufferedAnswer = await manager.init();

        if (cancelled) {
          manager.cleanup();
          return;
        }

        dispatch({ type: "SET_PERMISSION", payload: "granted" });

        if (bufferedAnswer) {
          signalingService.emitAnswer(sessionId, bufferedAnswer);
          console.log("[Hook] Buffered answer sent");
        }

        // ── 2. Setup signaling listeners ──────────────────
        signalingService.onOffer(async ({ sessionId: payloadSessionId, offer }) => {
          if (cancelled) return;
          if (payloadSessionId && payloadSessionId !== sessionId) {
            console.log(`[Hook] Ignored offer for session ${payloadSessionId}; current session is ${sessionId}`);
            return;
          }

          console.log("[Hook] Received offer");
          const answer = await manager.handleOffer(offer);

          if (answer && !cancelled) {
            signalingService.emitAnswer(sessionId, answer);
            console.log("[Hook] Answer sent");
          }
        });

        signalingService.onAnswer(async ({ sessionId: payloadSessionId, answer }) => {
          if (cancelled) return;
          if (payloadSessionId && payloadSessionId !== sessionId) {
            console.log(`[Hook] Ignored answer for session ${payloadSessionId}; current session is ${sessionId}`);
            return;
          }

          console.log("[Hook] Received answer");
          answerReceived = true;
          if (offerRetryId !== null) {
            window.clearInterval(offerRetryId);
            offerRetryId = null;
          }
          await manager.handleAnswer(answer);
        });

        signalingService.onIceCandidate(async ({ sessionId: payloadSessionId, candidate }) => {
          if (cancelled) return;
          if (payloadSessionId && payloadSessionId !== sessionId) {
            console.log(`[Hook] Ignored ICE candidate for session ${payloadSessionId}; current session is ${sessionId}`);
            return;
          }

          console.log("[Hook] Received ICE candidate");
          await manager.addIceCandidate(candidate);
        });

        // ── 3. Create offer if caller ────────────────────
        if (isCaller) {
          const offer = await manager.createOffer();
          let offerRetryCount = 0;
          const emitOffer = () => {
            signalingService.emitOffer(sessionId, offer);
            console.log(`[Hook] Offer sent${offerRetryCount > 0 ? ` (retry ${offerRetryCount})` : ""}`);
          };

          emitOffer();
          offerRetryId = window.setInterval(() => {
            if (cancelled || answerReceived || offerRetryCount >= 10) {
              if (offerRetryId !== null) {
                window.clearInterval(offerRetryId);
                offerRetryId = null;
              }
              return;
            }

            offerRetryCount += 1;
            emitOffer();
          }, 1000);
        } else {
          console.log("[Hook] Waiting for offer as callee...");
        }
      } catch (err) {
        if (cancelled) return;

        const error = err as DOMException;

        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          dispatch({ type: "SET_PERMISSION", payload: "denied" });
        } else {
          dispatch({
            type: "SET_ERROR",
            payload: error.message || "Failed to initialize WebRTC",
          });
        }
      }
    };

    init();
    return () => {
      cancelled = true;
      if (offerRetryId !== null) {
        window.clearInterval(offerRetryId);
      }
      dispose(false);
    };
  }, [sessionId, isCaller, dispose]);

  const toggleMute = useCallback(() => {
    const nextMuted = !state.isMuted;
    managerRef.current?.setMuted(nextMuted);
    dispatch({ type: "SET_MUTED", payload: nextMuted });
  }, [state.isMuted]);

  const toggleCamera = useCallback(() => {
    const nextCameraOff = !state.isCameraOff;
    managerRef.current?.setCameraOff(nextCameraOff);
    dispatch({ type: "SET_CAMERA_OFF", payload: nextCameraOff });
  }, [state.isCameraOff]);

  return {
    localStream: state.localStream,
    remoteStream: state.remoteStream,
    remoteTrackCount: state.remoteTrackCount,
    isConnected: state.connectionState === "connected",
    isMuted: state.isMuted,
    isCameraOff: state.isCameraOff,
    permission: state.permission,
    toggleMute,
    toggleCamera,
    cleanup,
  };
}
