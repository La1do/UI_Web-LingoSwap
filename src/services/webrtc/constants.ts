// STUN/TURN servers configuration
export const ICE_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    // TODO: Add TURN servers for production:
    // {
    //   urls: "turn:your-domain.com:3478",
    //   username: "username",
    //   credential: "password",
    // },
  ],
};
