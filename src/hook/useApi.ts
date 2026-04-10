import { useState, useCallback } from "react";
import type { AxiosError, AxiosRequestConfig } from "axios";
import instance from "../library/axios.customize";

// ─── Types ───────────────────────────────────────────────────

export type ApiStatus = "idle" | "loading" | "success" | "error";

export interface ApiState<T> {
  data: T | null;
  status: ApiStatus;
  error: string | null;
}

export interface UseApiReturn<T> extends ApiState<T> {
  execute: (config: AxiosRequestConfig) => Promise<T | null>;
  reset: () => void;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

// ─── Hook ────────────────────────────────────────────────────

export function useApi<T = unknown>(): UseApiReturn<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    status: "idle",
    error: null,
  });

  const execute = useCallback(async (config: AxiosRequestConfig): Promise<T | null> => {
    setState({ data: null, status: "loading", error: null });

    try {
      const response = await instance.request<T>(config);
      setState({ data: response.data, status: "success", error: null });
      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      const message =
        axiosError.response?.data?.message ??
        axiosError.message ??
        "Something went wrong";

      setState({ data: null, status: "error", error: message });
      return null;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, status: "idle", error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isLoading: state.status === "loading",
    isSuccess: state.status === "success",
    isError: state.status === "error",
  };
}
