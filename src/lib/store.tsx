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
import type { AppState, User, Project, ProjectType, Idea } from "../types";

export const DEFAULT_STATE: AppState = {
  niche: "coding, software development and CS student content on YouTube",
  currentProjectId: null,
  projects: [],
  savedIdeas: [],
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

export interface Store {
  user: User | null;
  booting: boolean;
  ready: boolean;
  state: AppState;
  activeProject: Project | null;
  setState: (patch: StatePatch) => void;
  createProject: (data: Partial<Project> & { title: string; contentType?: ProjectType }) => Project;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project | null;
  setCurrentProject: (id: string | null) => void;
  saveIdea: (idea: Idea) => void;
  removeSavedIdea: (id: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<User>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

const StoreCtx = createContext<Store | null>(null);

function mergeState(stored: Partial<AppState>): AppState {
  return {
    ...DEFAULT_STATE,
    ...stored,
    projects: Array.isArray(stored?.projects) ? stored.projects : [],
    savedIdeas: Array.isArray(stored?.savedIdeas) ? stored.savedIdeas : [],
  };
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

  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      const res = await api.put<{ user: User }>("/api/auth/profile", data);
      setUser(res.user);
      if (data.niche) {
        setState((prev) => ({ ...prev, niche: data.niche! }));
      }
      return res.user;
    },
    [setState]
  );

  const updatePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      await api.put<{ ok: boolean; message: string }>("/api/auth/password", {
        currentPassword,
        newPassword,
      });
    },
    []
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

  const createProject = useCallback(
    (data: Partial<Project> & { title: string; contentType?: ProjectType }): Project => {
      const now = new Date().toISOString();
      const newProj: Project = {
        contentType: "Short",
        status: "Draft",
        progressPercent: 15,
        targetAudience: user?.target_audience || "YouTube Viewers",
        language: "English",
        tone: user?.tone || "Direct & Punchy",
        creatorMode: "Educator",
        visualStyle: "Cinematic & High-Contrast",
        ...data,
        id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title: data.title.trim(),
        topic: data.topic?.trim() || data.title.trim(),
        createdAt: now,
        updatedAt: now,
      };

      setState((prev) => ({
        ...prev,
        projects: [newProj, ...(prev.projects || [])],
        currentProjectId: newProj.id,
      }));

      return newProj;
    },
    [setState, user]
  );

  const updateProject = useCallback(
    (id: string, patch: Partial<Project>) => {
      const now = new Date().toISOString();
      setState((prev) => {
        const updated = (prev.projects || []).map((p) => {
          if (p.id !== id) return p;
          return {
            ...p,
            ...patch,
            updatedAt: now,
          };
        });
        return { ...prev, projects: updated };
      });
    },
    [setState]
  );

  const deleteProject = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        projects: (prev.projects || []).filter((p) => p.id !== id),
        currentProjectId: prev.currentProjectId === id ? null : prev.currentProjectId,
      }));
    },
    [setState]
  );

  const duplicateProject = useCallback(
    (id: string): Project | null => {
      const target = (state.projects || []).find((p) => p.id === id);
      if (!target) return null;
      const now = new Date().toISOString();
      const clone: Project = {
        ...target,
        id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title: `${target.title} (Copy)`,
        createdAt: now,
        updatedAt: now,
        status: "Draft",
      };
      setState((prev) => ({
        ...prev,
        projects: [clone, ...(prev.projects || [])],
        currentProjectId: clone.id,
      }));
      return clone;
    },
    [state.projects, setState]
  );

  const setCurrentProject = useCallback(
    (id: string | null) => {
      setState((prev) => ({ ...prev, currentProjectId: id }));
    },
    [setState]
  );

  const saveIdea = useCallback(
    (idea: Idea) => {
      setState((prev) => {
        const exists = (prev.savedIdeas || []).some(
          (i) => i.id === idea.id || i.title.toLowerCase() === idea.title.toLowerCase()
        );
        if (exists) return prev;
        return {
          ...prev,
          savedIdeas: [idea, ...(prev.savedIdeas || [])],
        };
      });
    },
    [setState]
  );

  const removeSavedIdea = useCallback(
    (id: string) => {
      setState((prev) => ({
        ...prev,
        savedIdeas: (prev.savedIdeas || []).filter((i) => i.id !== id),
      }));
    },
    [setState]
  );

  const activeProject = useMemo(() => {
    if (!state.currentProjectId) return state.projects?.[0] || null;
    return state.projects?.find((p) => p.id === state.currentProjectId) || state.projects?.[0] || null;
  }, [state.currentProjectId, state.projects]);

  const value = useMemo<Store>(
    () => ({
      user,
      booting,
      ready,
      state,
      activeProject,
      setState,
      createProject,
      updateProject,
      deleteProject,
      duplicateProject,
      setCurrentProject,
      saveIdea,
      removeSavedIdea,
      login,
      register,
      logout,
      updateProfile,
      updatePassword,
    }),
    [
      user,
      booting,
      ready,
      state,
      activeProject,
      setState,
      createProject,
      updateProject,
      deleteProject,
      duplicateProject,
      setCurrentProject,
      saveIdea,
      removeSavedIdea,
      login,
      register,
      logout,
      updateProfile,
      updatePassword,
    ]
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
