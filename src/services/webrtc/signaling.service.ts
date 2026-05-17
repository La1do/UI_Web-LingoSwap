import { socketService } from "../socket.service";

/**
 * Wrapper around socket service for WebRTC signaling.
 * Tracks registered handlers so cleanup() only removes its own listeners,
 * leaving other socket listeners (chat, notifications, etc.) intact.
 */

type OfferHandler = (data: { sessionId?: string; offer: RTCSessionDescriptionInit }) => void;
type AnswerHandler = (data: { sessionId?: string; answer: RTCSessionDescriptionInit }) => void;
type IceCandidateHandler = (data: { sessionId?: string; candidate: RTCIceCandidateInit }) => void;

const registeredHandlers: {
  offer: OfferHandler[];
  answer: AnswerHandler[];
  iceCandidate: IceCandidateHandler[];
} = {
  offer: [],
  answer: [],
  iceCandidate: [],
};

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

  onOffer(handler: OfferHandler) {
    registeredHandlers.offer.push(handler);
    socketService.onOffer(handler);
  },

  onAnswer(handler: AnswerHandler) {
    registeredHandlers.answer.push(handler);
    socketService.onAnswer(handler);
  },

  onIceCandidate(handler: IceCandidateHandler) {
    registeredHandlers.iceCandidate.push(handler);
    socketService.onIceCandidate(handler);
  },

  // Chỉ off đúng các handler đã đăng ký — không ảnh hưởng listeners khác
  cleanup() {
    registeredHandlers.offer.forEach((h) => socketService.offOffer(h));
    registeredHandlers.answer.forEach((h) => socketService.offAnswer(h));
    registeredHandlers.iceCandidate.forEach((h) => socketService.offIceCandidate(h));
    registeredHandlers.offer = [];
    registeredHandlers.answer = [];
    registeredHandlers.iceCandidate = [];
  },
};
