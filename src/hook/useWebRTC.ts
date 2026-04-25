import { useEffect, useRef, useState, useCallback } from "react";
import { socketService } from "../services/socket.service";

const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export type MediaPermission = "idle" | "requesting" | "granted" | "denied" | "unavailable";

export interface UseWebRTCReturn {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  remoteTrackCount: number;
  isConnected: boolean;
  isMuted: boolean;
  isCameraOff: boolean;
  permission: MediaPermission;
  toggleMute: () => void;
  toggleCamera: () => void;
  cleanup: () => void;
}

export function useWebRTC(sessionId: string | null, isCaller: boolean): UseWebRTCReturn {
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const pendingOfferRef = useRef<RTCSessionDescriptionInit | null>(null);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [remoteTrackCount, setRemoteTrackCount] = useState(0); // trigger re-render khi có track mới
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [permission, setPermission] = useState<MediaPermission>("idle");

  const cleanup = useCallback(() => {
    console.log("[WebRTC] Cleaning up...");
    localStreamRef.current?.getTracks().forEach((t) => {
      t.stop();
      console.log(`[WebRTC] Stopped track: ${t.kind} (${t.label})`);
    });
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setRemoteTrackCount(0);
    setIsConnected(false);
    socketService.offWebRTCEvents();
    console.log("[WebRTC] Cleanup done");
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    let cancelled = false;

    const init = async () => {
      // ── 1. Check secure context ──────────────────────────
      if (!window.isSecureContext) {
        console.error(
          "[WebRTC] ❌ Not a secure context (HTTPS required).\n" +
          "  → navigator.mediaDevices is unavailable on HTTP.\n" +
          "  → Use HTTPS or access via 'localhost' instead of IP."
        );
        setPermission("unavailable");
        return;
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        console.error("[WebRTC] ❌ navigator.mediaDevices.getUserMedia not supported in this browser.");
        setPermission("unavailable");
        return;
      }

      // ── 2. Request media ─────────────────────────────────
      setPermission("requesting");
      let stream: MediaStream;

      try {
        console.log("[WebRTC] Requesting camera + mic...");
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        console.log("[WebRTC] ✓ Camera + mic granted. Tracks:", stream.getTracks().map(t => `${t.kind}:${t.label}`));
        setPermission("granted");
      } catch (err) {
        const error = err as DOMException;
        console.warn(`[WebRTC] Camera/mic failed (${error.name}): ${error.message}`);

        if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
          console.error("[WebRTC] ❌ Permission denied by user. Please allow camera/mic in browser settings.");
          setPermission("denied");
          return;
        }

        // Fallback: audio only
        console.log("[WebRTC] Trying audio only...");
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          console.log("[WebRTC] ✓ Audio only granted. Tracks:", stream.getTracks().map(t => `${t.kind}:${t.label}`));
          setPermission("granted");
        } catch (audioErr) {
          const audioError = audioErr as DOMException;
          console.error(`[WebRTC] ❌ Audio also failed (${audioError.name}): ${audioError.message}`);
          setPermission("denied");
          return;
        }
      }

      if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }

      localStreamRef.current = stream;
      setLocalStream(stream);

      // ── 3. Create PeerConnection ─────────────────────────
      console.log(`[WebRTC] Creating PeerConnection (isCaller=${isCaller})`);
      const pc = new RTCPeerConnection(ICE_SERVERS);
      pcRef.current = pc;

      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
        console.log(`[WebRTC] Added local track: ${track.kind}`);
      });

      const remote = new MediaStream();
      setRemoteStream(remote);

      pc.ontrack = (e) => {
        console.log(`[WebRTC] Received remote track: ${e.track.kind}`);
        const tracks = e.streams[0]?.getTracks() ?? [e.track];
        tracks.forEach((t) => {
          if (!remote.getTracks().find(existing => existing.id === t.id)) {
            remote.addTrack(t);
            console.log(`[WebRTC] Added remote ${t.kind} track to stream`);
          }
        });
        // Force re-render bằng counter — addtrack event không reliable trên mọi browser
        setRemoteTrackCount((c) => c + 1);
      };

      pc.onicecandidate = (e) => {
        if (e.candidate && sessionId) {
          console.log("[WebRTC] Sending ICE candidate:", e.candidate.type);
          socketService.emitIceCandidate(sessionId, e.candidate.toJSON());
        }
      };

      pc.onconnectionstatechange = () => {
        console.log(`[WebRTC] Connection state: ${pc.connectionState}`);
        setIsConnected(pc.connectionState === "connected");
      };

      pc.onicegatheringstatechange = () => {
        console.log(`[WebRTC] ICE gathering state: ${pc.iceGatheringState}`);
      };

      pc.onsignalingstatechange = () => {
        console.log(`[WebRTC] Signaling state: ${pc.signalingState}`);
      };

      // ── 4. Signaling ─────────────────────────────────────
      const handleOffer = async (offer: RTCSessionDescriptionInit) => {
        console.log("[WebRTC] Processing offer, creating answer...");
        if (!pcRef.current || pcRef.current.signalingState === "closed") return;
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        if (sessionId) {
          socketService.emitAnswer(sessionId, answer);
          console.log("[WebRTC] Answer sent");
        }
      };

      // Xử lý offer đến sớm (trước khi pc sẵn sàng)
      if (pendingOfferRef.current) {
        console.log("[WebRTC] Processing buffered offer...");
        await handleOffer(pendingOfferRef.current);
        pendingOfferRef.current = null;
      }

      socketService.onOffer(async ({ offer }) => {
        console.log("[WebRTC] Received offer");
        if (!pcRef.current) {
          console.log("[WebRTC] PC not ready, buffering offer...");
          pendingOfferRef.current = offer;
          return;
        }
        await handleOffer(offer);
      });

      socketService.onAnswer(async ({ answer }) => {
        console.log("[WebRTC] Received answer, setting remote description...");
        if (!pcRef.current || pcRef.current.signalingState === "closed") return;
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        console.log("[WebRTC] Remote description set from answer");
      });

      socketService.onIceCandidate(async ({ candidate }) => {
        console.log("[WebRTC] Received ICE candidate");
        if (!pcRef.current || pcRef.current.signalingState === "closed") return;
        try {
          await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.warn("[WebRTC] Failed to add ICE candidate:", err);
        }
      });

      // ── 5. Caller creates offer ──────────────────────────
      if (isCaller) {
        console.log("[WebRTC] Creating offer as caller...");
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketService.emitOffer(sessionId, offer);
        console.log("[WebRTC] Offer sent");
      } else {
        console.log("[WebRTC] Waiting for offer as callee...");
      }
    };

    init();
    return () => { cancelled = true; cleanup(); };
  }, [sessionId]); // isCaller không đưa vào deps — giá trị cố định từ mount, tránh re-init

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsMuted((v) => {
      console.log(`[WebRTC] Mic ${!v ? "muted" : "unmuted"}`);
      return !v;
    });
  }, []);

  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    stream.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
    setIsCameraOff((v) => {
      console.log(`[WebRTC] Camera ${!v ? "off" : "on"}`);
      return !v;
    });
  }, []);

  return { localStream, remoteStream, remoteTrackCount, isConnected, isMuted, isCameraOff, permission, toggleMute, toggleCamera, cleanup };
}
