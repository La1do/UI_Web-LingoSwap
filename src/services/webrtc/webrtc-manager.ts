import { createPeerConnection } from "./peer-connection";
import { getLocalMedia, stopStream, setAudioEnabled, setVideoEnabled } from "./media";
import { safeAddIceCandidate } from "./ice";

interface WebRTCManagerEvents {
  onLocalStream: (stream: MediaStream | null) => void;
  onRemoteStream: (stream: MediaStream | null) => void;
  onRemoteTrack: () => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
  onIceCandidate: (candidate: RTCIceCandidate) => void;
  onError: (message: string) => void;
}

export class WebRTCManager {
  private pc: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private pendingOffer: RTCSessionDescriptionInit | null = null;
  private pendingIceCandidates: RTCIceCandidateInit[] = [];
  private events: WebRTCManagerEvents;

  constructor(events: WebRTCManagerEvents) {
    this.events = events;
  }

  async init(): Promise<RTCSessionDescriptionInit | null> {
    console.log("[WebRTC] Initializing WebRTCManager...");

    this.localStream = await getLocalMedia();
    this.events.onLocalStream(this.localStream);

    this.remoteStream = new MediaStream();
    this.events.onRemoteStream(this.remoteStream);

    this.pc = createPeerConnection({
      onIceCandidate: this.events.onIceCandidate,

      onTrack: (track, streams) => {
        console.log(`[WebRTC] Received remote track: ${track.kind}`);
        const incomingTracks = streams[0]?.getTracks() ?? [track];

        incomingTracks.forEach((incomingTrack) => {
          const exists = this.remoteStream
            ?.getTracks()
            .some((t) => t.id === incomingTrack.id);

          if (!exists) {
            this.remoteStream?.addTrack(incomingTrack);
            console.log(`[WebRTC] Added remote ${incomingTrack.kind} track to stream`);
          }
        });

        this.events.onRemoteTrack();
      },

      onConnectionStateChange: this.events.onConnectionStateChange,
    });

    this.localStream.getTracks().forEach((track) => {
      this.pc?.addTrack(track, this.localStream!);
      console.log(`[WebRTC] Added local track: ${track.kind}`);
    });

    let pendingAnswer: RTCSessionDescriptionInit | null = null;

    if (this.pendingOffer) {
      console.log("[WebRTC] Processing buffered offer...");
      pendingAnswer = await this.handleOffer(this.pendingOffer);
      this.pendingOffer = null;
    }

    console.log("[WebRTC] WebRTCManager initialized");
    return pendingAnswer;
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.pc) {
      throw new Error("PeerConnection is not initialized");
    }

    console.log("[WebRTC] Creating offer as caller...");
    const offer = await this.pc.createOffer();
    await this.pc.setLocalDescription(offer);
    console.log("[WebRTC] Offer created and set as local description");
    return offer;
  }

  async handleOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | null> {
    if (!this.pc) {
      console.log("[WebRTC] PC not ready, buffering offer...");
      this.pendingOffer = offer;
      return null;
    }

    if (this.pc.signalingState === "closed") {
      console.warn("[WebRTC] Cannot handle offer - signaling state is closed");
      return null;
    }

    console.log("[WebRTC] Processing offer, creating answer...");
    await this.pc.setRemoteDescription(new RTCSessionDescription(offer));
    await this.flushPendingIceCandidates();

    const answer = await this.pc.createAnswer();
    await this.pc.setLocalDescription(answer);
    console.log("[WebRTC] Answer created and set as local description");

    return answer;
  }

  async handleAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.pc || this.pc.signalingState === "closed") {
      console.warn("[WebRTC] Cannot handle answer - PeerConnection is not ready");
      return;
    }

    console.log("[WebRTC] Received answer, setting remote description...");
    await this.pc.setRemoteDescription(new RTCSessionDescription(answer));
    await this.flushPendingIceCandidates();
    console.log("[WebRTC] Remote description set from answer");
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    console.log("[WebRTC] Received ICE candidate");

    if (!this.pc || !this.pc.remoteDescription) {
      console.log("[WebRTC] Remote description not ready, buffering ICE candidate");
      this.pendingIceCandidates.push(candidate);
      return;
    }

    await safeAddIceCandidate(this.pc, candidate);
  }

  private async flushPendingIceCandidates(): Promise<void> {
    if (!this.pc || !this.pc.remoteDescription || this.pendingIceCandidates.length === 0) {
      return;
    }

    const candidates = [...this.pendingIceCandidates];
    this.pendingIceCandidates = [];

    console.log(`[WebRTC] Flushing ${candidates.length} buffered ICE candidate(s)`);

    for (const candidate of candidates) {
      await safeAddIceCandidate(this.pc, candidate);
    }
  }

  setMuted(muted: boolean): void {
    setAudioEnabled(this.localStream, !muted);
  }

  setCameraOff(cameraOff: boolean): void {
    setVideoEnabled(this.localStream, !cameraOff);
  }

  cleanup(): void {
    console.log("[WebRTC] Cleaning up WebRTCManager...");
    stopStream(this.localStream);

    this.pc?.close();
    this.pc = null;

    this.localStream = null;
    this.remoteStream = null;
    this.pendingOffer = null;
    this.pendingIceCandidates = [];

    this.events.onLocalStream(null);
    this.events.onRemoteStream(null);
    console.log("[WebRTC] WebRTCManager cleanup done");
  }
}
