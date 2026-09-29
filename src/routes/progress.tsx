import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Flame, ScrollText } from "lucide-react";
import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Shell } from "@/components/planora/Shell";
import { EmptyState, GlassCard, SectionTitle, Spinner } from "@/components/planora/ui";
import { readiness, streakOf, subjectMinutes, usePlanora, weeklySeries } from "@/lib/planora/store";
import { callAI } from "@/lib/planora/ai";
import { TowerIcon } from "./planner";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress scrolls — Planora" },
      {
        name: "description",
        content:
          "Weekly study hours, readiness per subject, streak count and an AI-written weekly summary of your kingdom.",
      },
      { property: "og:title", content: "Progress scrolls — Planora" },
      {
        property: "og:description",
        content: "Weekly hours, readiness bars, streaks and an AI weekly summary.",
      },
    ],
  }),
  component: Progress,
});

function Progress() {
  const { state } = usePlanora();
  const series = weeklySeries(state.sessions);
  const streak = streakOf(state.sessions);
  const totalWeek = series.reduce((a, d) => a + d.hours, 0);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    callAI(`Write a weekly summary for ${state.name || "the student"}`).then((t) => {
      if (alive) setSummary(t);
    });
    return () => {
      alive = false;
    };
  }, [state.name]);

  if (state.sessions.length === 0) {
    return (
      <Shell>
        <EmptyState title="No scrolls written yet" hint="Finish a focus session and your progress appears here." />
      </Shell>
    );
  }

  return (
    <Shell>
      <SectionTitle
        title="Progress scrolls"
        subtitle={`${totalWeek.toFixed(1)}h studied in the last 7 days`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <GlassCard className="lg:col-span-2">
          <h2 className="font-display text-xl font-bold">Hours this week</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} unit="h" />
                <Tooltip
                  contentStyle={{
                    background: "var(--popover)",
                    border: "1px solid var(--border)",
                    borderRadius: 16,
                    color: "var(--popover-foreground)",
                  }}
                />
                <Bar dataKey="hours" fill="var(--primary)" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard delay={0.08} className="text-center">
          <h2 className="font-display text-xl font-bold">Streak</h2>
          <motion.p
            className="mt-6 flex items-center justify-center gap-2 font-display text-6xl font-extrabold text-glow"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.4, repeat: Infinity }}
          >
            <Flame className="h-10 w-10 text-gold" />
            {streak}
          </motion.p>
          <p className="mt-2 text-sm text-muted-foreground">consecutive study days</p>
          <p className="mt-6 text-sm font-semibold">{state.bricks} bricks laid in total</p>
        </GlassCard>

        <GlassCard delay={0.12} className="lg:col-span-2">
          <h2 className="font-display text-xl font-bold">Exam readiness</h2>
          <ul className="mt-4 space-y-4">
            {state.subjects.map((s) => {
              const pct = readiness(state.sessions, s);
              return (
                <li key={s.id}>
                  <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                    <TowerIcon color={`var(${s.colorVar})`} />
                    {s.name}
                    <span className="ml-auto text-xs text-muted-foreground">
                      {(subjectMinutes(state.sessions, s.id) / 60).toFixed(1)}h · {pct}%
                    </span>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: `var(${s.colorVar})` }}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </GlassCard>

        <GlassCard delay={0.16}>
          <h2 className="flex items-center gap-2 font-display text-xl font-bold">
            <ScrollText className="h-5 w-5 text-gold" /> Weekly summary
          </h2>
          {summary ? (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{summary}</p>
          ) : (
            <div className="mt-3">
              <Spinner label="The scribe is writing…" />
            </div>
          )}
        </GlassCard>
      </div>
    </Shell>
  );
}
