/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { api } from "./client";
import type { AppState, User } from "../types";

export const DEFAULT_STATE: AppState = {
  niche: "coding, software development and CS student content on YouTube",
  trends: [],
  ideas: [],
  competitors: [],
  recommendations: [],
  calendar: [],
  alerts: [],
  titles: [],
  script: null,
  pkg: null,
  keywords: [],
  research: null,
  videoPlan: [],
  planScripts: {},
};

type StatePatch =
  | Partial<AppState>
  | ((prev: AppState) => AppState);

interface Store {
  user: User | null;
  booting: boolean;
  ready: boolean;
  state: AppState;
  setState: (patch: StatePatch) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
}

const StoreCtx = createContext<Store | null>(null);

function mergeState(stored: Partial<AppState>): AppState {
  return { ...DEFAULT_STATE, ...stored };
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [state, setStateState] = useState<AppState>(DEFAULT_STATE);
  const [booting, setBooting] = useState(true);
  const [ready, setReady] = useState(false);
  const stateRef = useRef(state);
  const saveTimer = useRef<number | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!user || !ready) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      api.put("/api/state", { state: stateRef.current }).catch(() => {});
    }, 400);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [state, user, ready]);

  const setState = useCallback((patch: StatePatch) => {
    setStateState((prev) =>
      typeof patch === "function" ? patch(prev) : { ...prev, ...patch }
    );
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const me = await api.get<{ user: User }>("/api/auth/me");
        setUser(me.user);
        const res = await api.get<{ state: Partial<AppState> }>("/api/state");
        setStateState(mergeState(res.state));
        setReady(true);
      } catch {
        setUser(null);
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  useEffect(() => {
    const onExpired = () => {
      setUser(null);
      setReady(false);
      setStateState(DEFAULT_STATE);
    };
    window.addEventListener("auth:expired", onExpired);
    return () => window.removeEventListener("auth:expired", onExpired);
  }, []);

  const loadUserState = useCallback(async () => {
    const me = await api.get<{ user: User }>("/api/auth/me");
    setUser(me.user);
    const res = await api.get<{ state: Partial<AppState> }>("/api/state");
    setStateState(mergeState(res.state));
    setReady(true);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      await api.post<{ user: User }>("/api/auth/login", { email, password });
      await loadUserState();
    },
    [loadUserState]
  );

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      await api.post<{ user: User }>("/api/auth/register", {
        email,
        password,
        name,
      });
      await loadUserState();
    },
    [loadUserState]
  );

  const logout = useCallback(async () => {
    try {
      await api.put("/api/state", { state: stateRef.current });
    } catch {
      // best-effort flush
    }
    try {
      await api.post("/api/auth/logout");
    } catch {
      // ignore
    }
    setUser(null);
    setReady(false);
    setStateState(DEFAULT_STATE);
  }, []);

  const value = useMemo<Store>(
    () => ({ user, booting, ready, state, setState, login, register, logout }),
    [user, booting, ready, state, setState, login, register, logout]
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useAppState<K extends keyof AppState>(
  key: K
): [AppState[K], (value: AppState[K]) => void] {
  const { state, setState } = useStore();
  const value = state[key];
  const set = useCallback(
    (next: AppState[K]) => setState({ [key]: next } as Partial<AppState>),
    [key, setState]
  );
  return [value, set];
}
