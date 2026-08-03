import { useCallback, useState } from "react";

export interface TaskControl {
  loading: boolean;
  error: string;
  setError: (message: string) => void;
  clearError: () => void;
  run: (fn: () => Promise<void>) => Promise<void>;
}

export function useTask(): TaskControl {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const run = useCallback(async (fn: () => Promise<void>) => {
    setLoading(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(""), []);

  return { loading, error, setError, clearError, run };
}
