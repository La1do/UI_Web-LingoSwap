import { ICE_SERVERS } from "./constants";

interface CreatePeerConnectionParams {
  onIceCandidate: (candidate: RTCIceCandidate) => void;
  onTrack: (track: MediaStreamTrack, streams: readonly MediaStream[]) => void;
  onConnectionStateChange: (state: RTCPeerConnectionState) => void;
  onIceGatheringStateChange?: (state: RTCIceGatheringState) => void;
  onSignalingStateChange?: (state: RTCSignalingState) => void;
}

export function createPeerConnection({
  onIceCandidate,
  onTrack,
  onConnectionStateChange,
  onIceGatheringStateChange,
  onSignalingStateChange,
}: CreatePeerConnectionParams): RTCPeerConnection {
  const pc = new RTCPeerConnection(ICE_SERVERS);

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  };

  pc.ontrack = (event) => {
    onTrack(event.track, event.streams);
  };

  pc.onconnectionstatechange = () => {
    console.log(`[WebRTC] Connection state: ${pc.connectionState}`);
    onConnectionStateChange(pc.connectionState);
  };

  pc.onicegatheringstatechange = () => {
    console.log(`[WebRTC] ICE gathering state: ${pc.iceGatheringState}`);
    onIceGatheringStateChange?.(pc.iceGatheringState);
  };

  pc.onsignalingstatechange = () => {
    console.log(`[WebRTC] Signaling state: ${pc.signalingState}`);
    onSignalingStateChange?.(pc.signalingState);
  };

  return pc;
}
