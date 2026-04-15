import { useEffect, useState, useCallback, useRef } from "react";
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

    // Đăng ký listeners trực tiếp trên socket instance — tránh race condition
    socket.off("waiting_status").on("waiting_status", () => {
      setStatus("waiting");
    });

    socket.off("match_found").on("match_found", (payload: MatchFoundPayload) => {
      console.log("[useMatching] match_found:", payload);
      setStatus("matched");
      setMatchData(payload);
    });

    socket.off("queue_timeout").on("queue_timeout", (payload: { message: string }) => {
      setStatus("timeout");
      setErrorMessage(payload.message);
    });

    socket.off("error").on("error", (message: string) => {
      setStatus("error");
      setErrorMessage(message);
    });

    const join = () => {
      setStatus("waiting");
      socketService.joinQueue(language);
    };

    if (socket.connected) {
      join();
    } else {
      socket.once("connect", join);
    }
  }, []);

  const cancelMatching = useCallback(() => {
    socketService.leaveQueue();
    socketService.offMatchingEvents();
    setStatus("idle");
    setMatchData(null);
    setErrorMessage(null);
  }, []);

  // Cleanup khi unmount — chỉ leave nếu chưa matched
  const statusRef = useRef<MatchStatus>("idle");
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    return () => {
      socketService.offMatchingEvents();
      // Không emit leave_queue nếu đã match thành công
      if (statusRef.current !== "matched") {
        socketService.leaveQueue();
      }
    };
  }, []);

  return { status, matchData, errorMessage, startMatching, cancelMatching };
}
