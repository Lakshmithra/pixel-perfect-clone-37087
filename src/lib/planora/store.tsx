import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Energy, PlanoraState, StudySession, Subject } from "./types";
import { dateKey, todayKey } from "./plan";

const KEY = "planora.state.v1";

export const SUBJECT_COLORS = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"];

function seedState(): PlanoraState {
  const subjects: Subject[] = [
    {
      id: "s1",
      name: "Organic Chemistry",
      examDate: dateKey(6),
      difficulty: 5,
      confidence: 2,
      colorVar: "--chart-1",
    },
    {
      id: "s2",
      name: "Calculus II",
      examDate: dateKey(12),
      difficulty: 4,
      confidence: 3,
      colorVar: "--chart-2",
    },
    {
      id: "s3",
      name: "World History",
      examDate: dateKey(20),
      difficulty: 2,
      confidence: 4,
      colorVar: "--chart-3",
    },
    {
      id: "s4",
      name: "Physics — Waves",
      examDate: dateKey(9),
      difficulty: 4,
      confidence: 2,
      colorVar: "--chart-4",
    },
  ];
  const sessions: StudySession[] = [];
  let n = 0;
  for (let d = 9; d >= 0; d--) {
    if (d === 4) continue; // a missed day, so fog/cracks are visible
    const perDay = 2 + ((d * 7) % 3);
    for (let i = 0; i < perDay; i++) {
      const subj = subjects[(d + i) % subjects.length]!;
      sessions.push({
        id: `seed${n++}`,
        subjectId: subj.id,
        minutes: 25 + ((d + i) % 3) * 15,
        date: dateKey(-d),
        distractions: (d + i) % 4,
      });
    }
  }
  return {
    onboarded: false,
    name: "",
    course: "",
    dailyHours: 5,
    peakType: "sunrise",
    subjects,
    sessions,
    bricks: 42,
    energy: "medium",
    restDays: [],
    rewards: [],
    theme: "auto",
  };
}

interface Ctx {
  state: PlanoraState;
  loading: boolean;
  update: (patch: Partial<PlanoraState>) => void;
  addSession: (s: Omit<StudySession, "id">) => void;
  setEnergy: (e: Energy) => void;
  toggleRestDay: (date?: string) => void;
  addReward: (text: string) => void;
  reset: () => void;
  isNight: boolean;
}

// Keep a single context instance even if this module is evaluated twice
// (dev hot-reload or split route chunks), otherwise consumers read a fresh
// empty context and crash with "must be used inside PlanoraProvider".
const CTX_KEY = "__planora_context__";
const globalScope = globalThis as unknown as Record<string, unknown>;
const PlanoraContext = (globalScope[CTX_KEY] ??
  (globalScope[CTX_KEY] = createContext<Ctx | null>(null))) as React.Context<Ctx | null>;

export function PlanoraProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PlanoraState>(seedState);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => new Date().getHours());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...seedState(), ...(JSON.parse(raw) as PlanoraState) });
    } catch {
      /* ignore corrupt storage */
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, loading]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date().getHours()), 60000);
    return () => clearInterval(t);
  }, []);

  const isNight = useMemo(() => {
    if (state.theme === "night") return true;
    if (state.theme === "day") return false;
    if (state.peakType === "moonlight") return now >= 17 || now < 6;
    return now >= 19 || now < 6;
  }, [state.theme, state.peakType, now]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", isNight);
  }, [isNight]);

  const value: Ctx = {
    state,
    loading,
    isNight,
    update: (patch) => setState((s) => ({ ...s, ...patch })),
    addSession: (s) =>
      setState((p) => ({
        ...p,
        sessions: [...p.sessions, { ...s, id: `x${Date.now()}` }],
        bricks: p.bricks + Math.max(1, Math.round(s.minutes / 5)),
      })),
    setEnergy: (energy) => setState((p) => ({ ...p, energy })),
    toggleRestDay: (date = todayKey()) =>
      setState((p) => ({
        ...p,
        restDays: p.restDays.includes(date)
          ? p.restDays.filter((d) => d !== date)
          : [...p.restDays, date],
      })),
    addReward: (text) =>
      setState((p) => ({ ...p, rewards: [{ date: todayKey(), text }, ...p.rewards].slice(0, 20) })),
    reset: () => {
      localStorage.removeItem(KEY);
      setState(seedState());
    },
  };

  return <PlanoraContext.Provider value={value}>{children}</PlanoraContext.Provider>;
}

export function usePlanora() {
  const ctx = useContext(PlanoraContext);
  if (!ctx) throw new Error("usePlanora must be used inside PlanoraProvider");
  return ctx;
}

/* ---------- derived stats ---------- */

export function minutesByDate(sessions: StudySession[]) {
  const map = new Map<string, number>();
  for (const s of sessions) map.set(s.date, (map.get(s.date) ?? 0) + s.minutes);
  return map;
}

export function streakOf(sessions: StudySession[]) {
  const map = minutesByDate(sessions);
  let streak = 0;
  for (let d = 0; d < 400; d++) {
    const key = dateKey(-d);
    if ((map.get(key) ?? 0) > 0) streak++;
    else if (d > 0) break;
  }
  return streak;
}

export function missedRecently(sessions: StudySession[]) {
  const map = minutesByDate(sessions);
  let missed = 0;
  for (let d = 1; d <= 7; d++) if (!(map.get(dateKey(-d))! > 0)) missed++;
  return missed;
}

export function subjectMinutes(sessions: StudySession[], subjectId: string) {
  return sessions.filter((s) => s.subjectId === subjectId).reduce((a, s) => a + s.minutes, 0);
}

export function readiness(sessions: StudySession[], subject: Subject) {
  const hours = subjectMinutes(sessions, subject.id) / 60;
  const target = subject.difficulty * 6;
  const base = Math.min(1, hours / target);
  const conf = subject.confidence / 5;
  return Math.round(Math.min(100, (base * 0.7 + conf * 0.3) * 100));
}

export function todayMinutes(sessions: StudySession[]) {
  return minutesByDate(sessions).get(todayKey()) ?? 0;
}

export function weeklySeries(sessions: StudySession[]) {
  const map = minutesByDate(sessions);
  return Array.from({ length: 7 }, (_, i) => {
    const d = dateKey(-(6 - i));
    return {
      day: new Date(d + "T00:00:00").toLocaleDateString(undefined, { weekday: "short" }),
      hours: Math.round(((map.get(d) ?? 0) / 60) * 10) / 10,
    };
  });
}
