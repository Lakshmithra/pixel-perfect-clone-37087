import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  BatteryLow,
  BatteryMedium,
  BatteryFull,
  Coffee,
  HelpCircle,
  Moon,
  Sparkles,
  Sun,
  Tent,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Shell } from "@/components/planora/Shell";
import { EmptyState, GlassCard, QuestButton, SectionTitle } from "@/components/planora/ui";
import { usePlanora } from "@/lib/planora/store";
import { formatHour, generatePlan, peakWindow, todayKey } from "@/lib/planora/plan";
import type { Energy } from "@/lib/planora/types";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Today's plan — Planora" },
      {
        name: "description",
        content:
          "An AI day-by-day study schedule with blocks, breaks, sleep window and reasons behind every choice.",
      },
      { property: "og:title", content: "Today's plan — Planora" },
      {
        property: "og:description",
        content: "Study blocks placed by exam proximity, difficulty and confidence — with reasons.",
      },
    ],
  }),
  component: Planner,
});

const ENERGY: { key: Energy; label: string; icon: typeof BatteryLow }[] = [
  { key: "low", label: "Low", icon: BatteryLow },
  { key: "medium", label: "Medium", icon: BatteryMedium },
  { key: "high", label: "High", icon: BatteryFull },
];

function Planner() {
  const { state, setEnergy, toggleRestDay } = usePlanora();
  const [showWhy, setShowWhy] = useState(false);
  const restDay = state.restDays.includes(todayKey());
  const [peakStart, peakEnd] = peakWindow(state.peakType);

  const blocks = useMemo(
    () =>
      generatePlan({
        subjects: state.subjects,
        dailyHours: state.dailyHours,
        peakType: state.peakType,
        energy: state.energy,
        restDay,
      }),
    [state.subjects, state.dailyHours, state.peakType, state.energy, restDay],
  );

  const subjectOf = (id?: string) => state.subjects.find((s) => s.id === id);
  const studyHours = blocks
    .filter((b) => b.kind === "study")
    .reduce((a, b) => a + (b.end - b.start), 0);

  return (
    <Shell>
      <SectionTitle
        title={restDay ? "A quiet day in the realm" : "Today's royal schedule"}
        subtitle={`${state.peakType === "sunrise" ? "Sunrise Knight" : "Moonlight Wizard"} · peak hours ${formatHour(peakStart)}–${formatHour(peakEnd)} · ${studyHours.toFixed(1)}h of study planned`}
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        <QuestButton variant={showWhy ? "gold" : "ghost"} onClick={() => setShowWhy((v) => !v)}>
          <HelpCircle className="h-4 w-4" /> Why this plan?
        </QuestButton>
        <QuestButton variant={restDay ? "gold" : "ghost"} onClick={() => toggleRestDay()}>
          <Tent className="h-4 w-4" /> {restDay ? "Resume plan" : "Rest day"}
        </QuestButton>
        <div className="glass ml-auto flex items-center gap-1 rounded-full p-1">
          {ENERGY.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setEnergy(key)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
                state.energy === key
                  ? "gradient-magic text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </div>

      {state.subjects.length === 0 ? (
        <EmptyState
          title="No towers yet"
          hint="Add subjects in onboarding and your schedule will build itself."
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-3">
            {blocks.map((b, i) => {
              const subject = subjectOf(b.subjectId);
              const accent = subject ? `var(${subject.colorVar})` : "var(--muted-foreground)";
              return (
                <motion.article
                  key={b.id}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass rounded-3xl p-4"
                  style={{ borderLeft: `6px solid ${accent}` }}
                >
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="w-36 shrink-0 text-xs font-bold text-muted-foreground">
                      {formatHour(b.start)} – {formatHour(b.end % 24)}
                    </span>
                    <span className="flex items-center gap-2 font-display text-lg font-bold">
                      {b.kind === "study" && <TowerIcon color={accent} />}
                      {b.kind === "break" && <Coffee className="h-4 w-4 text-gold" />}
                      {b.kind === "free" && <Sparkles className="h-4 w-4 text-gold" />}
                      {b.kind === "sleep" && <Moon className="h-4 w-4 text-gold" />}
                      {b.label}
                    </span>
                    <span
                      className="ml-auto rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider"
                      style={{ backgroundColor: `color-mix(in oklab, ${accent} 22%, transparent)` }}
                    >
                      {b.kind}
                    </span>
                  </div>
                  <AnimatePresence>
                    {showWhy && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 overflow-hidden text-sm text-muted-foreground"
                      >
                        {b.reason}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.article>
              );
            })}
          </div>

          <GlassCard delay={0.1} className="h-fit">
            <h2 className="font-display text-xl font-bold">Priority scroll</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              exam proximity × difficulty × low confidence
            </p>
            <ul className="space-y-3">
              {[...state.subjects]
                .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
                .map((s) => (
                  <li key={s.id} className="flex items-center gap-3">
                    <TowerIcon color={`var(${s.colorVar})`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{s.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Exam {new Date(s.examDate + "T00:00:00").toLocaleDateString()} · diff{" "}
                        {s.difficulty}/5 · conf {s.confidence}/5
                      </p>
                    </div>
                  </li>
                ))}
            </ul>
            <div className="mt-5 flex items-center gap-2 rounded-2xl bg-secondary/40 p-3 text-xs">
              {state.peakType === "sunrise" ? (
                <Sun className="h-4 w-4 text-gold" />
              ) : (
                <Moon className="h-4 w-4 text-gold" />
              )}
              Hard subjects are pinned to your peak hours.
            </div>
          </GlassCard>
        </div>
      )}
    </Shell>
  );
}

export function TowerIcon({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M6 22V8l2-1.5V4l2 1.5L12 3l2 2.5L16 4v2.5L18 8v14z"
        fill={color}
        stroke="var(--gold)"
        strokeWidth="1"
      />
      <rect x="10.5" y="15" width="3" height="7" rx="1.5" fill="var(--gold)" opacity="0.8" />
    </svg>
  );
}
