/**
 * ICE candidate utilities
 */

export async function safeAddIceCandidate(
  pc: RTCPeerConnection | null,
  candidate: RTCIceCandidateInit
): Promise<void> {
  if (!pc || pc.signalingState === "closed") {
    console.warn("[WebRTC] Cannot add ICE candidate - PeerConnection is not ready");
    return;
  }

  try {
    await pc.addIceCandidate(new RTCIceCandidate(candidate));
  } catch (err) {
    console.warn("[WebRTC] Failed to add ICE candidate:", err);
  }
}
