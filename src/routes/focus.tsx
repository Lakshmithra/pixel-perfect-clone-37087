import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Eye, Lock, Pause, Play, RotateCcw, Sparkles, Unlock } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Shell } from "@/components/planora/Shell";
import { GlassCard, QuestButton, SectionTitle } from "@/components/planora/ui";
import { usePlanora } from "@/lib/planora/store";
import { todayKey } from "@/lib/planora/plan";
import { TowerIcon } from "./planner";

export const Route = createFileRoute("/focus")({
  head: () => ({
    meta: [
      { title: "Focus chamber — Planora" },
      {
        name: "description",
        content:
          "A Pomodoro timer in a glowing ring, plus a distraction locker that counts every tab switch and earns you bricks.",
      },
      { property: "og:title", content: "Focus chamber — Planora" },
      {
        property: "og:description",
        content: "Pomodoro focus sessions, distraction counting, and bricks for your castle.",
      },
    ],
  }),
  component: Focus,
});

const PRESETS = [25, 45, 15];

function Focus() {
  const { state, addSession } = usePlanora();
  const [minutes, setMinutes] = useState(25);
  const [left, setLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [locked, setLocked] = useState(false);
  const [switches, setSwitches] = useState(0);
  const [subjectId, setSubjectId] = useState(state.subjects[0]?.id ?? "");
  const [earned, setEarned] = useState<number | null>(null);
  const done = useRef(false);

  useEffect(() => {
    if (!subjectId && state.subjects[0]) setSubjectId(state.subjects[0].id);
  }, [state.subjects, subjectId]);

  const complete = useCallback(() => {
    if (done.current) return;
    done.current = true;
    const bricks = Math.max(1, Math.round(minutes / 5));
    addSession({ subjectId, minutes, date: todayKey(), distractions: switches });
    setEarned(bricks);
    setRunning(false);
    setLocked(false);
  }, [addSession, minutes, subjectId, switches]);

  useEffect(() => {
    if (!running) return;
    const t = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          complete();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [running, complete]);

  useEffect(() => {
    if (!locked) return;
    const onHide = () => {
      if (document.hidden) setSwitches((n) => n + 1);
    };
    window.addEventListener("visibilitychange", onHide);
    window.addEventListener("blur", onHide);
    return () => {
      window.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("blur", onHide);
    };
  }, [locked]);

  const total = minutes * 60;
  const progress = 1 - left / total;
  const R = 130;
  const C = 2 * Math.PI * R;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  function reset(m = minutes) {
    done.current = false;
    setMinutes(m);
    setLeft(m * 60);
    setRunning(false);
    setEarned(null);
  }

  const ring = (
    <div className="relative mx-auto h-[300px] w-[300px]">
      <motion.div
        className="absolute inset-4 rounded-full bg-primary/25 blur-2xl"
        animate={{ scale: running ? [1, 1.08, 1] : 1, opacity: running ? [0.5, 0.9, 0.5] : 0.4 }}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <svg viewBox="0 0 300 300" className="relative h-full w-full -rotate-90">
        <circle cx="150" cy="150" r={R} fill="none" stroke="var(--border)" strokeWidth="14" />
        <motion.circle
          cx="150"
          cy="150"
          r={R}
          fill="none"
          stroke="var(--gold)"
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={C}
          animate={{ strokeDashoffset: C * (1 - progress) }}
          transition={{ duration: 0.4 }}
          style={{ filter: "drop-shadow(0 0 10px var(--gold))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="font-display text-6xl font-extrabold text-glow tabular-nums">
          {mm}:{ss}
        </p>
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {running ? "focusing" : left === 0 ? "session complete" : "ready"}
        </p>
      </div>
    </div>
  );

  if (locked) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-background px-4 text-center">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-sky-top via-background to-sky-bottom opacity-90" />
        <div className="relative">
          <p className="mb-2 flex items-center justify-center gap-2 font-display text-xl font-bold">
            <Lock className="h-5 w-5 text-gold" /> Distraction locker sealed
          </p>
          {ring}
          <p className="mt-4 text-sm text-muted-foreground">
            Tab switches counted: <span className="font-bold text-foreground">{switches}</span>
          </p>
          <div className="mt-6 flex justify-center gap-2">
            <QuestButton variant="ghost" onClick={() => setRunning((r) => !r)}>
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "Pause" : "Resume"}
            </QuestButton>
            <QuestButton variant="gold" onClick={() => setLocked(false)}>
              <Unlock className="h-4 w-4" /> Leave locker
            </QuestButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Shell>
      <SectionTitle
        title="The focus chamber"
        subtitle="Each finished session lays bricks for your castle."
      />
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <GlassCard className="text-center">
          {ring}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {PRESETS.map((m) => (
              <button
                key={m}
                onClick={() => reset(m)}
                className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                  minutes === m ? "gradient-magic text-primary-foreground" : "glass"
                }`}
              >
                {m} min
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <QuestButton
              onClick={() => {
                done.current = false;
                setRunning((r) => !r);
              }}
            >
              {running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {running ? "Pause" : "Start session"}
            </QuestButton>
            <QuestButton variant="ghost" onClick={() => reset()}>
              <RotateCcw className="h-4 w-4" /> Reset
            </QuestButton>
            <QuestButton variant="gold" onClick={() => setLocked(true)}>
              <Lock className="h-4 w-4" /> Distraction locker
            </QuestButton>
          </div>
          {earned !== null && (
            <motion.p
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 flex items-center justify-center gap-2 font-display text-lg font-bold text-glow"
            >
              <Sparkles className="h-5 w-5 text-gold" /> +{earned} bricks earned!
            </motion.p>
          )}
        </GlassCard>

        <GlassCard delay={0.1} className="h-fit">
          <h2 className="font-display text-xl font-bold">Which tower are you building?</h2>
          <div className="mt-3 space-y-2">
            {state.subjects.map((s) => (
              <button
                key={s.id}
                onClick={() => setSubjectId(s.id)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-semibold transition-all ${
                  subjectId === s.id ? "glass" : "hover:bg-accent/15"
                }`}
              >
                <TowerIcon color={`var(${s.colorVar})`} />
                {s.name}
              </button>
            ))}
          </div>
          <div className="mt-5 space-y-2 rounded-2xl bg-secondary/40 p-4 text-sm">
            <p className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-gold" /> Distractions this session: <b>{switches}</b>
            </p>
            <p className="text-xs text-muted-foreground">
              The locker fills the screen and counts every time you leave the tab.
            </p>
          </div>
        </GlassCard>
      </div>
    </Shell>
  );
}
