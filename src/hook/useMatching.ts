import { useEffect, useState, useCallback } from "react";
import { socketService, type MatchFoundPayload } from "../services/socket.service";

// ─── Types ───────────────────────────────────────────────────

export type MatchStatus =
  | "idle"
  | "connecting"
  | "waiting"
  | "matched"
  | "timeout"
  | "error";

export interface UseMatchingReturn {
  status: MatchStatus;
  matchData: MatchFoundPayload | null;
  errorMessage: string | null;
  startMatching: (language: string) => void;
  cancelMatching: () => void;
}

// ─── Hook ────────────────────────────────────────────────────

export function useMatching(): UseMatchingReturn {
  const [status, setStatus] = useState<MatchStatus>("idle");
  const [matchData, setMatchData] = useState<MatchFoundPayload | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const startMatching = useCallback((language: string) => {
    setStatus("connecting");
    setMatchData(null);
    setErrorMessage(null);

    const socket = socketService.connect();

    const init = () => {
      setStatus("waiting");
      socketService.joinQueue(language);
    };

    // Nếu đã connected thì join ngay, không thì chờ connect event
    if (socket.connected) {
      init();
    } else {
      socket.once("connect", init);
    }

    // ── Listeners ──────────────────────────────────────────

    socketService.onWaitingStatus(() => {
      setStatus("waiting");
    });

    socketService.onMatchFound((payload) => {
      setStatus("matched");
      setMatchData(payload);
    });

    socketService.onQueueTimeout((payload) => {
      setStatus("timeout");
      setErrorMessage(payload.message);
    });

    socketService.onError((message) => {
      setStatus("error");
      setErrorMessage(message);
    });
  }, []);

  const cancelMatching = useCallback(() => {
    socketService.leaveQueue();
    socketService.offMatchingEvents();
    setStatus("idle");
    setMatchData(null);
    setErrorMessage(null);
  }, []);

  // Cleanup khi unmount
  useEffect(() => {
    return () => {
      socketService.offMatchingEvents();
    };
  }, []);

  return { status, matchData, errorMessage, startMatching, cancelMatching };
}
