import { socketService } from "../socket.service";

/**
 * Wrapper around socket service for WebRTC signaling
 */

export const signalingService = {
  emitOffer(sessionId: string, offer: RTCSessionDescriptionInit) {
    socketService.emitOffer(sessionId, offer);
  },

  emitAnswer(sessionId: string, answer: RTCSessionDescriptionInit) {
    socketService.emitAnswer(sessionId, answer);
  },

  emitIceCandidate(sessionId: string, candidate: RTCIceCandidateInit) {
    socketService.emitIceCandidate(sessionId, candidate);
  },

  onOffer(handler: (data: { sessionId?: string; offer: RTCSessionDescriptionInit }) => void) {
    socketService.onOffer(handler);
  },

  onAnswer(handler: (data: { sessionId?: string; answer: RTCSessionDescriptionInit }) => void) {
    socketService.onAnswer(handler);
  },

  onIceCandidate(handler: (data: { sessionId?: string; candidate: RTCIceCandidateInit }) => void) {
    socketService.onIceCandidate(handler);
  },

  cleanup() {
    socketService.offWebRTCEvents();
  },
};
